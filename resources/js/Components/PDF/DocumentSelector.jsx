import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';
// Import other content components as needed

const contentComponents = {
    Will: WillContent,
    POA1: POA1Content,
    POA2: POA2Content,
    // Add other documents as needed
};

const DocumentSelector = ({ onSelect, errors, object_status, currIdObjDB, availableDocuments }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);

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
                        {availableDocuments.map((doc) => (
                            <Col key={doc}>
                                <Button onClick={() => handleSelect(doc)} style={{ width: "100%" }} variant="outline-dark">
                                    {doc === 'Will' && <><i className="bi bi-file-text"></i> Will</>}
                                    {doc === 'POA1' && <><i className="bi bi-house"></i> POA1 Property</>}
                                    {doc === 'POA2' && <><i className="bi bi-hospital"></i> POA2 Health</>}
                                    {/* Add cases for other documents */}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                    {errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>}
                </>
            ) : (
                <PDFEditor
                    ContentComponent={contentComponents[selectedDoc]}
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
