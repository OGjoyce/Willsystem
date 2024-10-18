import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Card, Table
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';

// Initialize Health POA data
let poaHealthData = {
    poaHealth: null,
    organDonation: false,
    dnr: false,
    statements: {}, // Stores selected declarations and options
    timestamp: Date.now()
};

// Function to retrieve Health POA data
export function getPoaHealth() {
    return poaHealthData;
}

const PoaHealth = ({ datas, errors }) => {
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
        restrictions: '',
        statements: {} // Stores selected declarations and options
    });
    const [organDonation, setOrganDonation] = useState(false);
    const [dnr, setDnr] = useState(false);

    // Define available declarations and their options
    const declarations = [
        {
            id: 'terminalCondition',
            label: 'If I have an incurable and irreversible terminal condition that will result in my death, I direct that:',
            options: [
                'I not be given life support or other life-prolonging treatment;',
                'I not receive tube feeding, even if withholding such feeding would hasten my death;',
                'Should I develop another separate condition that threatens my life, I not be given active treatment for said illnesses.'
            ]
        },
        {
            id: 'persistentlyUnconscious',
            label: 'If I am diagnosed as persistently unconscious and, to a reasonable degree of medical certainty, I will not regain consciousness, I direct that:',
            options: [
                'I not be kept on any artificial life support;',
                'I not receive tube feeding, even if withholding such feeding would hasten my death;',
                'Should I develop another separate condition that threatens my life, I not be given active treatment for said illnesses.'
            ]
        },
        {
            id: 'severelyImpaired',
            label: 'If I am diagnosed as being severely and permanently mentally impaired, I direct that:',
            options: [
                'I not be kept on any artificial life support;',
                'I not receive tube feeding, even if withholding such feeding would hasten my death;',
                'Should I develop another separate condition that threatens my life, I not be given active treatment for said illnesses.'
            ]
        },
        {
            id: 'violentBehavior',
            label: 'If I am suffering from one of the above-mentioned conditions and if my behaviour becomes violent or is otherwise degrading, I want my symptoms to be controlled with appropriate drugs, even if that would worsen my physical condition or shorten my life.'
        },
        {
            id: 'painManagement',
            label: 'If I am suffering from one of the above-mentioned conditions and I appear to be in pain, I want my symptoms to be controlled with appropriate drugs, even if that would worsen my physical condition or shorten my life.'
        }
    ];

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

    }, [datas]);

    // Function to update localStorage with current POA data
    const updateLocalStorage = () => {
    };

    // Handle input changes for text fields and checkboxes
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

    // Handle declaration checkbox changes
    const handleDeclarationChange = (declarationId, optionIndex = null) => {
        setFormData(prev => {
            const updatedStatements = { ...prev.statements };

            if (optionIndex === null) {
                // Toggle the main declaration checkbox
                if (updatedStatements[declarationId]) {
                    // If unchecking, also uncheck all sub-options
                    delete updatedStatements[declarationId];
                    const decl = declarations.find(d => d.id === declarationId);
                    if (decl && decl.options) {
                        decl.options.forEach((_, idx) => {
                            delete updatedStatements[`${declarationId}_option_${idx}`];
                        });
                    }
                } else {
                    updatedStatements[declarationId] = true;
                    const decl = declarations.find(d => d.id === declarationId);
                    if (decl && decl.options) {
                        decl.options.forEach((_, idx) => {
                            updatedStatements[`${declarationId}_option_${idx}`] = true;
                        });
                    }
                }
            } else {
                // Toggle sub-option checkbox
                const key = `${declarationId}_option_${optionIndex}`;
                if (updatedStatements[key]) {
                    delete updatedStatements[key];
                } else {
                    updatedStatements[key] = true;
                }

                // If any sub-option is unchecked, also uncheck the main declaration
                const decl = declarations.find(d => d.id === declarationId);
                if (decl && decl.options) {
                    const allOptionsChecked = decl.options.every((_, idx) => updatedStatements[`${declarationId}_option_${idx}`]);
                    if (!allOptionsChecked) {
                        delete updatedStatements[declarationId];
                    }
                }
            }

            return {
                ...prev,
                statements: updatedStatements
            };
        });
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

        poaHealthData.poaHealth = {
            attorney: formData.attorney,
            backups: formData.backups,
            restrictions: formData.restrictions
        };
        poaHealthData.organDonation = organDonation;
        poaHealthData.dnr = dnr;
        poaHealthData.statements = formData.statements; // Store selected declarations
        poaHealthData.timestamp = Date.now();
        updateLocalStorage();
        setFormData({
            attorney: '',
            backups: [],
            restrictions: '',
            statements: {}
        });
        setOrganDonation(false);
        setDnr(false);
        setToastMessage('Health POA added successfully');
        setShowToast(true);
    };

    // Handle deletion of POA
    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    // Confirm deletion
    const confirmDelete = () => {
        poaHealthData.poaHealth = null;
        poaHealthData.organDonation = false;
        poaHealthData.dnr = false;
        poaHealthData.statements = {};
        updateLocalStorage();
        setToastMessage('Health POA removed successfully');
        setShowToast(true);
        setShowDeleteModal(false);
        setEditing(false);
    };

    // Handle editing of POA
    const handleEdit = () => {
        setEditing(true);
        setTempData({
            ...poaHealthData.poaHealth,
            backups: poaHealthData.poaHealth.backups || [],
            statements: poaHealthData.statements || {}
        });
        setOrganDonation(poaHealthData.organDonation || false);
        setDnr(poaHealthData.dnr || false);
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

        poaHealthData.poaHealth = {
            attorney: tempData.attorney,
            backups: tempData.backups,
            restrictions: tempData.restrictions
        };
        poaHealthData.organDonation = organDonation;
        poaHealthData.dnr = dnr;
        poaHealthData.statements = tempData.statements || {};
        poaHealthData.timestamp = Date.now();
        updateLocalStorage();
        setEditing(false);
        setTempData({});
        setToastMessage('Health POA updated successfully');
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
            {!poaHealthData.poaHealth && (
                <Form>
                    <Card className="mb-4">
                        <Card.Header as="h5">Add New Health Power of Attorney</Card.Header>
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

                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="organDonation"
                                    label="Organ Donation"
                                    checked={organDonation}
                                    onChange={(e) => setOrganDonation(e.target.checked)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    id="dnr"
                                    label="Do Not Resuscitate (DNR)"
                                    checked={dnr}
                                    onChange={(e) => setDnr(e.target.checked)}
                                />
                            </Form.Group>

                            {/* Section for declarations with checkboxes */}
                            <Form.Group className="mb-3">
                                <Form.Label>Treatment Directions and End-Of-Life Decisions</Form.Label>
                                {declarations.map(declaration => (
                                    <div key={declaration.id} className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            id={declaration.id}
                                            label={declaration.label}
                                            checked={formData.statements[declaration.id] || false}
                                            onChange={() => handleDeclarationChange(declaration.id)}
                                        />
                                        {declaration.options && formData.statements[declaration.id] && (
                                            <div className="ms-4 mt-2">
                                                {declaration.options.map((option, idx) => (
                                                    <Form.Check
                                                        key={`${declaration.id}_option_${idx}`}
                                                        type="checkbox"
                                                        id={`${declaration.id}_option_${idx}`}
                                                        label={option}
                                                        checked={formData.statements[`${declaration.id}_option_${idx}`] || false}
                                                        onChange={() => handleDeclarationChange(declaration.id, idx)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </Form.Group>

                            <Button className='w-100' variant="outline-success" onClick={handleSubmit}>
                                <i className="bi bi-check-circle me-2"></i>Save POA
                            </Button>
                        </Card.Body>
                    </Card>
                </Form>
            )}

            {/* Display existing POA */}
            {poaHealthData.poaHealth && (
                <Card className="mt-4">
                    <Card.Header as="h5">Existing Health Power of Attorney</Card.Header>
                    <Card.Body>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Attorney</th>
                                    <th>Backups</th>
                                    <th>Restrictions</th>
                                    <th>Organ Donation</th>
                                    <th>DNR</th>
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
                                        : poaHealthData.poaHealth.attorney}
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
                                        : poaHealthData.poaHealth.backups.join(', ')}
                                    </td>
                                    <td>{editing ?
                                        <Form.Control as="textarea" rows={2} value={tempData.restrictions} onChange={(e) => setTempData({ ...tempData, restrictions: e.target.value })} />
                                        : poaHealthData.poaHealth.restrictions}
                                    </td>
                                    <td>{editing ?
                                        <Form.Check
                                            type="checkbox"
                                            id="organDonation"
                                            label="Organ Donation"
                                            checked={organDonation}
                                            onChange={(e) => setOrganDonation(e.target.checked)}
                                        />
                                        : (poaHealthData.organDonation ? 'Yes' : 'No')}
                                    </td>
                                    <td>{editing ?
                                        <Form.Check
                                            type="checkbox"
                                            id="dnr"
                                            label="Do Not Resuscitate (DNR)"
                                            checked={dnr}
                                            onChange={(e) => setDnr(e.target.checked)}
                                        />
                                        : (poaHealthData.dnr ? 'Yes' : 'No')}
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

                        {/* Display selected declarations */}
                        {poaHealthData.poaHealth && Object.keys(poaHealthData.statements).length > 0 && (
                            <div className="mt-4">
                                <p><strong>Treatment Directions and End-Of-Life Decisions:</strong></p>
                                <ul>
                                    {declarations.map(declaration => (
                                        poaHealthData.statements[declaration.id] ? (
                                            <li key={declaration.id}>
                                                {declaration.label}
                                                {declaration.options && (
                                                    <ul>
                                                        {declaration.options.map((option, idx) => (
                                                            poaHealthData.statements[`${declaration.id}_option_${idx}`] && (
                                                                <li key={`${declaration.id}_option_${idx}`}>{option}</li>
                                                            )
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ) : null
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Confirmation Modal for deletion */}
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this Health POA?"
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

export default PoaHealth;
