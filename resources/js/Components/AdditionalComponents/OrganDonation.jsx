import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Image } from 'react-bootstrap';
import organIcon from '../../../organdonationicon2.png';
import bodyIcon from '../../../bodycremationicon.png';
import buriedIcon from '../../../buriedicon.png';
import 'bootstrap-icons/font/bootstrap-icons.css';

function OrganDonation({ callFunction }) {
    const [checkedState, setCheckedState] = useState({
        organdonation: false,
        cremation: false,
        buried: false
    });

    useEffect(() => {
        // Cargar datos del localStorage cuando el componente se monta
        const storedFormValues = JSON.parse(localStorage.getItem('formValues'));
        if (storedFormValues && storedFormValues.additional && storedFormValues.additional.standard) {
            const standardSlave = storedFormValues.additional.standard.Slave;
            setCheckedState(standardSlave);
        }
    }, []);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        const newCheckedState = {
            ...checkedState,
            [name]: checked
        };
        setCheckedState(newCheckedState);

        // Guardar en localStorage en tiempo real
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (!storedFormValues.additional) storedFormValues.additional = {};
        storedFormValues.additional.standard = {
            Master: "standard",
            Slave: newCheckedState
        };
        localStorage.setItem('formValues', JSON.stringify(storedFormValues));
    };

    function handleSwitch(param) {
        if (param === 0) {
            callFunction(false);
        }
        if (param === 1) {
            const obj = {
                Master: "standard",
                Slave: checkedState
            };
            callFunction(obj);
        }
    }

    return (
        <Container>
            <Form>
                <Row>
                    <Col sm={4}>
                        <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={organIcon} rounded />
                    </Col>
                    <Col sm={4}>
                        <Form.Check
                            type="checkbox"
                            id="organdonation"
                            name="organdonation"
                            label="Organ Donation"
                            checked={checkedState.organdonation}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={bodyIcon} rounded />
                    </Col>
                    <Col sm={4}>
                        <Form.Check
                            type="checkbox"
                            id="cremation"
                            name="cremation"
                            label="Body Cremation"
                            checked={checkedState.cremation}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={buriedIcon} rounded />
                    </Col>
                    <Col sm={4}>
                        <Form.Check
                            type="checkbox"
                            id="buried"
                            name="buried"
                            label="Buried"
                            checked={checkedState.buried}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        <Button variant="outline-warning" type="button" onClick={() => handleSwitch(0)} style={{ width: "100%", position: "relative" }}>
                            <i className="bi bi-arrow-90deg-left"></i>Back
                        </Button>
                    </Col>
                    <Col sm={8}>
                        <Button variant="outline-info" type="button" onClick={() => handleSwitch(1)} style={{ width: "100%", position: "relative" }}>
                            <i className="bi bi-check2-all"></i>Finish Selection
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default OrganDonation;