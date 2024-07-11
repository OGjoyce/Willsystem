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

export default function Poa({ datas }) {
    const [checkboxes, setCheckboxes] = useState({
        organ: false,
        dnr: false,
    });

    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [firstRender, setFirstRender] = useState(true);

    useEffect(() => {
        if (datas != null && firstRender) {
            const married = datas[2].married;
            const relatives = datas[5].relatives;

            let names = [];

            names.push(`${married.firstName} ${married.lastName}`);

            for (let key in relatives) {
                names.push(`${relatives[key].firstName} ${relatives[key].lastName}`);
            }

            setIdentifiersNames(names);
            setFirstRender(false);
        }
    }, [datas, firstRender]);

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes(prev => ({
            ...prev,
            [name]: checked,
        }));
        poaData[name === 'organ' ? 'organDonation' : 'dnr'] = checked;
        console.log(poaData);
    };

    const setCurrentRecepient = (eventKey, event) => {
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
        console.log(poaData);
    };

    const handleRestrictionChange = (type, event) => {
        poaData[type].restrictions = event.target.value;
        console.log(poaData);
    };

    return (
        <Container>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa0">
                            Attorney for Property
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 0 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa1">
                            Joint - Attorney for Property
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 1 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
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
                        onChange={(e) => handleRestrictionChange('poaProperty', e)}
                    />
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa2">
                            Attorney for Health
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 2 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <br />
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="poa3">
                            Joint - Attorney for Health
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ width: "100%" }}>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={JSON.stringify({ name: name, index: 3 })}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
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
                        onChange={(e) => handleRestrictionChange('poaHealth', e)}
                    />
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