import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Dropdown } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';

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
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [tempData, setTempData] = useState({});

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        if (datas != null) {
            let newTableData = [];
            let newId = 1;

            datas.forEach(element => {
                if (element.married?.firstName && element.married?.lastName && element.married?.relative !== "NA") {
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
        if (amountid !== "" && amountid !== null) {
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

        setToastMessage('Pet guardian added successfully');
        setShowToast(true);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            guardianDataStack = guardianDataStack.filter(obj => obj.id !== itemToDelete);
            setPetGuardianData([...guardianDataStack]);
            saveToLocalStorage(guardianDataStack);
            setToastMessage('Pet guardian removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (index) => {
        setEditingRow(index);
        setTempData({ ...petGuardianData[index] });
    };

    const handleSave = (index) => {
        const updatedData = [...petGuardianData];
        updatedData[index] = tempData;
        setPetGuardianData(updatedData);
        guardianDataStack = updatedData;
        saveToLocalStorage(guardianDataStack);
        setEditingRow(null);
        setTempData({});
        setToastMessage('Pet guardian updated successfully');
        setShowToast(true);
    };

    const handleCancel = () => {
        setEditingRow(null);
        setTempData({});
    };

    const handleDropdownSelect = (key, value) => {
        setTempData({ ...tempData, [key]: value });
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md="6">
                    <Form>
                        <Form.Group controlId="formGuardian">
                            <Form.Label>Select Primary Guardian </Form.Label>
                            <Dropdown onSelect={(eventKey) => setSelectedOptionGuardian(eventKey)}>
                                <Dropdown.Toggle className="w-[100%]" variant="outline-dark" id="dropdown-guardian">
                                    {selectedOptionGuardian || 'Choose...'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-[100%]" >
                                    {tableData.map((name, index) => (
                                        <Dropdown.Item className="w-[100%] text-center" key={index} eventKey={`${name.firstName} ${name.lastName}`}>
                                            {name.firstName + ' ' + name.lastName}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            {validationErrors.guardian && <p className="mt-2 text-sm text-danger">{validationErrors.guardian}</p>}
                        </Form.Group>
                        <Form.Group controlId="formBackup">
                            <Form.Label>Select Backup </Form.Label>
                            <Dropdown onSelect={(eventKey) => setSelectedOptionBackup(eventKey)}>
                                <Dropdown.Toggle className="w-[100%]" variant="outline-dark" id="dropdown-backup">
                                    {selectedOptionBackup || 'Choose...'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-[100%]" >
                                    {tableData.map((name, index) => (
                                        <Dropdown.Item className="w-[100%] text-center" key={index} eventKey={`${name.firstName} ${name.lastName}`}>
                                            {name.firstName + ' ' + name.lastName}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                            {validationErrors.backup && <p className="mt-2 text-sm text-danger">{validationErrors.backup}</p>}
                        </Form.Group>
                        <br />
                        <Form.Group controlId="formAmount">
                            <FloatingLabel controlId="floatingNumber" label="How much money should we give to the guardian">
                                <Form.Control size="sm" type="number" placeholder="0.00" id="amountId" />
                            </FloatingLabel>
                            {validationErrors.amount && <p className="mt-2 text-sm text-danger">{validationErrors.amount}</p>}
                        </Form.Group>
                        <br />
                        <Button size="lg" variant="outline-primary" style={{ width: "100%" }} onClick={handleSubmit}>
                            Add
                        </Button>
                    </Form>
                </Col>
            </Row>

            {validationErrors.pets && <p className="mt-2 text-sm text-center text-danger">{validationErrors.pets}</p>}
            <br />
            {petGuardianData.length > 0 ? (
                <Table striped bordered hover responsive style={{ margin: "auto auto 148px auto" }}>
                    <thead>
                        <tr>
                            <td>Id</td>
                            <th>Guardian</th>
                            <th>Backup</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {petGuardianData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>
                                    {editingRow === index ? (
                                        <Dropdown onSelect={(eventKey) => handleDropdownSelect('guardian', eventKey)}>
                                            <Dropdown.Toggle className="w-[100%]" variant="outline-dark" id={`dropdown-guardian-${index}`}>
                                                {tempData.guardian || 'Choose...'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {tableData.map((name, idx) => (
                                                    <Dropdown.Item key={idx} eventKey={`${name.firstName} ${name.lastName}`}>
                                                        {name.firstName + ' ' + name.lastName}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : (
                                        item.guardian
                                    )}
                                </td>
                                <td>
                                    {editingRow === index ? (
                                        <Dropdown onSelect={(eventKey) => handleDropdownSelect('backup', eventKey)}>
                                            <Dropdown.Toggle className="w-[100%]" variant="outline-dark" id={`dropdown-backup-${index}`}>
                                                {tempData.backup || 'Choose...'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {tableData.map((name, idx) => (
                                                    <Dropdown.Item key={idx} eventKey={`${name.firstName} ${name.lastName}`}>
                                                        {name.firstName + ' ' + name.lastName}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : (
                                        item.backup
                                    )}
                                </td>
                                <td>
                                    {editingRow === index ? (
                                        <Form.Control
                                            type="number"
                                            value={tempData.amount}
                                            onChange={(e) => handleDropdownSelect('amount', e.target.value)}
                                        />
                                    ) : (
                                        item.amount
                                    )}
                                </td>
                                <td>
                                    <div className='d-flex justify-content-around gap-3'>
                                        {editingRow === index ? (
                                            <>
                                                <Button className="w-[50%]" variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                                <Button className="w-[50%]" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-[50%]" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                                <Button className="w-[50%]" variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>Add guardian to see information...</p>
            )}

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this pet guardian?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Pets;