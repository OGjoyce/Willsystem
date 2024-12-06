import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

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
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [idTable, setIdTable] = useState(1

    );
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [tempData, setTempData] = useState({});
    const [petName, setPetName] = useState('');
    const [skipPetGuardian, setSkipPetGuardian] = useState(false)

    useEffect(() => {
        setValidationErrors(errors);

        if (skipPetGuardian) {
            setValidationErrors({})
            guardianDataStack = [undefined]
        } else {
            guardianDataStack = guardianDataStack.filter(obj => obj !== undefined)
        }
    }, [errors, skipPetGuardian]);

    useEffect(() => {
        if (datas != null) {
            guardianDataStack = []
            let newTableData = [];
            let newId = 1;
            let namesList = [];

            datas.forEach(element => {
                if (element?.married?.firstName || element.married?.lastName && element.married?.relative !== "NA") {
                    const fullName = `${element.married.firstName} ${element.married.lastName}`;
                    newTableData.push({
                        id: newId++,
                        firstName: element.married.firstName,
                        lastName: element.married.lastName,
                        relative: element.married.relative
                    });
                    namesList.push(fullName);
                }
                if (element?.relatives) {
                    element.relatives.forEach(relative => {
                        const fullName = `${relative.firstName} ${relative.lastName}`;
                        newTableData.push({
                            id: newId++,
                            firstName: relative.firstName,
                            lastName: relative.lastName,
                            relative: relative.relative
                        });
                        namesList.push(fullName);
                    });
                }
            });

            if (datas[3]?.kidsq?.selection === "true") {
                Object.values(datas[4]?.kids || []).forEach(child => {
                    const fullName = `${child.firstName} ${child.lastName}`;
                    newTableData.push({
                        id: newId++,
                        firstName: child.firstName,
                        lastName: child.lastName,
                        relative: child.relative
                    });
                    namesList.push(fullName);
                });
            }

            setTableData(newTableData);
            setIdentifiersNames(namesList);

        }
    }, [datas]);


    const handleAddPerson = (newPerson) => {
        const fullName = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, fullName]);

        // Also add to tableData
        setTableData(prevData => [...prevData, {
            id: guardianDataStack,
            firstName: newPerson.firstName,
            lastName: newPerson.lastName,
            relative: newPerson.relative
        }]);
        setIdTable(prevId => prevId + 1);

        // Also update datas[5].relatives
        let len = datas[5]?.relatives?.length || 0;
        if (!datas[5]) datas[5] = {};
        if (!datas[5].relatives) datas[5].relatives = [];
        datas[5].relatives[len] = newPerson;
    };

    const handleSubmit = () => {
        setValidationErrors({});
        const petNameTrimmed = petName.trim();
        let amountid = document.getElementById('amountId').value;
        if (amountid !== "") {
            amountid = parseFloat(amountid);
        } else {
            amountid = "N/A"
        }
        const obj = {
            "id": idTable,
            "petName": petNameTrimmed,
            "guardian": selectedOptionGuardian,
            "backup": selectedOptionBackup || "N/A",
            "amount": amountid
        };

        let newErrors = {};
        if (!petNameTrimmed) {
            newErrors.petName = "Pet name is required";
        }

        if (amountid == 0) {
            newErrors.amount = "A valid amount is required";
        }

        if (Number(amountid) && Number(amountid) <= 0 || selectedOptionGuardian === '' || selectedOptionBackup === '' || selectedOptionBackup === selectedOptionGuardian) {


            if (Number(amountid) && Number(amountid) <= 0) {
                newErrors.amount = "A valid amount is required";
            }

            if (selectedOptionBackup === selectedOptionGuardian) {
                newErrors.backup = "Guardian and Backup can't be the same person";
            }

            if (selectedOptionGuardian === '') {
                newErrors.guardian = "A relative selection for guardian is required";
            }

            if (selectedOptionBackup === '') {
                // newErrors.backup = "A relative selection for backup is required";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        if (obj) {
            guardianDataStack.push(obj);
            setPetGuardianData([...guardianDataStack]);
            setIdTable(prevId => prevId + 1);
        }
        setSelectedOptionBackup('');
        setSelectedOptionGuardian('');
        setPetName('');
        document.getElementById('amountId').value = '';

        setToastMessage('Pet guardian added successfully');
        setShowToast(true);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setShowDeleteModal(false);
        setIdTable(idTable - 1)
        if (itemToDelete !== null) {
            guardianDataStack = guardianDataStack.filter(obj => obj.id !== itemToDelete);
            setPetGuardianData([...guardianDataStack]);
            setIdTable(idTable - 1)
            saveToLocalStorage(guardianDataStack);
            setToastMessage('Pet guardian removed successfully');
            setShowToast(true);
            setItemToDelete(null);

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
                        {/* Pet Name Field */}
                        <Form.Group controlId="formPetName" className="mb-3">
                            <Form.Label>Pet Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter pet's name"
                                value={petName}
                                onChange={(e) => setPetName(e.target.value)}
                                isInvalid={!!validationErrors.petName}
                            />
                            <Form.Control.Feedback type="invalid">
                                {validationErrors.petName}
                            </Form.Control.Feedback>
                        </Form.Group>

                        {/* Primary Guardian Selection */}
                        <Form.Group controlId="formGuardian" className="mb-3">
                            <Form.Label>Select Primary Guardian</Form.Label>
                            <AddPersonDropdown
                                options={identifiersNames}
                                label="Choose..."
                                selected={selectedOptionGuardian}
                                onSelect={(value) => setSelectedOptionGuardian(value)}
                                onAddPerson={handleAddPerson}
                                validationErrors={validationErrors}
                                setValidationErrors={setValidationErrors}
                            />
                            {validationErrors.guardian && <p className="mt-2 text-sm text-danger">{validationErrors.guardian}</p>}
                        </Form.Group>

                        {/* Backup Guardian Selection */}
                        <Form.Group controlId="formBackup" className="mb-3">
                            <Form.Label>Select Backup</Form.Label>
                            <AddPersonDropdown
                                options={identifiersNames}
                                label="Choose..."
                                selected={selectedOptionBackup}
                                onSelect={(value) => setSelectedOptionBackup(value)}
                                onAddPerson={handleAddPerson}
                                validationErrors={validationErrors}
                                setValidationErrors={setValidationErrors}
                            />
                            {validationErrors.backup && <p className="mt-2 text-sm text-danger">{validationErrors.backup}</p>}
                        </Form.Group>

                        {/* Amount Field */}
                        <Form.Group className="text-sm mb-3" controlId="formAmount">
                            <FloatingLabel controlId="floatingNumber" label="Amount to Allocate to Guardian">
                                <Form.Control size="sm" type="number" placeholder="0.00" id="amountId" isInvalid={!!validationErrors.amount} />
                                <Form.Control.Feedback type="invalid">
                                    {validationErrors.amount}
                                </Form.Control.Feedback>
                            </FloatingLabel>
                            <Form.Check
                                type="checkbox"
                                id=""
                                className='mb-4'
                                label="No pet guardian"
                                checked={skipPetGuardian}
                                onChange={() => { setSkipPetGuardian(!skipPetGuardian) }}
                            />
                        </Form.Group>

                        {/* Submit Button */}
                        <Button size="lg" variant="outline-primary" style={{ width: "100%" }} onClick={handleSubmit}>
                            Add
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Validation Error for Pets */}
            {validationErrors.pets && <p className="mt-2 text-sm text-center text-danger">{validationErrors.pets}</p>}
            <br />

            {/* Guardians Table */}
            {petGuardianData.length > 0 ? (
                <Table striped bordered hover responsive style={{ margin: "auto auto 148px auto" }}>
                    <thead>
                        <tr>
                            <td>Id</td>
                            <th>Pet Name</th>
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
                                        <Form.Control
                                            type="text"
                                            value={tempData.petName}
                                            onChange={(e) => handleDropdownSelect('petName', e.target.value)}
                                            isInvalid={!tempData.petName}
                                        />
                                    ) : (
                                        item.petName
                                    )}
                                    {editingRow === index && !tempData.petName && (
                                        <p className="mt-2 text-sm text-danger">Pet name is required</p>
                                    )}
                                </td>
                                <td>
                                    {editingRow === index ? (
                                        <AddPersonDropdown
                                            options={identifiersNames}
                                            label="Choose..."
                                            selected={tempData.guardian}
                                            onSelect={(value) => handleDropdownSelect('guardian', value)}
                                            onAddPerson={handleAddPerson}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                        />
                                    ) : (
                                        item.guardian
                                    )}
                                </td>
                                <td>
                                    {editingRow === index ? (
                                        <AddPersonDropdown
                                            options={identifiersNames}
                                            label="Choose..."
                                            selected={tempData.backup}
                                            onSelect={(value) => handleDropdownSelect('backup', value)}
                                            onAddPerson={handleAddPerson}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                        />
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
                                            isInvalid={!tempData.amount || Number(tempData.amount) <= 0}
                                        />
                                    ) : item.amount !== "N/A" ? `$${item.amount.toFixed(2)}` : "N/A"
                                    }
                                    {editingRow === index && (!tempData.amount || Number(tempData.amount) <= 0) && (
                                        <p className="mt-2 text-sm text-danger">A valid amount is required</p>
                                    )}
                                </td>
                                <td>
                                    <div className='d-flex justify-content-around gap-3'>
                                        {editingRow === index ? (
                                            <>
                                                <Button className="w-50" variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                                <Button className="w-50" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-50" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                                <Button className="w-50" variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>Add guardians to see information...</p>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this pet guardian?"
            />

            {/* Toast Notification */}
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Pets;
