import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Table, Dropdown
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

let returndata;
export function getWipeoutData() {
    return returndata;
}

let bequestindex = 0;

function Wipeout({ id, datas, errors }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [options, setOptions] = useState([]);
    const [custom, setCustom] = useState(false);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [availableShares, setAvailableShares] = useState(100);
    const [editingRow, setEditingRow] = useState(null);
    const [tempEditData, setTempEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSpecificBeneficiary, setIsSpecificBeneficiary] = useState(false);
    const [isOrganization, setIsOrganization] = useState(false);
    const [firstRender, setFirstRender] = useState(true);

    // State variables for form inputs
    const [beneficiary, setBeneficiary] = useState('');
    const [backup, setBackup] = useState('');
    const [shares, setShares] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        const savedData = formValues.wipeout || {};

        setSelectedCategory(savedData.selectedCategory || null);
        setSelectedOption(savedData.selectedOption || null);
        setCustom(savedData.custom || false);
        setTable_dataBequest(savedData.table_dataBequest || []);
        setAvailableShares(savedData.availableShares || 100);

        if (savedData.table_dataBequest) {
            bequestindex = savedData.table_dataBequest.length;
        }
    }, []);

    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.wipeout = {
            selectedCategory,
            selectedOption,
            custom,
            table_dataBequest,
            availableShares
        };
        localStorage.setItem('formValues', JSON.stringify(formValues));
        returndata = {
            wipeout: formValues.wipeout, timestamp: Date.now()
        };
    }, [selectedCategory, selectedOption, custom, table_dataBequest, availableShares]);

    useEffect(() => {
        const married = datas[2]?.married;
        const marriedStatus = datas[1]?.marriedq?.selection === "true";
        const sosoStatus = datas[1]?.marriedq?.selection === "soso";
        const kids = datas[4]?.kids;
        const relatives = datas[5]?.relatives;
        const kidsq = datas[3]?.kidsq?.selection;

        let names = [];
        const married_names = married?.firstName && married?.lastName ? `${married?.firstName} ${married?.lastName}` : null;
        if (married_names) names.push(married_names);

        if (kidsq === "true" && kids) {
            Object.values(kids).forEach(child => {
                const childName = `${child?.firstName} ${child?.lastName}`;
                names.push(childName);
            });
        }

        if (relatives) {
            Object.values(relatives).forEach(relative => {
                const relativeName = `${relative?.firstName} ${relative?.lastName}`;
                names.push(relativeName);
            });
        }

        setIdentifiersNames(names);

        let newOptions = [
            `${marriedStatus || sosoStatus ? "50% to parents and siblings and 50% to parents and siblings of spouse" : "100% to parents and siblings"}`,
            `${marriedStatus || sosoStatus ? "50% to siblings and 50% to siblings of spouse" : "100% to siblings"}`,
        ];

        setOptions(newOptions);

        if (firstRender) {
            setFirstRender(false);
        }
    }, [datas, firstRender]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setValidationErrors({});
        setCustom(false);
        setTable_dataBequest([]);
        bequestindex = 0;
        setAvailableShares(100);
        setSelectedOption(null);
    };

    const handleCheckboxChange = (e) => {
        setIsSpecificBeneficiary(e.target.checked);
        if (e.target.checked) {
            setSelectedCategory(null);
            setCustom(true);
        } else {
            setCustom(false);
            setTable_dataBequest([]);
            bequestindex = 0;
            setAvailableShares(100);
            setIsOrganization(false);
        }
    };

    const handleOrganizationChange = (e) => {
        setIsOrganization(e.target.checked);
        // Reset beneficiary and backup when changing organization status
        setBeneficiary('');
        setBackup('');
    };

    const handleAddItem = () => {
        let newErrors = {};

        if (!beneficiary) {
            newErrors.beneficiary = "Beneficiary is required";
        }

        if (!backup) {
            newErrors.backup = "Backup is required";
        }
        if (beneficiary === backup) {
            newErrors.backup = "Beneficiary and backup can't be the same";
        }

        const sharesNum = parseFloat(shares);

        if (isNaN(sharesNum) || sharesNum <= 0 || sharesNum > availableShares) {
            newErrors.shares = `Please enter a valid number between 0 and ${availableShares}`;
        }

        if (!isOrganization && !type) {
            newErrors.type = "Type is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        const newItem = {
            id: bequestindex,
            beneficiary,
            backup,
            shares: sharesNum,
            type: isOrganization ? "N/A" : type
        };

        setTable_dataBequest([...table_dataBequest, newItem]);
        setAvailableShares(availableShares - sharesNum);
        bequestindex++;

        // Reset form
        setBeneficiary('');
        setBackup('');
        setShares('');
        if (!isOrganization) {
            setType('');
        }
        setValidationErrors({});

        // Show toast notification
        setToastMessage('Wipeout beneficiary added successfully');
        setShowToast(true);
    };

    const handleEdit = (index) => {
        setEditingRow(index);
        setTempEditData({ ...table_dataBequest[index] });
    };

    const handleSave = (index) => {
        const updatedTable_dataBequest = [...table_dataBequest];
        const previousShares = table_dataBequest[index].shares;
        updatedTable_dataBequest[index] = tempEditData;
        setTable_dataBequest(updatedTable_dataBequest);

        // Update available shares
        const sharesDifference = tempEditData.shares - previousShares;
        setAvailableShares(availableShares - sharesDifference);

        setToastMessage('Wipeout beneficiary updated successfully');
        setShowToast(true);
        setEditingRow(null);
        setTempEditData(null);
    };

    const handleCancel = () => {
        setEditingRow(null);
        setTempEditData(null);
    };

    const handleDelete = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            const deletedItem = table_dataBequest.find(item => item.id === itemToDelete);
            const updatedTable_dataBequest = table_dataBequest.filter(item => item.id !== itemToDelete);

            setTable_dataBequest(updatedTable_dataBequest);
            setAvailableShares(availableShares + deletedItem.shares);
            bequestindex--;

            setToastMessage('Wipeout beneficiary removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleBeneficiarySelect = (value) => {
        setBeneficiary(value);
        setValidationErrors(prevErrors => ({ ...prevErrors, beneficiary: '' }));
    };

    const handleBackupSelect = (value) => {
        setBackup(value);
        setValidationErrors(prevErrors => ({ ...prevErrors, backup: '' }));
    };

    const handleAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);

        let len = Object.keys(datas[5].relatives).length;
        datas[5].relatives[len] = newPerson;
    };

    return (
        <Container>
            <Form>
                <Form.Label style={{ marginBottom: "24px", fontWeight: "bold" }}>Wipeout:</Form.Label>
                <Row>
                    <Col sm={12}>
                        <Dropdown onSelect={handleCategorySelect} style={{ width: "100%", marginBottom: "10px" }}>
                            <Dropdown.Toggle
                                style={{ width: "100%" }}
                                variant={selectedCategory !== null ? "outline-success" : "outline-dark"}
                                id="category-dropdown"
                                disabled={isSpecificBeneficiary}
                            >
                                {selectedCategory !== null ? selectedCategory : 'Select Wipeout'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className={'text-center'} style={{ width: "100%" }}>
                                {options.map((option, index) => (
                                    <Dropdown.Item key={index} eventKey={option}>{option}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Form.Check
                            type="checkbox"
                            id="specific-beneficiary-checkbox"
                            label="Specific Wipeout Beneficiary"
                            checked={isSpecificBeneficiary}
                            onChange={handleCheckboxChange}
                        />
                    </Col>
                </Row>
                {isSpecificBeneficiary && (
                    <Row>
                        <Col sm={12}>
                            <Form.Check
                                type="checkbox"
                                id="organization-checkbox"
                                label="Organization"
                                checked={isOrganization}
                                onChange={handleOrganizationChange}
                            />
                        </Col>
                    </Row>
                )}
            </Form>

            {isSpecificBeneficiary && (
                <>
                    <Form className="mt-3">
                        <Form.Group controlId="beneficiary">
                            <Form.Label>Beneficiary</Form.Label>
                            {isOrganization ? (
                                <Form.Control
                                    type="text"
                                    placeholder="Enter organization name"
                                    value={beneficiary}
                                    onChange={(e) => setBeneficiary(e.target.value)}
                                />
                            ) : (
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    label="Select a beneficiary"
                                    selected={beneficiary}
                                    onSelect={handleBeneficiarySelect}
                                    onAddPerson={handleAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                            )}
                            {validationErrors.beneficiary && <p className="text-danger">{validationErrors.beneficiary}</p>}
                        </Form.Group>

                        <Form.Group controlId="backup">
                            <Form.Label>Backup</Form.Label>
                            {isOrganization ? (
                                <Form.Control
                                    type="text"
                                    placeholder="Enter backup organization name"
                                    value={backup}
                                    onChange={(e) => setBackup(e.target.value)}
                                />
                            ) : (
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    label="Select a backup"
                                    selected={backup}
                                    onSelect={handleBackupSelect}
                                    onAddPerson={handleAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                            )}
                            {validationErrors.backup && <p className="text-danger">{validationErrors.backup}</p>}
                        </Form.Group>

                        <Form.Group controlId="shares">
                            <Form.Label>Shares %</Form.Label>
                            <Form.Control
                                type="number"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                            />
                            {validationErrors.shares && <p className="text-danger">{validationErrors.shares}</p>}
                        </Form.Group>

                        {!isOrganization && (
                            <Form.Group controlId="type">
                                <Form.Label>Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">Select type</option>
                                    <option value="Per Stirpes">Per Stirpes</option>
                                    <option value="Per Capita">Per Capita</option>
                                </Form.Control>
                                {validationErrors.type && <p className="text-danger">{validationErrors.type}</p>}
                            </Form.Group>
                        )}

                        <Button variant="outline-success" onClick={handleAddItem}>Add Wipeout Beneficiary</Button>
                    </Form>

                    <Table striped bordered hover responsive className="mt-3">
                        <thead>
                            <tr>
                                <th>Beneficiary</th>
                                <th>Backup</th>
                                <th>Shares %</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table_dataBequest.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No wipeout beneficiaries added yet.</td>
                                </tr>
                            ) : (
                                table_dataBequest.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            {editingRow === index ? (
                                                item.type === "N/A" ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={tempEditData.beneficiary}
                                                        onChange={(e) => setTempEditData({ ...tempEditData, beneficiary: e.target.value })}
                                                    />
                                                ) : (
                                                    <AddPersonDropdown
                                                        options={identifiers_names}
                                                        label="Select a beneficiary"
                                                        selected={tempEditData.beneficiary}
                                                        onSelect={(value) => setTempEditData({ ...tempEditData, beneficiary: value })}
                                                        onAddPerson={handleAddPerson}
                                                        validationErrors={validationErrors}
                                                        setValidationErrors={setValidationErrors}
                                                    />
                                                )
                                            ) : (
                                                item.beneficiary
                                            )}
                                        </td>
                                        <td>
                                            {editingRow === index ? (
                                                item.type === "N/A" ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={tempEditData.backup}
                                                        onChange={(e) => setTempEditData({ ...tempEditData, backup: e.target.value })}
                                                    />
                                                ) : (
                                                    <AddPersonDropdown
                                                        options={identifiers_names}
                                                        label="Select a backup"
                                                        selected={tempEditData.backup}
                                                        onSelect={(value) => setTempEditData({ ...tempEditData, backup: value })}
                                                        onAddPerson={handleAddPerson}
                                                        validationErrors={validationErrors}
                                                        setValidationErrors={setValidationErrors}
                                                    />
                                                )
                                            ) : (
                                                item.backup
                                            )}
                                        </td>
                                        <td>
                                            {editingRow === index ? (
                                                <Form.Control
                                                    type="number"
                                                    value={tempEditData.shares}
                                                    onChange={(e) => setTempEditData({ ...tempEditData, shares: Number(e.target.value) })}
                                                />
                                            ) : (
                                                item.shares
                                            )}
                                        </td>
                                        <td>
                                            {editingRow === index && item.type !== "N/A" ? (
                                                <Form.Control
                                                    as="select"
                                                    value={tempEditData.type}
                                                    onChange={(e) => setTempEditData({ ...tempEditData, type: e.target.value })}
                                                >
                                                    <option value="Per Stirpes">Per Stirpes</option>
                                                    <option value="Per Capita">Per Capita</option>
                                                </Form.Control>
                                            ) : (
                                                item.type
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
                                ))
                            )}
                        </tbody>
                    </Table>
                </>
            )}

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this wipeout beneficiary?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Wipeout;
