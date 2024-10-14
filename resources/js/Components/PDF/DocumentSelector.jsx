import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';
import PoaHealth from '../PoaHealth';
// Import other content components as needed

// Mapeo de documentos a componentes
const contentComponents = {
    primaryWill: WillContent,
    spousalWill: WillContent,
    secondaryWill: WillContent,
    poaProperty: POA1Content,
    poaHealth: POA2Content,
    // Agregar más mapeos si es necesario
};

const DocumentSelector = ({ onSelect, errors, object_status, currIdObjDB, availableDocuments, setCurrentDocument, setCurrentProfile }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Function to check if a document can be selected
    const isDocumentUnlocked = (doc, index) => {
        // Verificamos si los documentos anteriores están completos
        if (index === 0) return true; // El primer documento siempre está desbloqueado
        return object_status[availableDocuments[index - 1]]?.completed; // Verifica si el anterior está completado
    };

    const handleSelect = (doc) => {
        setSelectedDoc(doc);
        onSelect(doc);
        setCurrentDocument(doc); // Aquí se setea el documento actual
        setCurrentProfile(object_status.personal.email); // Aquí se setea el perfil actual
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
                            <Col key={doc}>
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
                                    {/* Add cases for other documents */}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                    {errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>}
                </>
            ) : (
                <PDFEditor
                    ContentComponent={contentComponents[selectedDoc]} // Aquí seleccionamos el componente correcto
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
