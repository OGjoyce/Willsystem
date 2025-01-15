import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Dropdown } from 'react-bootstrap';
import ReservationScheduler from '../Scheduler/ReservationScheduler';
import CustomToast from '../AdditionalComponents/CustomToast';
import AdditionalFeeCard from '../AdditionalComponents/AdditionalFeeCard';
import {
    sendDocumentsForApproval,
    sendDocumentsAsPDF,
    areAllDocumentsUnlocked,
    isDocumentUnlocked,
    getLastUnlockedDocument,
    addNewDocumentToPackage
} from '@/utils/documentsUtils';

const DocumentSelector = ({
    objectStatus,
    handleSelectDocument,
    handleAddNewDocumentToPackage,
    showAddFeeInput,
    saveNewFee,
    currIdObjDB
}) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [sendingEmails, setSendingEmails] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [packageInfo, setPackageInfo] = useState(null);
    const [documents, setDocuments] = useState([]);
    const pdfContainerRef = useRef();

    useEffect(() => {
        setPackageInfo(objectStatus[0]?.[0]?.packageInfo);
        setDocuments(objectStatus[0]?.[0]?.packageInfo?.documents);
    }, [objectStatus]);

    // Mostrar en consola la info del package (para debug)
    useEffect(() => {
        const timer = setTimeout(() => {
            console.log(packageInfo);
        }, 1000);
        return () => clearTimeout(timer);
    }, [packageInfo]);

    const lastUnlockedDocument = getLastUnlockedDocument(objectStatus);
    const allDocumentsCompleted = areAllDocumentsUnlocked(objectStatus);

    // Extraer información de perfil para agendar citas
    const extractPersonalProfiles = (objectStatus) => {
        const profiles = [];
        objectStatus.forEach(status =>
            status.forEach(profile => {
                if (profile.personal?.fullName && profile.personal?.email) {
                    profiles.push({
                        fullName: profile.personal.fullName,
                        email: profile.personal.email
                    });
                }
            })
        );
        return profiles;
    };
    const profiles = extractPersonalProfiles(objectStatus);

    // Función genérica para enviar correos y mostrar resultados en el toast
    async function handleSendDocuments(taskFunction, successMessage, errorMessage) {
        setSendingEmails(true);
        setShowToast(true);
        setToastMessage("Sending emails...");

        try {
            await taskFunction(objectStatus, currIdObjDB);
            setToastMessage(successMessage);
        } catch (error) {
            console.error(errorMessage, error);
            setToastMessage(errorMessage);
        } finally {
            setSendingEmails(false);
        }
    }

    return (
        <Container>
            <h1>
                {allDocumentsCompleted
                    ? "All documents completed"
                    : "Select your document, fulfill the needed data and save it"}
            </h1>

            <Row className="mt-3">
                {(() => {
                    let poaCount = 0;
                    return documents.map((docObj, index) => {
                        let documentLabel = "";
                        if (docObj.docType === "poaProperty") {
                            poaCount++;
                            documentLabel = `POA${poaCount} Property`;
                        } else if (docObj.docType === "poaHealth") {
                            poaCount++;
                            documentLabel = `POA${poaCount} Health`;
                        }
                        return (
                            <Col key={index} xs={12} sm={6} md={4} className="mb-2">
                                <Button
                                    onClick={() => handleSelectDocument(docObj)}
                                    style={{ width: "100%" }}
                                    className={
                                        lastUnlockedDocument === docObj &&
                                            !isDocumentUnlocked(objectStatus, index + 1)
                                            ? " border-2 border-white shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#198754,0_0_15px_#198754,0_0_30px_#198754]"
                                            : ""
                                    }
                                    variant={
                                        isDocumentUnlocked(objectStatus, index)
                                            ? "success"
                                            : "outline-dark"
                                    }
                                    disabled={!isDocumentUnlocked(objectStatus, index)}
                                >
                                    {docObj.docType === "primaryWill" && (
                                        <>
                                            <strong>{index + 1} . </strong>
                                            <i className="bi bi-file-text"></i> Will
                                        </>
                                    )}
                                    {docObj.docType === "spousalWill" && (
                                        <>
                                            <strong>{index + 1} . </strong>
                                            <i className="bi bi-file-text"></i> Spousal Will
                                        </>
                                    )}
                                    {docObj.docType === "secondaryWill" && (
                                        <>
                                            <strong>{index + 1} . </strong>
                                            <i className="bi bi-file-text"></i> Secondary Will
                                        </>
                                    )}
                                    {docObj.docType === "poaProperty" && (
                                        <>
                                            <strong>{index + 1} . </strong>
                                            <i className="bi bi-house"></i> {documentLabel}
                                        </>
                                    )}
                                    {docObj.docType === "poaHealth" && (
                                        <>
                                            <strong>{index + 1} . </strong>
                                            <i className="bi bi-hospital"></i> {documentLabel}
                                        </>
                                    )}
                                </Button>
                            </Col>
                        );
                    });
                })()}
            </Row>

            <Row className="mt-4">
                <Col md={4}>
                    <AdditionalFeeCard
                        newPackageInfo={packageInfo}
                        isAddingFee={showAddFeeInput}
                        onSave={saveNewFee}
                    />
                </Col>
                <Col md={{ span: 6, offset: 2 }} className="d-flex flex-column">
                    <Dropdown
                        onSelect={(eventKey) =>
                            handleAddNewDocumentToPackage(eventKey)
                        }
                        className="mb-3"
                    >
                        <Dropdown.Toggle
                            className="w-100"
                            variant={!allDocumentsCompleted ? "outline-dark" : "outline-primary"}
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
                        variant={!allDocumentsCompleted ? "outline-dark" : "outline-success"}
                        disabled={!allDocumentsCompleted}
                        className="mb-2 w-100"
                        onClick={() =>
                            handleSendDocuments(
                                sendDocumentsForApproval,
                                "Emails sent successfully!",
                                "Error sending emails. Please try again."
                            )
                        }
                    >
                        <i className="bi bi-send"></i> Send Documents for Approval
                    </Button>
                    <Button
                        variant={!allDocumentsCompleted ? "outline-dark" : "outline-success"}
                        disabled={!allDocumentsCompleted}
                        className="w-100"
                        onClick={() =>
                            handleSendDocuments(
                                sendDocumentsAsPDF,
                                "PDFs sent successfully!",
                                "Error sending PDFs by email. Please try again."
                            )
                        }
                    >
                        <i className="bi bi-send"></i> Send Documents as PDFs for Approval
                    </Button>
                    {packageInfo?.is_signature_required == true && (
                        <Button
                            variant="outline-dark"
                            className="mt-3 w-100"
                            disabled={!allDocumentsCompleted}
                            onClick={() => setShowScheduler(!showScheduler)}
                        >
                            {showScheduler ? (
                                <>
                                    <i className="bi bi-calendar-x"></i> Hide Scheduler
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-calendar-plus"></i> Schedule an appointment
                                </>
                            )}
                        </Button>
                    )}
                    <div ref={pdfContainerRef}></div>
                    {showScheduler && (
                        <div className="mt-4 p-3 border rounded bg-light">
                            <ReservationScheduler
                                profilesArray={profiles}
                                setShowScheduler={setShowScheduler}
                            />
                        </div>
                    )}
                </Col>
            </Row>

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={
                    sendingEmails ? (
                        <>
                            <Spinner animation="border" size="sm" /> Sending emails...
                        </>
                    ) : (
                        toastMessage
                    )
                }
            />
        </Container>
    );
};

export default DocumentSelector;
