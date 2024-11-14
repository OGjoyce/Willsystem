import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Dropdown, Card, Form, InputGroup, Alert } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CustomToast from '../AdditionalComponents/CustomToast';
import { sendDocumentsForApproval, isDocumentUnlocked, areAllDocumentsUnlocked, getLastUnlockedDocument } from '@/utils/documentsUtils';
import AdditionalFeeCard from '../AdditionalComponents/AdditionalFeeCard';
import axios from 'axios';

const DocumentSelector = ({ objectStatus, handleSelectDocument, handleAddNewDocumentToPackage, showAddFeeInput, saveNewFee, currIdObjDB }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [sendingEmails, setSendingEmails] = useState(false);
    const [packageInfo, setPackageInfo] = useState(null)
    const [documents, setDocuments] = useState([])
    const pdfContainerRef = useRef();

    useEffect(() => {
        setPackageInfo(objectStatus[0]?.[0]?.packageInfo);
        setDocuments(objectStatus[0]?.[0]?.packageInfo?.documents);

    }, [objectStatus]);


    const lastUnlockedDocument = getLastUnlockedDocument(objectStatus);
    const allDocumentsCompleted = areAllDocumentsUnlocked(objectStatus);

    async function handleSendDocuments(objectStatus, currIdObjDB) {
        setSendingEmails(true);
        setShowToast(true);
        setToastMessage("Sending emails...");

        try {
            await sendDocumentsForApproval(objectStatus, currIdObjDB);

        } catch (error) {
            console.error("Error sending emails:", error);
            setToastMessage("Error sending emails. Please try again.");
        } finally {
            setSendingEmails(false);
            setShowToast(true);
            setToastMessage("Emails sent successfully!");
        }
    };


    async function handleSendDocumentsAsPDF() {
        setSendingEmails(true);
        setShowToast(true);
        setToastMessage("Generating and downloading PDFs...");

        try {
            for (const userSet of objectStatus) {
                const personalInfo = userSet.find(item => item.personal);
                const documentData = userSet.find(item => item.documentDOM);

                if (!personalInfo || !documentData) {
                    console.error("No se encontró la información requerida para este usuario.");
                    continue;
                }

                const { fullName } = personalInfo.personal;
                const documentDOM = documentData.documentDOM;
                const documentType = "primaryWill"; // Ejemplo: tipo de documento específico
                const documentContent = documentDOM && documentDOM[documentType]?.v1?.content;

                if (!documentContent) {
                    console.error(`No content found for ${fullName}`);
                    continue;
                }

                // Establece el contenido del documento en un div oculto
                pdfContainerRef.current.innerHTML = documentContent;

                // Genera la imagen del PDF desde el div visible en el DOM
                const canvas = await html2canvas(pdfContainerRef.current, {
                    scale: 2,
                    useCORS: true,
                });

                const pdf = new jsPDF('p', 'pt', 'a4');
                const imgData = canvas.toDataURL('image/png');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgHeight = (canvas.height * pageWidth) / canvas.width;

                let yPosition = 0;
                while (yPosition < imgHeight) {
                    pdf.addImage(imgData, 'PNG', 0, yPosition > 0 ? -yPosition : 0, pageWidth, imgHeight);
                    yPosition += pageHeight;
                    if (yPosition < imgHeight) {
                        pdf.addPage();
                    }
                }

                pdf.save(`${fullName}-document.pdf`);
            }

            setToastMessage("PDFs downloaded successfully!");
        } catch (error) {
            console.error("Error generating PDFs:", error);
            setToastMessage("Error generating PDFs. Please try again.");
        } finally {
            setSendingEmails(false);
            setShowToast(true);
        }
    }
    return (
        <Container>
            {true ? (
                <>
                    <h1>
                        {allDocumentsCompleted
                            ? 'All documents completed'
                            : `Select your document, fulfill the needed data and save it`
                        }
                    </h1>

                    <Row className="mt-3">
                        {(() => {
                            let poaCount = 0;

                            return documents.map((docObj, index) => {
                                let documentLabel = '';
                                if (docObj.docType === 'poaProperty') {
                                    poaCount++;
                                    documentLabel = `POA${poaCount} Property`;
                                } else if (docObj.docType === 'poaHealth') {
                                    poaCount++;
                                    documentLabel = `POA${poaCount} Health`;
                                }

                                return (
                                    <Col key={index} xs={12} sm={6} md={4} className="mb-2">
                                        <Button
                                            onClick={() => handleSelectDocument(docObj)}
                                            style={{ width: "100%" }}
                                            className={lastUnlockedDocument === docObj && !isDocumentUnlocked(objectStatus, index + 1) ? ' border-2 border-white shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#198754,0_0_15px_#198754,0_0_30px_#198754]' : ''}
                                            variant={isDocumentUnlocked(objectStatus, index) ? 'success' : 'outline-dark'}
                                            disabled={!isDocumentUnlocked(objectStatus, index)}
                                        >
                                            {docObj.docType === 'primaryWill' && <><strong>{index + 1} . </strong><i className="bi bi-file-text"></i> Will</>}
                                            {docObj.docType === 'spousalWill' && <><strong>{index + 1} . </strong><i className="bi bi-file-text"></i> Spousal Will</>}
                                            {docObj.docType === 'secondaryWill' && <><strong>{index + 1} . </strong><i className="bi bi-file-text"></i> Secondary Will</>}
                                            {docObj.docType === 'poaProperty' && <><strong>{index + 1} . </strong><i className="bi bi-house"></i> {documentLabel}</>}
                                            {docObj.docType === 'poaHealth' && <><strong>{index + 1} . </strong><i className="bi bi-hospital"></i> {documentLabel}</>}
                                        </Button>
                                    </Col>
                                );
                            });
                        })()}
                    </Row>

                    <Row className="mt-12">
                        <Col md={4} className="">
                            <AdditionalFeeCard
                                newPackageInfo={packageInfo}
                                isAddingFee={showAddFeeInput}
                                onSave={saveNewFee}
                            />
                        </Col>
                        <Col md={{ span: 6, offset: 2 }} className="d-flex flex-column">
                            <Dropdown
                                onSelect={(eventKey) => handleAddNewDocumentToPackage(eventKey)}
                                className="mb-3"
                            >
                                <Dropdown.Toggle
                                    className="w-100"
                                    variant={!allDocumentsCompleted ? 'outline-dark' : 'outline-primary'}
                                    disabled={!allDocumentsCompleted}
                                    id="add-document-dropdown"
                                >
                                    <i className="bi bi-file-earmark-plus"></i> Add New Document
                                </Dropdown.Toggle>

                                <Dropdown.Menu className="text-center w-100">
                                    <Dropdown.Item eventKey="secondaryWill">
                                        Secondary Will
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="poaProperty">
                                        POA Property
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="poaHealth">
                                        POA Health
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <Button
                                variant={!allDocumentsCompleted ? 'outline-dark' : 'outline-success'}
                                disabled={!allDocumentsCompleted}
                                className="mb-2 w-100"
                                onClick={() => { handleSendDocuments(objectStatus, currIdObjDB) }}
                            >
                                <i className="bi bi-send"></i> Send Documents for Approval
                            </Button>
                            <Button
                                variant={!allDocumentsCompleted ? 'outline-dark' : 'outline-success'}
                                disabled={!allDocumentsCompleted}
                                className="w-100"
                                onClick={() => { handleSendDocumentsAsPDF(objectStatus, currIdObjDB) }}
                            >
                                <i className="bi bi-send"></i> Send Documents as PDFs for Approval
                            </Button>
                            <div ref={pdfContainerRef} ></div>
                        </Col>
                    </Row>

                    <CustomToast
                        show={showToast}
                        onClose={() => setShowToast(false)}
                        message={
                            sendingEmails
                                ? (<><Spinner animation="border" size="sm" /> Sending emails...</>)
                                : toastMessage
                        }
                    />
                </>
            ) : null
            }

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={
                    sendingEmails
                        ? (<><Spinner animation="border" size="sm" /> Sending emails...</>)
                        : toastMessage
                }
            />
        </Container>
    );
};

export default DocumentSelector;
