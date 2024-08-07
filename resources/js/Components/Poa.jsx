import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Dropdown } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

let poaData = {
    poaProperty: { attorney: null, join: null, restrictions: null },
    poaHealth: { attorney: null, join: null, restrictions: null },
    organDonation: false,
    dnr: false
};

export function getPoa() {
    return poaData;
}

export default function Poa({ datas, errors }) {
    const [checkboxes, setCheckboxes] = useState({
        organ: false,
        dnr: false,
    });

    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [firstRender, setFirstRender] = useState(true);
    const [validationErrors, setValidationErrors] = useState(errors)

    useEffect(() => {
        if (datas != null && firstRender) {
            const married = datas[2].married;
            const kids = datas[4].kids;
            const relatives = datas[5].relatives;

            let names = [];

            if (married.length > 0) {
                names.push(`${married.firstName} ${married.lastName}`);
            }

            for (let key in relatives) {
                names.push(`${relatives[key].firstName} ${relatives[key].lastName}`);
            }
            for (let key in kids) {
                names.push(`${kids[key].firstName} ${kids[key].lastName}`);
            }

            setIdentifiersNames(names);
            setFirstRender(false);
        }

        // Cargar datos del localStorage
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedFormValues.poa) {
            poaData = storedFormValues.poa;
            setCheckboxes({
                organ: poaData.organDonation,
                dnr: poaData.dnr
            });
        }
    }, [datas, firstRender]);

    useEffect(() => {
        setValidationErrors(errors)
    }, [errors])

    const updateLocalStorage = () => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.poa = poaData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes(prev => ({
            ...prev,
            [name]: checked,
        }));
        poaData[name === 'organ' ? 'organDonation' : 'dnr'] = checked;
        updateLocalStorage();
    };

    const setCurrentRecepient = (eventKey, event) => {
        setValidationErrors({})
        if (event == null) {
            return;
        }
        const { name, index } = JSON.parse(eventKey);

        switch (index) {
            case 0:
                poaData.poaProperty.attorney = name;
                break;
            case 1:
                poaData.poaProperty.join = name;
                break;
            case 2:
                poaData.poaHealth.attorney = name;
                break;
            case 3:
                poaData.poaHealth.join = name;
                break;
        }
        updateLocalStorage();
    };

    const handleRestrictionChange = (type, event) => {
        setValidationErrors({})
        poaData[type].restrictions = event.target.value;
        updateLocalStorage();
    };

    return (
        <Container>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa0">
                            {poaData.poaProperty.attorney || "Attorney for Property"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 0 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    {validationErrors.poaProperty?.attorney && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.poaProperty?.attorney}</p>}
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa1">
                            {poaData.poaProperty.join || "Joint - Attorney for Property"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 1 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    {validationErrors.poaProperty?.join && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.poaProperty?.join}</p>}
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={3}>
                    <Form.Label>Restrictions on Property</Form.Label>
                </Col>
                <Col sm={9}>
                    <Form.Control
                        as="textarea"
                        id="property-restrictions"
                        value={poaData.poaProperty.restrictions || ""}
                        onChange={(e) => handleRestrictionChange('poaProperty', e)}
                    />
                    {validationErrors.poaProperty?.restrictions && <p className="mt-2 text-sm text-red-600">{validationErrors.poaProperty?.restrictions}</p>}
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa2">
                            {poaData.poaHealth.attorney || "Attorney for Health"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 2 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    {validationErrors.poaHealth?.attorney && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.poaHealth?.attorney}</p>}
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa3">
                            {poaData.poaHealth.join || "Joint - Attorney for Health"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 3 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                    {validationErrors.poaHealth?.join && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.poaHealth?.join}</p>}
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={3}>
                    <Form.Label>Restrictions on Health</Form.Label>
                </Col>
                <Col sm={9}>
                    <Form.Control
                        as="textarea"
                        id="health-restrictions"
                        value={poaData.poaHealth.restrictions || ""}
                        onChange={(e) => handleRestrictionChange('poaHealth', e)}
                    />
                    {validationErrors.poaHealth?.restrictions && <p className="mt-2 text-sm text-red-600">{validationErrors.poaHealth?.restrictions}</p>}
                </Col>
            </Row>
            <br />
            <Form>
                <Row>
                    <Col sm={6}>
                        <Form.Check
                            type="checkbox"
                            id="checkbox1"
                            name="organ"
                            label="Organ Donation"
                            checked={checkboxes.organ}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                    <Col sm={6}>
                        <Form.Check
                            type="checkbox"
                            id="checkbox2"
                            name="dnr"
                            label="DNR (Do Not Resuscitate)"
                            checked={checkboxes.dnr}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}