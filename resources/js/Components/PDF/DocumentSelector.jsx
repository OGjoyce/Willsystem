import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ListGroup, Spinner } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';
import CustomToast from '../AdditionalComponents/CustomToast';
import { handleProfileData } from '@/utils/profileUtils';
import axios from 'axios';

const contentComponents = {
    primaryWill: WillContent,
    spousalWill: WillContent,
    secondaryWill: WillContent,
    poaProperty: POA1Content,
    poaHealth: POA2Content,
    secondaryWill2: WillContent,
    poaProperty2: POA1Content,
    poaHealth2: POA2Content,
};

const DocumentSelector = ({
    onSelect,
    errors,
    objectStatus,
    currIdObjDB,
    setPointer,
    setCurrentProfile,
    setCurrentDocument,
    setObjectStatus,
    backStep,
    stepHasData,
    visibleSteps,
    currentProfile,
    currentDocument
}) => {
    const [selectedDoc, setSelectedDoc] = useState(currentDocument);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showPDFEditor, setShowPDFEditor] = useState(false);
    const [documentOwner, setDocumentOwner] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [sendingEmails, setSendingEmails] = useState(false); // Nuevo estado para spinner
    const [prevSelectedDoc, setPrevSelectedDoc] = useState(selectedDoc);
    const [prevCurrentDocument, setPrevCurrentDocument] = useState(currentDocument);
    const [prevDocumentOwner, setPrevDocumentOwner] = useState(documentOwner);
    const [prevCurrentProfile, setPrevCurrentProfile] = useState(currentProfile);
    const [firstIncompleteStep, setFirstIncompleteStep] = useState();

    // Effect to keep the component updated

    // Helper function to get the owner of the document
    const getDocumentOwner = (index) => {
        const document = objectStatus[0]?.[0]?.packageInfo?.documents?.[index];
        return document?.owner || 'unknown';
    };

    // Check if the document is unlocked
    const isDocumentUnlocked = (index) => {
        if (index === 0) return true; // El primer documento siempre está desbloqueado

        const previousDoc = objectStatus[0]?.[0]?.packageInfo?.documents?.[index - 1];

        const ownerProfile = objectStatus.find(profileArray =>
            profileArray.some(dataObj => dataObj.personal?.email === previousDoc?.owner)
        );

        if (!ownerProfile) {
            return false; // Si no se encuentra el perfil del dueño, bloqueamos el documento
        }

        const ownerDocumentDOM = ownerProfile[ownerProfile.length - 1]?.documentDOM || {};
        return ownerDocumentDOM[previousDoc?.docType]?.v1?.content ? true : false
    };

    const handleSelectDocument = (docObj, index) => {
        let owner = docObj.owner || 'unknown';
        const doc = docObj.docType;
        // Establecer los nuevos estados
        setSelectedDoc(doc);

        if (doc === 'secondaryWill' && owner == 'unknown') {
            setCurrentDocument(doc);
            setCurrentProfile(null);
            setPointer(0); // Navegar al pointer 0
            return;
        } else if (doc === 'secondaryWill' && owner !== 'unknown') {
            setCurrentDocument(doc);
            setCurrentProfile(owner);


        }
        if (doc === 'spousalWill' && owner == 'unknown') {
            setCurrentDocument(doc);
            setCurrentProfile(null);
            setPointer(3);
            return;
        } else if (doc === 'spousalWill' && owner !== 'unknown') {
            setCurrentDocument(doc);
            setCurrentProfile(owner);

        }






        // Verificar si el documento tiene un associatedWill
        if (docObj.associatedWill) {
            const associatedWillId = docObj.associatedWill;

            // Buscar el Will asociado en los documentos
            const associatedWill = objectStatus[0]?.[0]?.packageInfo?.documents?.find(will => will.willIdentifier === associatedWillId);

            // Si el Will asociado tiene un owner, asignarlo automáticamente
            if (associatedWill && associatedWill.owner) {
                owner = associatedWill.owner;
                setDocumentOwner(owner);
                setCurrentProfile(owner);
                setCurrentDocument(doc);
                setShowPDFEditor(true);

            }
        }

        // Si no hay associatedWill o el owner es 'unknown', mostrar el modal para seleccionar un email
        if (owner === 'unknown') {
            setShowEmailModal(true);
            setSelectedDoc(doc);
            return;
        }

        // Si el documento ya tiene un owner, continuar con la lógica habitual
        if (doc === currentDocument && owner === currentProfile) {
            setShowConfirmationModal(true);
            setCurrentDocument(currentDocument)
            setCurrentProfile(currentProfile)
            return;
        }

        // Guardar estados previos
        setPrevSelectedDoc(selectedDoc);
        setPrevCurrentDocument(currentDocument);
        setPrevDocumentOwner(documentOwner);
        setPrevCurrentProfile(currentProfile);


        setCurrentDocument(doc);
        setDocumentOwner(owner);
        setCurrentProfile(owner);

        setFirstIncompleteStep(visibleSteps.find(step => !stepHasData(step.step)));

        if (doc !== currentDocument && owner !== currentProfile || doc !== currentDocument && owner === currentProfile) {
            setShowConfirmationModal(true);
        } else {
            if (firstIncompleteStep) {
                backStep();
            } else {
                setShowPDFEditor(true);
            }
        }
    };


    const getLastUnlockedDocument = () => {
        const documents = objectStatus[0]?.[0]?.packageInfo?.documents || [];
        for (let i = documents.length - 1; i >= 0; i--) {
            if (isDocumentUnlocked(i)) {
                return documents[i];
            }
        }
        return null;
    };

    const areAllDocumentsUnlocked = () => {
        const documents = objectStatus[0]?.[0]?.packageInfo?.documents || [];
        return documents.every((_, index) => isDocumentUnlocked(index + 1));
    };


    const lastUnlockedDocument = getLastUnlockedDocument();
    const allStepsCompleted = visibleSteps.every(step => stepHasData(step.step));
    const allDocumentsCompleted = areAllDocumentsUnlocked();

    const handleConfirmSelection = () => {
        setShowConfirmationModal(false);
        setSelectedDoc(selectedDoc);
        setCurrentDocument(selectedDoc);
        setDocumentOwner(documentOwner);
        setCurrentProfile(documentOwner);

        if (documentOwner !== "unknown") {
            const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));
            if (firstIncompleteStep) {
                setPointer(firstIncompleteStep.step);
                backStep();
            } else {
                setShowPDFEditor(true);
            }
        } else {
            setShowPDFEditor(false)
            setShowEmailModal(true);
        }
    };

    const handleCancelSelection = () => {
        setShowConfirmationModal(false);
        // Revertir a los estados previos
        setSelectedDoc(prevSelectedDoc);
        setCurrentDocument(prevCurrentDocument);
        setDocumentOwner(prevDocumentOwner);
        setCurrentProfile(prevCurrentProfile);
    };

    const handleSelectEmail = (email) => {
        const updatedObjectStatus = objectStatus.map((profileArray) => {
            return profileArray.map((dataObj) => {
                // Verifica si este es el perfil actual
                if (dataObj.packageInfo && dataObj.packageInfo.documents && dataObj.personal?.email === currentProfile) {
                    let documentUpdated = false; // Indicador de si ya se actualizó un documento

                    const updatedDocuments = dataObj.packageInfo.documents.map((docObj) => {
                        if (!documentUpdated && docObj.docType === selectedDoc && docObj.owner === 'unknown') {
                            documentUpdated = true; // Marcamos que ya se actualizó un documento
                            return { ...docObj, owner: email };
                        }
                        return docObj;
                    });

                    return {
                        ...dataObj,
                        packageInfo: {
                            ...dataObj.packageInfo,
                            documents: updatedDocuments,
                        },
                    };
                }
                return dataObj;
            });
        });

        setObjectStatus(updatedObjectStatus);
        localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));

        setSelectedEmail(email);
        setCurrentProfile(email);
        setCurrentDocument(selectedDoc);

        // Aquí defines la lógica para cambiar el valor del pointer
        if (selectedDoc === 'poaProperty') {
            setPointer(12);
        } else if (selectedDoc === 'poaHealth') {
            setPointer(13);
        }

        setShowEmailModal(false);
        setToastMessage(`Profile "${email}" selected.`);
        setShowToast(true);
    };


    if (showConfirmationModal) {
        handleConfirmSelection()
    }

    const handleCreateNewProfile = () => {
        setPointer(0);
        setCurrentProfile(null);
        setCurrentDocument(selectedDoc);
        setShowEmailModal(false);
    };

    async function handleSendDocuments() {
        setSendingEmails(true); // Mostrar spinner mientras se envían los correos
        setShowToast(true);
        setToastMessage("Sending emails...");

        try {
            await sendDocumentsForApproval(objectStatus, currIdObjDB);

            // Cuando haya terminado de enviar los correos

        } catch (error) {
            console.error("Error sending emails:", error);
            setToastMessage("Error sending emails. Please try again.");
        } finally {
            setSendingEmails(false); // Detener el spinner
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
                const validateEmailResponse = await axios.post('http://127.0.0.1:8000/api/validate-email', {
                    email: userInfo.email,
                    name: userInfo.fullName
                });

                const password = validateEmailResponse.data.password;

                // 2. Generar el token para el usuario
                const generateTokenResponse = await axios.post('http://127.0.0.1:8000/api/generate-token', {
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
                    <body>
                        <h2 style="color: #333;">Hello, ${userInfo.fullName}</h2>
                        <p>Please review and approve your documents by clicking the link below:</p>
                        <a href="http://127.0.0.1:8000/documents-approval?token=${token}" style="padding: 10px 20px; background-color: #198754; color: white; text-decoration: none; border-radius: 5px;">Review Documents</a>
                        <p>If the button doesn't work, you can use this link:</p>
                        <a href="http://127.0.0.1:8000/documents-approval?token=${token}">http://127.0.0.1:8000/documents-approval?token=${token}</a>
                        <br><br>
                        ${password ? `<p>Your temporary password is: <strong>${password}</strong></p>` : ''}
                        <br>
                        <p style="color: #555;">Thank you!</p>
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
            {!selectedDoc || showEmailModal ? (
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

                            return objectStatus[0]?.[0]?.packageInfo?.documents.map((docObj, index) => {
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
                                            onClick={() => handleSelectDocument(docObj, index)}
                                            style={{ width: "100%" }}
                                            className={lastUnlockedDocument === docObj && !isDocumentUnlocked(index + 1) ? ' border-2 border-white shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#198754,0_0_15px_#198754,0_0_30px_#198754]' : ''}
                                            variant={isDocumentUnlocked(index) ? 'success' : 'outline-dark'}
                                            disabled={!isDocumentUnlocked(index)}
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
                            onClick={handleSendDocuments}
                        >
                            Send documents for Aproval
                        </Button>
                    </Row>
                    {errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>}
                </>
            ) : null
            }

            {/* Mostrar el modal para seleccionar el perfil cuando el documento no tenga dueño */}
            <Modal
                show={showEmailModal}
                onHide={() => setShowEmailModal(false)}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header>
                    <Modal.Title>Select profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup variant="flush" className="w-100">
                        {objectStatus.map((profileArray, idx) => {
                            const profile = profileArray.find(obj => obj.personal?.email);
                            if (profile && profile.personal?.email) {
                                return (
                                    <ListGroup.Item
                                        key={idx}
                                        action
                                        onClick={() => handleSelectEmail(profile.personal.email)}
                                        className="text-center"
                                    >
                                        <i className="bi bi-person-circle me-2"></i>
                                        <strong>{profile.personal.email}</strong>
                                    </ListGroup.Item>
                                );
                            }
                            return null;
                        })}
                    </ListGroup>

                    <hr className="my-4" />

                    <Button
                        variant="outline-primary"
                        size="md"
                        className="w-100"
                        onClick={handleCreateNewProfile}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        <strong>Create new profile</strong>
                    </Button>
                </Modal.Body>
            </Modal>

            {/* Mostrar el PDFEditor si todos los pasos están completos */}
            {
                showPDFEditor && selectedDoc && (
                    <PDFEditor
                        documentType={selectedDoc}
                        objectStatus={objectStatus}
                        documentOwner={documentOwner}
                        backendId={currIdObjDB}
                        ContentComponent={contentComponents[selectedDoc]}
                        onBack={() => setSelectedDoc(null)}
                    />
                )
            }

            {/* CustomToast for notifications */}

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={
                    sendingEmails
                        ? (<><Spinner animation="border" size="sm" /> Sending emails...</>) // Spinner mientras envía
                        : toastMessage // Mensaje cuando termina de enviar
                }
            />
        </Container >
    );
};

export default DocumentSelector;
