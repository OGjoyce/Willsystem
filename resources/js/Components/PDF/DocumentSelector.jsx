import React, { useState } from 'react';
import { Container, Row, Col, Button, Modal, ListGroup } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';

const contentComponents = {
    primaryWill: WillContent,
    spousalWill: WillContent,
    secondaryWill: WillContent,
    poaProperty: POA1Content,
    poaHealth: POA2Content,
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
    currentProfile
}) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [showPDFEditor, setShowPDFEditor] = useState(false);
    const [documentOwner, setDocumentOwner] = useState(null); // Estado para almacenar el owner del documento

    // Validar el objectStatus
    if (!Array.isArray(objectStatus) || objectStatus.length === 0 || !Array.isArray(objectStatus[0]) || objectStatus[0].length === 0) {
        return <p>No hay documentos disponibles.</p>;
    }

    const firstElementArray = objectStatus[0];
    const firstElement = firstElementArray[0];

    if (!firstElement.packageInfo || !firstElement.packageInfo.documents) {
        return <p>No hay documentos disponibles.</p>;
    }

    const availableDocuments = Object.keys(firstElement.packageInfo.documents);

    // Verificar si el documento está desbloqueado
    // Verificar si el documento está desbloqueado
    const isDocumentUnlocked = (doc, index) => {
        if (index === 0) return true; // El primer documento siempre está desbloqueado

        const previousDocKey = availableDocuments[index - 1];
        const previousDoc = firstElement.packageInfo.documents[previousDocKey];

        // Comprobar si el documento anterior tiene una versión 'v1' en su documentDOM
        const ownerProfile = objectStatus.find(profileArray =>
            profileArray.some(dataObj => dataObj.personal?.email === previousDoc.owner)
        );

        if (!ownerProfile) {
            return false; // Si no se encuentra el perfil del dueño, bloqueamos el documento
        }

        const ownerDocumentDOM = ownerProfile[ownerProfile.length - 1]?.documentDOM || {};

        // Desbloquear si el documento anterior tiene la versión 'v1'
        return ownerDocumentDOM[previousDocKey]?.v1?.content ? true : false;
    };


    const handleSelectDocument = (doc) => {
        const document = firstElement.packageInfo.documents[doc];
        const owner = document.owner; // Obtener el owner del documento seleccionado

        if (owner === currentProfile) {
            setSelectedDoc(doc);
            setCurrentDocument(doc);
            setDocumentOwner(owner); // Guardar el owner en el estado

            // Verificar si hay pasos incompletos
            const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));
            if (firstIncompleteStep) {
                setPointer(firstIncompleteStep.step);
                backStep();
            } else {
                setShowPDFEditor(true); // Mostrar el PDFEditor
            }
        } else {
            setSelectedDoc(doc);
            setDocumentOwner(owner); // Guardar el owner en el estado
            setShowEmailModal(true);
        }
    };

    const handleSelectEmail = (email) => {
        // Establecer el email seleccionado como owner del documento
        const updatedObjectStatus = objectStatus.map((profileArray, idx) => {
            return profileArray.map((dataObj) => {
                if (dataObj.packageInfo && dataObj.packageInfo.documents && dataObj.personal?.email === currentProfile) {
                    // Actualizar el owner del documento seleccionado
                    const updatedDocuments = { ...dataObj.packageInfo.documents };
                    updatedDocuments[selectedDoc].owner = email; // Asignar el email como owner

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

        // Guardar el nuevo estado en objectStatus
        setObjectStatus(updatedObjectStatus);
        localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus)); // Guardar en localStorage

        // Establecer el email seleccionado como perfil actual
        setSelectedEmail(email);
        setCurrentProfile(email);
        setCurrentDocument(selectedDoc);

        // Verificar si todos los pasos tienen datos antes de avanzar
        const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));

        if (firstIncompleteStep) {
            setPointer(firstIncompleteStep.step);

        } else {
            setPointer(16); // Navegar al paso 16
            setShowPDFEditor(true); // Mostrar el PDFEditor cuando todos los pasos tengan datos
        }

        // Cerrar el modal de selección de email
        setShowEmailModal(false);
    };

    const getObjectStatus = (objectStatus, currentProfile) => {
        // Buscar en objectStatus el perfil que coincida con el currentProfile
        const profile = objectStatus.find(profileArray =>
            profileArray.some(dataObj => dataObj.personal?.email === currentProfile)
        );

        // Retornar el perfil encontrado o un array vacío si no se encuentra
        return profile || [];
    };

    return (
        <Container>
            {/* Si no se ha seleccionado ningún documento, muestra la lista de documentos */}
            {!selectedDoc && (
                <>
                    <h3>Select a Document to View, Edit or Download</h3>
                    <Row className="mt-3">
                        {availableDocuments.map((doc, index) => (
                            <Col key={doc} xs={12} sm={6} md={4} className="mb-2">
                                <Button
                                    onClick={() => handleSelectDocument(doc)}
                                    style={{ width: "100%" }}
                                    variant="outline-dark"
                                    disabled={!isDocumentUnlocked(doc, index)}
                                >
                                    {doc === 'primaryWill' && <><i className="bi bi-file-text"></i> Will</>}
                                    {doc === 'spousalWill' && <><i className="bi bi-file-text"></i> Spousal Will</>}
                                    {doc === 'secondaryWill' && <><i className="bi bi-file-text"></i> Secondary Will</>}
                                    {doc === 'poaProperty' && <><i className="bi bi-house"></i> POA1 Property</>}
                                    {doc === 'poaHealth' && <><i className="bi bi-hospital"></i> POA2 Health</>}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                    {errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>}
                </>
            )}

            {/* Mostrar el modal para seleccionar el perfil cuando el documento no tenga dueño */}
            <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {objectStatus.map((profileArray, idx) => {
                        const profile = profileArray.find(obj => obj.personal?.email);
                        if (profile && profile.personal?.email) {
                            return (
                                <ListGroup key={idx}>
                                    <ListGroup.Item action onClick={() => handleSelectEmail(profile.personal.email)}>
                                        {profile.personal.email}
                                    </ListGroup.Item>
                                </ListGroup>
                            );
                        }
                        return null;
                    })}
                </Modal.Body>
            </Modal>

            {/* Mostrar el PDFEditor si todos los pasos están completos */}
            {showPDFEditor && selectedDoc && (
                <PDFEditor
                    documentType={selectedDoc} // Pasar el tipo de documento seleccionado
                    objectStatus={objectStatus}
                    documentOwner={documentOwner} // Pasar el owner del documento seleccionado
                    backendId={currIdObjDB}
                    ContentComponent={contentComponents[selectedDoc]} // Pasar el componente de contenido adecuado
                    onBack={() => setSelectedDoc(null)}
                />
            )}
        </Container>
    );
};

export default DocumentSelector;
