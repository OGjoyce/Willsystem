import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';

import CustomToast from '../AdditionalComponents/CustomToast';
import { sendDocumentsForApproval, isDocumentUnlocked, areAllDocumentsUnlocked, getLastUnlockedDocument } from '@/utils/documentsUtils';



const DocumentSelector = ({ objectStatus, handleSelectDocument, currIdObjDB }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [sendingEmails, setSendingEmails] = useState(false);
    const [documents, setDocuments] = useState([])

    useEffect(() => {
        setDocuments(objectStatus[0]?.[0]?.packageInfo?.documents)
    }, [objectStatus])


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

    return (
        <Container>
            {/* Document list */}
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
                        <Button
                            variant={!allDocumentsCompleted ? 'outline-dark' : 'outline-success'}
                            disabled={!allDocumentsCompleted}
                            className=''
                            onClick={() => { handleSendDocuments(objectStatus, currIdObjDB) }}
                        >
                            Send documents for Aproval
                        </Button>
                    </Row>
                    {/*errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>*/}
                </>
            ) : null
            }

            {/* CustomToast for notifications */}
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={
                    sendingEmails
                        ? (<><Spinner animation="border" size="sm" /> Sending emails...</>)
                        : toastMessage
                }
            />
        </Container >
    );
};

export default DocumentSelector;
