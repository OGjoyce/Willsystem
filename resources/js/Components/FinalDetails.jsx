import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, InputGroup } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function getFinalDetails() {
    const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
    return storedFormValues.finalDetails || {};
}

export default function FinalDetails({ datas }) {
    const [finalDetails, setFinalDetails] = useState({
        specialInstructions: '',
        pickup: false
    });

    useEffect(() => {
        // Cargar datos del localStorage cuando el componente se monta
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedFormValues.finalDetails) {
            setFinalDetails(storedFormValues.finalDetails);
        }
    }, []);

    const updateLocalStorage = (newDetails) => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.finalDetails = newDetails;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleSpecialInstructionsChange = (event) => {
        const newDetails = {
            ...finalDetails,
            specialInstructions: event.target.value
        };
        setFinalDetails(newDetails);
        updateLocalStorage(newDetails);
    };

    const handleCheckboxChange = (event) => {
        const { checked } = event.target;
        const newDetails = {
            ...finalDetails,
            pickup: checked
        };
        setFinalDetails(newDetails);
        updateLocalStorage(newDetails);
    };

    // Cálculo del tiempo transcurrido
    const initialTimeStamp = datas[0]?.personal?.timestamp || Date.now();
    const finalTimeStamp = datas[13]?.poa?.timestamp || Date.now();
    const actualTimeStamp = finalTimeStamp - initialTimeStamp;
    const totalMinutes = Math.floor(actualTimeStamp / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return (
        <Container>
            <Form>
                <Row>
                    <Col sm={12}>
                        <p>Elapsed time: {hours} hour(s) and {minutes} minute(s)</p>
                    </Col>
                </Row>
                <Row>
                    <InputGroup>
                        <Col sm={3}>
                            <Form.Label>Special Request for lawyer</Form.Label>
                        </Col>
                        <Col sm={9}>
                            <Form.Control
                                as="textarea"
                                aria-label="With textarea"
                                id="textArea"
                                value={finalDetails.specialInstructions}
                                onChange={handleSpecialInstructionsChange}
                            />
                        </Col>
                    </InputGroup>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Form.Check
                            type="checkbox"
                            id="checkbox1"
                            name="officePick"
                            label="Client Wants To Pick Up Wills & POAs at Office"
                            checked={finalDetails.pickup}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}