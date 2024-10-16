import React, { useState, useEffect } from 'react';
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
    currentProfile,
    currentDocument
}) => {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showPDFEditor, setShowPDFEditor] = useState(false);
    const [documentOwner, setDocumentOwner] = useState(null);

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
    const isDocumentUnlocked = (doc, index) => {
        if (index === 0) return true; // El primer documento siempre está desbloqueado

        const previousDocKey = availableDocuments[index - 1];
        const previousDoc = firstElement.packageInfo.documents[previousDocKey];

        // Comprobar si el documento anterior está completo
        const ownerProfile = objectStatus.find(profileArray =>
            profileArray.some(dataObj => dataObj.personal?.email === previousDoc.owner)
        );

        if (!ownerProfile) {
            return false; // Si no se encuentra el perfil del dueño, bloqueamos el documento
        }

        const ownerDocumentDOM = ownerProfile.find(obj => obj.documentDOM)?.documentDOM || {};

        // Desbloquear si el documento anterior tiene la versión 'v1'
        return ownerDocumentDOM[previousDocKey]?.v1?.content ? true : false;
    };

    // Obtener el primer documento desbloqueado
    const getFirstUnlockedDocument = () => {
        for (let i = 0; i < availableDocuments.length; i++) {
            if (isDocumentUnlocked(availableDocuments[i], i)) {
                return availableDocuments[i];
            }
        }
        return null;
    };

    useEffect(() => {
        if (!selectedDoc) {
            const firstUnlocked = getFirstUnlockedDocument();
            setSelectedDoc(firstUnlocked);
            setCurrentDocument(firstUnlocked);
            const document = firstElement.packageInfo.documents[firstUnlocked];
            setDocumentOwner(document.owner);
            setCurrentProfile(document.owner !== 'unknown' ? document.owner : null);
        }
    }, [selectedDoc]);

    // Función para proceder a seleccionar el documento
    const proceedToSelectDocument = (doc, owner) => {
        setSelectedDoc(doc);
        setCurrentDocument(doc);
        setDocumentOwner(owner);
        setCurrentProfile(owner);

        // Verificar si todos los pasos tienen datos completos
        const firstIncompleteStep = visibleSteps.find(step => !stepHasData(step.step));
        if (firstIncompleteStep) {
            setPointer(firstIncompleteStep.step);
        } else {
            setPointer(16); // Navegar al paso 16 (PDF Editor)
            setShowPDFEditor(true);
        }
    };

    const handleSelectDocument = (doc) => {
        const document = firstElement.packageInfo.documents[doc];
        const owner = document.owner; // Obtener el owner del documento seleccionado

        // Check if the document is unlocked
        const docIndex = availableDocuments.indexOf(doc);
        if (!isDocumentUnlocked(doc, docIndex)) {
            // El documento está bloqueado
            return;
        }

        if (owner !== 'unknown') {
            // Si el documento ya tiene un owner asignado
            setSelectedDoc(doc);
            setCurrentDocument(doc);
            setDocumentOwner(owner);
            setCurrentProfile(owner);

            proceedToSelectDocument(doc, owner);
        } else {
            // El documento tiene owner 'unknown'
            if (doc === 'spousalWill' || doc === 'secondaryWill') {
                // Llevar al usuario al pointer 0 para crear un nuevo perfil
                setCurrentDocument(doc);
                setSelectedDoc(doc);
                setDocumentOwner(null);
                setCurrentProfile(null);
                setPointer(0);
            } else if (doc === 'poaProperty' || doc === 'poaHealth') {
                // Mostrar opción para seleccionar perfil
                setSelectedDoc(doc);
                setCurrentDocument(doc);
                setDocumentOwner(null);
                setShowEmailModal(true);
            }
        }
    };

    const handleSelectEmail = (email) => {
        // Asignar el owner del documento al email seleccionado
        const updatedObjectStatus = objectStatus.map((profileArray) => {
            return profileArray.map((dataObj) => {
                if (dataObj.packageInfo && dataObj.packageInfo.documents) {
                    const updatedDocuments = { ...dataObj.packageInfo.documents };
                    if (updatedDocuments[selectedDoc]) {
                        updatedDocuments[selectedDoc].owner = email;
                    }
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

        // Actualizar el estado y localStorage
        setObjectStatus(updatedObjectStatus);
        localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));

        setCurrentProfile(email);
        setDocumentOwner(email);

        proceedToSelectDocument(selectedDoc, email);

        setShowEmailModal(false);
    };

    const handleCreateNewProfile = () => {
        // Establecer el pointer en 0 y el currentProfile como null
        setPointer(0);
        setCurrentProfile(null);
        setCurrentDocument(selectedDoc);
        setShowEmailModal(false);
    };

    // En el PDFEditor, necesitamos una función para manejar cuando se guarda el PDF
    const handlePDFSaved = () => {
        // Actualizar el 'objectStatus' para reflejar que el documento ha sido completado
        const updatedObjectStatus = objectStatus.map((profileArray) => {
            return profileArray.map((dataObj) => {
                if (dataObj.packageInfo && dataObj.packageInfo.documents) {
                    const updatedDocuments = { ...dataObj.packageInfo.documents };
                    if (updatedDocuments[selectedDoc]) {
                        updatedDocuments[selectedDoc].dataStatus = 'complete';
                    }
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

        // Actualizar el estado y localStorage
        setObjectStatus(updatedObjectStatus);
        localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));

        // Desbloquear el siguiente documento (si corresponde)
        // Puedes agregar lógica adicional aquí si es necesario

        // Cerrar el PDFEditor
        setShowPDFEditor(false);
    };

    return (
        <Container>
            {/* Modal para seleccionar el perfil cuando el documento no tiene owner */}
            <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Seleccione un perfil</Modal.Title>
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

                    {/* Opción para crear un nuevo perfil */}
                    <ListGroup className="mt-3">
                        <ListGroup.Item action onClick={handleCreateNewProfile}>
                            <strong>Crear nuevo perfil</strong>
                        </ListGroup.Item>
                    </ListGroup>
                </Modal.Body>
            </Modal>

            {/* Lista de documentos */}
            <h3>Seleccione un documento para ver, editar o descargar</h3>
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

            {/* Mostrar el PDFEditor si todos los pasos están completos */}
            {showPDFEditor && selectedDoc && (
                <PDFEditor
                    documentType={selectedDoc} // Pasar el tipo de documento seleccionado
                    objectStatus={objectStatus}
                    documentOwner={documentOwner} // Pasar el owner del documento seleccionado
                    backendId={currIdObjDB}
                    ContentComponent={contentComponents[selectedDoc]} // Pasar el componente de contenido adecuado
                    onBack={() => setShowPDFEditor(false)}
                    onPDFSaved={handlePDFSaved}
                />
            )}
        </Container>
    );
};

export default DocumentSelector;
