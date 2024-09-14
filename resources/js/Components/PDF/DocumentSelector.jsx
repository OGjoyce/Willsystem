import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import PDFEditor from './PDFEditor';
import WillContent from './Content/WillContent';
import POA1Content from './Content/POA1Content';
import POA2Content from './Content/POA2Content';

const DocumentSelector = ({ onSelect, errors, object_status, currIdObjDB }) => {
    const [selectedDoc, setSelectedDoc] = useState(null);

    const handleSelect = (doc) => {
        console.log("selected");
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
                        <Col>
                            <Button onClick={() => handleSelect('Will')} style={{ width: "100%" }} variant="outline-dark">
                                <i className="bi bi-file-text"></i> Will
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={() => handleSelect('POA1')} style={{ width: "100%" }} variant="outline-dark">
                                <i className="bi bi-house"></i> POA1 Property
                            </Button>
                        </Col>
                        <Col>
                            <Button onClick={() => handleSelect('POA2')} style={{ width: "100%" }} variant="outline-dark">
                                <i className="bi bi-hospital"></i> POA2 Health
                            </Button>
                        </Col>
                    </Row>
                    {errors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{errors.documentDOM}</p>}
                </>
            ) : (
                <PDFEditor
                    ContentComponent={
                        selectedDoc === 'Will' ? WillContent :
                            selectedDoc === 'POA1' ? POA1Content :
                                POA2Content
                    }
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
