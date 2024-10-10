import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Card, Table
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';

// Initialize Property POA data
let poaPropertyData = {
    poaProperty: null,
    timestamp: Date.now()
};

// Function to retrieve Property POA data
export function getPoaProperty() {
    return poaPropertyData;
}

const PoaProperty = ({ datas, errors }) => {
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [validationErrors, setValidationErrors] = useState(errors || {});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [editing, setEditing] = useState(false);
    const [tempData, setTempData] = useState({});
    const [formData, setFormData] = useState({
        attorney: '',
        backups: [],
        restrictions: ''
    });

    // Populate identifiersNames based on provided datas
    useEffect(() => {
        if (datas) {
            const names = [];
            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives;

            if (married?.firstName && married?.lastName) {
                names.push(`${married.firstName} ${married.lastName}`);
            }

            if (relatives) {
                for (let key in relatives) {
                    names.push(`${relatives[key].firstName} ${relatives[key].lastName}`);
                }
            }

            if (kids) {
                for (let key in kids) {
                    names.push(`${kids[key].firstName} ${kids[key].lastName}`);
                }
            }

            setIdentifiersNames(names);
        }

        // Retrieve stored form values from localStorage
        const storedFormValues = JSON.parse(localStorage.getItem('poaPropertyValues')) || {};
        if (storedFormValues.poaProperty) {
            poaPropertyData = storedFormValues;
            setFormData({
                ...poaPropertyData.poaProperty
            });
        }
    }, [datas]);

    // Function to update localStorage with current POA data
    const updateLocalStorage = () => {
        localStorage.setItem('poaPropertyValues', JSON.stringify(poaPropertyData));
    };

    // Handle input changes for text fields
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle attorney selection from dropdown
    const handleSelectAttorney = (value) => {
        setFormData(prev => ({ ...prev, attorney: value }));
        setValidationErrors(prevErrors => ({ ...prevErrors, attorney: '' }));
    };

    // Add a new person to the identifiersNames and relatives list
    const handleAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);

        if (!datas[5]) datas[5] = {};
        if (!datas[5].relatives) datas[5].relatives = [];
        datas[5].relatives.push(newPerson);
    };

    // Add a new backup attorney
    const addBackup = () => {
        setFormData(prev => ({
            ...prev,
            backups: [...prev.backups, '']
        }));
    };

    // Handle backup selection changes
    const handleBackupChange = (index, value) => {
        const newBackups = [...formData.backups];
        newBackups[index] = value;
        setFormData(prev => ({ ...prev, backups: newBackups }));
        setValidationErrors(prevErrors => ({ ...prevErrors, backups: '' }));
    };

    // Delete a backup attorney
    const handleDeleteBackup = (index) => {
        const newBackups = formData.backups.filter((_, idx) => idx !== index);
        setFormData(prev => ({ ...prev, backups: newBackups }));
    };

    // Handle form submission
    const handleSubmit = () => {
        setValidationErrors({});

        let errors = {};

        if (!formData.attorney) {
            errors.attorney = 'Attorney is required';
        }

        if (formData.backups.includes(formData.attorney)) {
            errors.backups = 'Backup cannot be the same as the attorney';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        poaPropertyData.poaProperty = {
            attorney: formData.attorney,
            backups: formData.backups,
            restrictions: formData.restrictions
        };
        poaPropertyData.timestamp = Date.now();
        updateLocalStorage();
        setFormData({
            attorney: '',
            backups: [],
            restrictions: ''
        });
        setToastMessage('Property POA added successfully');
        setShowToast(true);
    };

    // Handle deletion of POA
    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    // Confirm deletion
    const confirmDelete = () => {
        poaPropertyData.poaProperty = null;
        updateLocalStorage();
        setToastMessage('Property POA removed successfully');
        setShowToast(true);
        setShowDeleteModal(false);
        setEditing(false);
    };

    // Handle editing of POA
    const handleEdit = () => {
        setEditing(true);
        setTempData({
            ...poaPropertyData.poaProperty,
            backups: poaPropertyData.poaProperty.backups || []
        });
    };

    // Save edited POA
    const handleSave = () => {
        let errors = {};

        if (!tempData.attorney) {
            errors.attorney = 'Attorney is required';
        }

        if (tempData.backups.includes(tempData.attorney)) {
            errors.backups = 'Backup cannot be the same as the attorney';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        poaPropertyData.poaProperty = {
            attorney: tempData.attorney,
            backups: tempData.backups,
            restrictions: tempData.restrictions
        };
        poaPropertyData.timestamp = Date.now();
        updateLocalStorage();
        setEditing(false);
        setTempData({});
        setToastMessage('Property POA updated successfully');
        setShowToast(true);
    };

    // Cancel editing
    const handleCancel = () => {
        setEditing(false);
        setTempData({});
    };

    // Add a backup in edit mode
    const addBackupToRow = () => {
        const newBackups = [...tempData.backups, ''];
        setTempData({ ...tempData, backups: newBackups });
    };

    return (
        <Container>
            {!poaPropertyData.poaProperty && (
                <Form>
                    <Card className="mb-4">
                        <Card.Header as="h5">Add New Property Power of Attorney</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col sm={12}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Attorney</Form.Label>
                                        <AddPersonDropdown
                                            options={identifiersNames}
                                            label="Select attorney..."
                                            selected={formData.attorney}
                                            onSelect={handleSelectAttorney}
                                            onAddPerson={handleAddPerson}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                        />
                                        {validationErrors.attorney && <p className="text-danger">{validationErrors.attorney}</p>}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Backups (optional):</Form.Label>
                                {formData.backups.map((backup, index) => (
                                    <div key={index} className="d-flex align-items-center mb-2">
                                        <AddPersonDropdown
                                            options={identifiersNames}
                                            label={`Select backup ${index + 1}...`}
                                            selected={backup}
                                            onSelect={(value) => handleBackupChange(index, value)}
                                            onAddPerson={handleAddPerson}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                        />
                                        <Button variant="outline-danger" onClick={() => handleDeleteBackup(index)} className="ms-2">
                                            <i className="bi bi-trash me-2"></i>Delete
                                        </Button>
                                    </div>
                                ))}

                                <Button variant="outline-secondary" onClick={addBackup} className="mt-2 w-100">
                                    <i className="bi bi-plus-circle me-2"></i>Add Backup
                                </Button>
                                {validationErrors.backups && <p className="text-danger">{validationErrors.backups}</p>}
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Restrictions</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="restrictions"
                                    value={formData.restrictions}
                                    onChange={handleInputChange}
                                    placeholder="Enter restrictions..."
                                />
                            </Form.Group>

                            <Button className='w-100' variant="outline-success" onClick={handleSubmit}>
                                <i className="bi bi-check-circle me-2"></i>Save POA
                            </Button>
                        </Card.Body>
                    </Card>
                </Form>
            )}

            {/* Display existing POA */}
            {poaPropertyData.poaProperty && (
                <Card className="mt-4">
                    <Card.Header as="h5">Existing Property Power of Attorney</Card.Header>
                    <Card.Body>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Attorney</th>
                                    <th>Backups</th>
                                    <th>Restrictions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{editing ?
                                        <AddPersonDropdown
                                            options={identifiersNames}
                                            label="Select attorney..."
                                            selected={tempData.attorney}
                                            onSelect={(value) => setTempData({ ...tempData, attorney: value })}
                                            onAddPerson={handleAddPerson}
                                            validationErrors={validationErrors}
                                            setValidationErrors={setValidationErrors}
                                        />
                                        : poaPropertyData.poaProperty.attorney}
                                    </td>
                                    <td>{editing ?
                                        <>
                                            {tempData.backups.map((backup, idx) => (
                                                <div key={idx} className="d-flex align-items-center mb-2">
                                                    <AddPersonDropdown
                                                        options={identifiersNames}
                                                        label={`Select backup ${idx + 1}...`}
                                                        selected={backup}
                                                        onSelect={(value) => {
                                                            const newBackups = [...tempData.backups];
                                                            newBackups[idx] = value;
                                                            setTempData({ ...tempData, backups: newBackups });
                                                        }}
                                                        onAddPerson={handleAddPerson}
                                                        validationErrors={validationErrors}
                                                        setValidationErrors={setValidationErrors}
                                                    />
                                                    <Button variant="outline-danger" onClick={() => {
                                                        const newBackups = [...tempData.backups];
                                                        newBackups.splice(idx, 1);
                                                        setTempData({ ...tempData, backups: newBackups });
                                                    }} className="ms-2">
                                                        <i className="bi bi-trash me-2"></i>Delete
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={addBackupToRow}
                                                className="w-100 mt-1"
                                            >
                                                <i className="bi bi-plus-circle me-2"></i>Add Backup
                                            </Button>
                                            {validationErrors.backups && <p className="text-danger">{validationErrors.backups}</p>}
                                        </>
                                        : poaPropertyData.poaProperty.backups.join(', ')}
                                    </td>
                                    <td>{editing ?
                                        <Form.Control as="textarea" rows={2} value={tempData.restrictions} onChange={(e) => setTempData({ ...tempData, restrictions: e.target.value })} />
                                        : poaPropertyData.poaProperty.restrictions}
                                    </td>
                                    <td>
                                        <div className='d-flex justify-content-around gap-3'>
                                            {editing ? (
                                                <>
                                                    <Button variant="outline-success" size="sm" onClick={handleSave} className="me-1 w-50">
                                                        <i className="bi bi-check-circle me-1"></i>Save
                                                    </Button>
                                                    <Button variant="outline-secondary" size="sm" onClick={handleCancel} className="w-50">
                                                        <i className="bi bi-x-circle me-1"></i>Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button variant="outline-warning" size="sm" onClick={handleEdit} className="me-1 w-50">
                                                        <i className="bi bi-pencil me-1"></i>Edit
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={handleDelete} className="w-50">
                                                        <i className="bi bi-trash me-1"></i>Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Confirmation Modal for deletion */}
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this Property POA?"
            />

            {/* Toast notification */}
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
};

export default PoaProperty;
