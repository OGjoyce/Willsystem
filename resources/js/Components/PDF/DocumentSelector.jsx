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
    object_status,
    currIdObjDB,
    setPointer,
    setCurrentProfile,
    setCurrentDocument,
    backStep,
    stepHasData,
    visibleSteps,
    currentProfile // Asegúrate de pasar `currentProfile` como prop
}) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);

    if (!Array.isArray(object_status) || object_status.length === 0 || !Array.isArray(object_status[0]) || object_status[0].length === 0) {
        return <p>No hay documentos disponibles.</p>;
    }

    const firstElementArray = object_status[0];
    const firstElement = firstElementArray[0];

    if (!firstElement.packageInfo || !firstElement.packageInfo.documents) {
        return <p>No hay documentos disponibles.</p>;
    }

    const availableDocuments = Object.keys(firstElement.packageInfo.documents);

    const isDocumentUnlocked = (doc, index) => {
        if (index === 0) return true;
        const previousDocKey = availableDocuments[index - 1];
        const previousDoc = firstElement.packageInfo.documents[previousDocKey];
        return previousDoc?.dataStatus === "completed";
    };

    const handleSelectDocument = (doc) => {
        const documentOwner = firstElement.packageInfo.documents[doc].owner;

        // Si el documento ya tiene un `owner` que coincide con el `currentProfile`, no mostrar modal
        if (documentOwner === currentProfile) {
            setSelectedDoc(doc);
            setCurrentDocument(doc);

            // Verificar los pasos antes de continuar
            const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));
            if (firstIncompleteStep) {
                setPointer(firstIncompleteStep.step);
                backStep(); // Hacemos backStep si hay un paso incompleto
            } else {
                setPointer(16); // Continuar con la edición del documento
            }
        } else {
            // Si el `owner` no coincide o no está definido, mostrar el modal para seleccionar perfil
            setSelectedDoc(doc);
            setShowEmailModal(true);
        }
    };

    const handleSelectEmail = (email) => {
        setSelectedEmail(email);
        setCurrentProfile(email);
        setCurrentDocument(selectedDoc);

        // Verificar si todos los pasos tienen datos antes de avanzar
        const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));

        if (firstIncompleteStep) {
            setPointer(firstIncompleteStep.step);
            backStep();
        } else {
            setPointer(16); // Navegar al paso 16
        }

        setShowEmailModal(false);
    };

    return (
        <Container>
            {!selectedDoc ? (
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
            ) : (
                null
            )}

            <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Select a Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {object_status.map((profileArray, idx) => {
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
        </Container>
    );
};

export default DocumentSelector;
