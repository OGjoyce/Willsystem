import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

let guardianDataStack = [];

export function getPetInfo() {
    return guardianDataStack;
}

function Pets({ datas, errors }) {
    const [selectedOptionGuardian, setSelectedOptionGuardian] = useState('');
    const [selectedOptionBackup, setSelectedOptionBackup] = useState('');
    const [petGuardianData, setPetGuardianData] = useState([]);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [tableData, setTableData] = useState([]);
    const [idTable, setIdTable] = useState(1);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        if (datas != null) {
            let newTableData = [];
            let newId = 1;

            datas.forEach(element => {
                if (element.married?.firstName && element.married.relative !== "NA") {
                    newTableData.push({
                        id: newId++,
                        firstName: element.married.firstName,
                        lastName: element.married.lastName,
                        relative: element.married.relative
                    });
                }
                if (element.relatives) {
                    element.relatives.map(relative => {
                        newTableData.push({
                            id: newId++,
                            firstName: relative.firstName,
                            lastName: relative.lastName,
                            relative: relative.relative
                        });
                    })
                }
            });


            if (datas[3].kidsq.selection === "true") {
                Object.values(datas[4].kids).forEach(child => {
                    newTableData.push({
                        id: newId++,
                        firstName: child.firstName,
                        lastName: child.lastName,
                        relative: child.relative
                    });
                });
            }

            setTableData(newTableData);
            setIdTable(newId);
        }
    }, [datas]);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem('formValues'));
        if (savedData && savedData.pets) {
            guardianDataStack = savedData.pets;
            setPetGuardianData(savedData.pets);
            setIdTable(savedData.pets.length > 0 ? savedData.pets[savedData.pets.length - 1].id + 1 : 1);
        }
    }, []);

    const saveToLocalStorage = (data) => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.pets = data;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleSubmit = (e) => {
        setValidationErrors({});
        var amountid = document.getElementById('amountId').value;
        if (amountid != "" || amountid != null) {
            amountid = parseFloat(amountid);
        }
        var obj = {
            "id": idTable,
            "guardian": selectedOptionGuardian,
            "backup": selectedOptionBackup,
            "amount": amountid
        }

        let newErrors = {};
        if (!Number(amountid) || Number(amountid) <= 0 || selectedOptionGuardian === '' || selectedOptionBackup === '' || selectedOptionBackup === selectedOptionGuardian) {
            if (!Number(amountid) || Number(amountid) <= 0) {
                newErrors.amount = "A valid amount is required";
            }

            if (selectedOptionBackup === selectedOptionGuardian) {
                newErrors.backup = "Guardian and Backup can't be the same person";
            }

            if (selectedOptionGuardian === '') {
                newErrors.guardian = "A relative selection for guardian is required";
            }

            if (selectedOptionBackup === '') {
                newErrors.backup = "A relative selection for backup is required";
            }

            setValidationErrors(newErrors);
            return null;
        }

        if (obj) {
            guardianDataStack.push(obj);
            setPetGuardianData([...guardianDataStack]);
            saveToLocalStorage(guardianDataStack);
            setIdTable(prevId => prevId + 1);
        }
        setSelectedOptionBackup('');
        setSelectedOptionGuardian('');
        document.getElementById('amountId').value = '';
    };

    const handleDelete = (id) => {
        guardianDataStack = guardianDataStack.filter(obj => obj.id !== id);
        setPetGuardianData([...guardianDataStack]);
        saveToLocalStorage(guardianDataStack);
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="6">
                    <Form>
                        <Form.Group controlId="formGuardian">
                            <Form.Label>Select Primary Guardian </Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedOptionGuardian}
                                onChange={(e) => setSelectedOptionGuardian(e.target.value)}
                                size="lg"
                            >
                                <option value="">Choose...</option>
                                {tableData.map((name, index) => (
                                    <option key={index} value={`${name.firstName} ${name.lastName}`}>
                                        {name.firstName + ' ' + name.lastName}
                                    </option>
                                ))}
                            </Form.Control>
                            {validationErrors.guardian && <p className="mt-2 text-sm text-red-600">{validationErrors.guardian}</p>}
                        </Form.Group>
                        <Form.Group controlId="formBackup">
                            <Form.Label>Select Backup </Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedOptionBackup}
                                onChange={(e) => setSelectedOptionBackup(e.target.value)}
                            >
                                <option disabled={true} value="">Choose...</option>
                                {tableData.map((name, index) => (
                                    <option key={index} value={`${name.firstName} ${name.lastName}`}>
                                        {name.firstName + ' ' + name.lastName}
                                    </option>
                                ))}
                            </Form.Control>
                            {validationErrors.backup && <p className="mt-2 text-sm text-red-600">{validationErrors.backup}</p>}
                        </Form.Group>
                        <br />
                        <Form.Group controlId="formAmount">
                            <FloatingLabel controlId="floatingNumber" label="Enter the Amount in $">
                                <Form.Control size="sm" type="number" placeholder="0.00" id="amountId" />
                            </FloatingLabel>
                            {validationErrors.amount && <p className="mt-2 text-sm text-red-600">{validationErrors.amount}</p>}
                        </Form.Group>
                        <br />
                        <Button size="lg" variant="outline-primary" style={{ width: "100%" }} onClick={handleSubmit}>
                            Add
                        </Button>
                    </Form>
                </Col>
            </Row>

            {validationErrors.pets && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.pets}</p>}
            <br />
            {petGuardianData.length > 0 ? (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <td>Id</td>
                            <th>Guardian</th>
                            <th>Backup</th>
                            <th>Amount</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {petGuardianData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.guardian}</td>
                                <td>{item.backup}</td>
                                <td>{item.amount}</td>
                                <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>Add guardian to see information...</p>
            )}
        </Container>
    );
}

export default Pets;
