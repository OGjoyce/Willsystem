import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Dropdown, Card, Form, InputGroup, Alert } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CustomToast from '../AdditionalComponents/CustomToast';
import { sendDocumentsForApproval, isDocumentUnlocked, areAllDocumentsUnlocked, getLastUnlockedDocument } from '@/utils/documentsUtils';
import AdditionalFeeCard from '../AdditionalComponents/AdditionalFeeCard';
import axios from 'axios';


import { useReactToPrint } from "react-to-print";
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





    async function handleSendDocumentsAsPDF(objectStatus, currIdObjDB) {
        const idForToken = currIdObjDB;
        let userInfoForToken = [];

        // Generar numeración de líneas
        function generateLineNumbers(maxLines) {
            const lineNumbers = [];
            for (let i = 1; i <= maxLines; i++) {
                lineNumbers.push(`<div style="
                text-align: right;
                padding-right: 10px;
                padding-top: 0px;
                font-family: 'Times New Roman', Times, serif;
                border: 1px solid red;
                font-size: 12px;
                color: #666;
                line-height: 2;
            ">${i}</div>`);
            }
            return `<div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
        ">${lineNumbers.join('')}</div>`;
        }

        // Función para combinar numeración con contenido
        function combineContentWithLineNumbers(htmlContent, maxLines) {
            const lineNumbersHTML = generateLineNumbers(maxLines);
            return `
            <div style="position: relative;">
                ${lineNumbersHTML}
                <div style="margin-left: 60px;">
                    ${htmlContent}
                </div>
            </div>
        `;
        }

        for (const userSet of objectStatus) {
            const personalInfo = userSet.find(item => item.personal);
            const documentData = userSet.find(item => item.documentDOM);

            if (!personalInfo || !documentData) {
                console.error("Required information not found for this user.");
                continue;
            }

            const { fullName } = personalInfo.personal;
            const email = personalInfo.owner;
            const documentDOM = documentData.documentDOM;

            if (!email) {
                console.error(`Missing email for ${fullName}.`);
                continue;
            }

            try {
                // Recopilar todos los documentos en base64
                let attachments = [];
                for (const [documentType, docVersion] of Object.entries(documentDOM)) {
                    const documentContent = docVersion?.v1?.content;
                    if (!documentContent) {
                        console.warn(`No content found for document type ${documentType} for ${fullName}.`);
                        continue;
                    }

                    // Combinar contenido con numeración
                    const linesEstimate = 400; // Número aproximado de líneas
                    const combinedContent = combineContentWithLineNumbers(documentContent, linesEstimate);

                    // Generar el PDF y obtenerlo en base64 desde el servidor de PDF
                    const response = await axios.post('https://willsystemapp.com:5050/generate-pdf', {
                        htmlContent: combinedContent,
                        fileName: `${fullName}-${documentType}.pdf`
                    });

                    const pdfBase64 = response.data.pdfBase64; // PDF en base64
                    attachments.push({
                        filename: `${fullName}-${documentType}.pdf`,
                        content: pdfBase64
                    });
                }

                if (attachments.length === 0) {
                    console.error(`No documents to attach for ${fullName}.`);
                    continue;
                }

                // Validar el email y obtener la contraseña si es un nuevo usuario
                const validateEmailResponse = await axios.post('https://willsystemapp.com/api/validate-email', {
                    email: email,
                    name: fullName
                });

                const password = validateEmailResponse.data.password;

                // Generar el token para el usuario
                const generateTokenResponse = await axios.post('https://willsystemapp.com/api/generate-token', {
                    email: email,
                    id: idForToken
                });

                const token = generateTokenResponse.data.token;

                // Crear el cuerpo del mensaje en formato HTML
                const message = `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <h2 style="color: #333; font-size: 24px; margin: 0;">Hello, ${fullName}</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                                <p>We’re reaching out to request your review and approval of important documents. Please follow the link below to securely access them:</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 20px;">
                                <a href="https://willsystemapp.com/documents-approval?token=${token}" 
                                   style="display: inline-block; padding: 12px 24px; background-color: #198754; color: white; 
                                          text-decoration: none; font-size: 16px; border-radius: 5px;">
                                    Review Documents
                                </a>
                            </td>
                        </tr>
                        ${password ? `
                        <tr>
                            <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                                <p>Your temporary password is:</p>
                                <p style="font-weight: bold; color: #333;">${password}</p>
                            </td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                                <p>If the button above doesn't work, you can also access your documents using this link:</p>
                                <p><a href="https://willsystemapp.com/documents-approval?token=${token}" 
                                      style="color: #198754; word-break: break-all;">click here...</a></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; color: #888; font-size: 14px; line-height: 1.6;">
                                <p>Thank you for your prompt attention.</p>
                                <p style="margin: 0;">Warm regards,</p>
                                <p style="margin: 0;">Barret Tax Law Team</p>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>`;

                const data = {
                    to_email: email,
                    subject: 'Please review and approve your documents',
                    message: message,
                    is_html: true,
                    attachments: attachments
                };

                // Serializar el objeto JSON
                await axios.post('https://willsystemapp.com:5000/send-email', JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`Email with all documents sent successfully to ${fullName} (${email}).`);

            } catch (error) {
                console.error(`Error processing ${email}:`, error);
                continue;
            }
        }

        console.log("All documents processed and emails sent.");
    }


    // Función auxiliar para generar el PDF con Puppeteer



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
