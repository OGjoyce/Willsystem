import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function ClauseArea({ callFunction, clause }) {
    const [text, setText] = useState('');

    useEffect(() => {
        // Load data from localStorage when component mounts
        const storedFormValues = JSON.parse(localStorage.getItem('formValues'));
        if (storedFormValues && storedFormValues.additional) {
            if (clause === 'custom' && storedFormValues.additional.custom) {
                setText(storedFormValues.additional.custom.customClause || '');
            } else if (clause === 'custom' && storedFormValues.additional.temp_custom) {
                setText(storedFormValues.additional.temp_custom.customClause || '');
            }
            else if (clause === 'other' && storedFormValues.additional.otherWishes) {
                setText(storedFormValues.additional.otherWishes.customClause || '');
            }
        }
    }, [clause]);

    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);

        // Save to localStorage in real-time
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        const additional = storedFormValues.additional || {};

        if (clause === 'custom') {
            additional.temp_custom = {
                Master: 'custom',
                customClause: newText
            };
        } else if (clause === 'other') {
            additional.otherWishes = {
                Master: 'otherWishes',
                customClause: newText
            };
        }

        storedFormValues.additional = additional;
        localStorage.setItem('formValues', JSON.stringify(storedFormValues));
    };

    function handleSwitch(param) {
        if (param === 0) {
            callFunction(false);
        }
        if (param === 1) {
            const obj = {
                customClause: text
            };
            callFunction(obj);
        }
    }

    return (
        <Container>
            <Row>
                <Col sm={4}>
                    <p>{clause !== "other" ? "Custom Clause:" : "Other Wishes:"}</p>
                </Col>
                <Col sm={8}>
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            aria-label="With textarea"
                            id="textAreaCustomClause"
                            value={text}
                            onChange={handleTextChange}
                        />
                    </InputGroup>
                </Col>
            </Row>
            <br />
            <br />
            <Row>
                <Col sm={4}>
                    <Button variant="outline-warning" type="submit" onClick={() => handleSwitch(0)} style={{ width: "100%", position: "relative" }}>
                        <i className="bi bi-arrow-90deg-left"></i>Back
                    </Button>
                </Col>
                <Col sm={8}>
                    <Button variant="outline-info" type="submit" onClick={() => handleSwitch(1)} style={{ width: "100%", position: "relative" }}>
                        <i className="bi bi-check2-all"></i>Finish Custom Clause
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default ClauseArea;