import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';

// Mapeo de documentos a componentes
const contentComponents = {
    primaryWill: WillContent,
    spousalWill: WillContent,
    secondaryWill: WillContent,
    poaProperty: POA1Content,
    poaHealth: POA2Content,
    // Agregar más mapeos si es necesario
};

const DocumentSelector = ({ onSelect, errors, object_status, currIdObjDB }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Verificamos que object_status no esté vacío y sea un array de arrays
    if (!Array.isArray(object_status) || object_status.length === 0 || !Array.isArray(object_status[0]) || object_status[0].length === 0) {
        return <p>No hay documentos disponibles.</p>;
    }

    // Extraemos el primer elemento en object_status que es un arreglo
    const firstElementArray = object_status[0];

    // Extraemos el primer objeto dentro del primer arreglo
    const firstElement = firstElementArray[0];

    // Verificamos que packageInfo y documents existan
    if (!firstElement.packageInfo || !firstElement.packageInfo.documents) {
        return <p>No hay documentos disponibles.</p>;
    }

    // Obtenemos los documentos disponibles
    const availableDocuments = Object.keys(firstElement.packageInfo.documents);

    // Corregimos el console.log eliminando el [0] y usando la estructura correcta
    console.log('documents', firstElement.packageInfo.documents);

    // Función para verificar si un documento está desbloqueado
    const isDocumentUnlocked = (doc, index) => {
        if (index === 0) return true; // El primer documento siempre está desbloqueado
        const previousDocKey = availableDocuments[index - 1];
        const previousDoc = firstElement.packageInfo.documents[previousDocKey];
        return previousDoc?.dataStatus === "completed";
    };

    const handleSelect = (doc) => {
        setSelectedDoc(doc);
        onSelect(doc);
    };

    const handleBack = () => {
        setSelectedDoc(null);
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
                                    onClick={() => handleSelect(doc)}
                                    style={{ width: "100%" }}
                                    variant="outline-dark"
                                    disabled={!isDocumentUnlocked(doc, index)} // Deshabilitamos si no está desbloqueado
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
                <PDFEditor
                    ContentComponent={contentComponents[selectedDoc]} // Seleccionamos el componente correcto
                    datas={object_status}
                    documentType={selectedDoc}
                    errors={errors}
                    backendId={currIdObjDB}
                    onBack={handleBack}
                />
            )}
        </Container>
    );
};

export default DocumentSelector;
