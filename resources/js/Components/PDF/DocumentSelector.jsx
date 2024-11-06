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

    async function sendDocumentsForApproval(objectStatus, currIdObjDB) {
        const idForToken = currIdObjDB;
        let userInfoForToken = [];

        // Recolectar emails y nombres
        objectStatus.forEach(innerList => {
            innerList.forEach(item => {
                if (item.owner && item.personal?.fullName) {
                    userInfoForToken.push({
                        email: item.owner,
                        fullName: item.personal.fullName
                    });
                }
            });
        });

        let tokensByEmail = {};

        // Hacer la petición POST por cada email y nombre
        for (let userInfo of userInfoForToken) {
            try {
                // 1. Validar el email y obtener la contraseña si es un nuevo usuario
                const validateEmailResponse = await axios.post('https://willsystemapp.com/api/validate-email', {
                    email: userInfo.email,
                    name: userInfo.fullName
                });

                const password = validateEmailResponse.data.password;
                console.log("Generating password");

                console.log(password);

                // 2. Generar el token para el usuario
                const generateTokenResponse = await axios.post('https://willsystemapp.com/api/generate-token', {
                    email: userInfo.email,
                    id: idForToken
                });

                // Asume que el token viene en `response.data.token`
                const token = generateTokenResponse.data.token;
                tokensByEmail[userInfo.email] = {
                    token: token,
                    fullName: userInfo.fullName
                };

                // 3. Construir el mensaje en formato HTML
                let message = `
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <h2 style="color: #333; font-size: 24px; margin: 0;">Hello, ${userInfo.fullName}</h2>
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
                  ${password ?'' : `
                <tr>
                    <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        <p>Your temporary password is:</p>
                        <p style="font-weight: bold; color: #333;">${userInfo.email}</p>
                    </td>
                </tr>`}
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
    </html>
`;


                // 4. Enviar el correo electrónico en formato HTML
                await axios.post('https://willsystemapp.com:5000/send-email', {
                    to_email: userInfo.email,
                    subject: 'Please review and approve your documents',
                    message: message, // Este será el cuerpo en HTML
                    is_html: true     // Agrega un flag para indicar que el contenido es HTML
                });

            } catch (error) {
                console.error(`Error processing ${userInfo.email}:`, error);
                throw error; // Lanza el error para que sea manejado en el try-catch de `handleSendDocuments`
            }
        }

        console.log(tokensByEmail);
    }


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
