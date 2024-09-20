// Poa.jsx
import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Table, Card, Tabs, Tab, OverlayTrigger, Popover
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

// Initialize POA data
let poaData = {
    poaProperty: null,
    poaHealth: null,
    organDonation: false,
    dnr: false,
    statements: {}, // Stores selected declarations and options
    timestamp: Date.now()
};

// Function to retrieve POA data
export function getPoa() {
    return poaData;
}

const Poa = ({ datas, errors }) => {
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [tempData, setTempData] = useState({});
    const [formData, setFormData] = useState({
        attorney: '',
        backups: [],
        restrictions: '',
        statements: {} // Stores selected declarations and options
    });
    const [activeTab, setActiveTab] = useState('Property');
    const [organDonation, setOrganDonation] = useState(false);
    const [dnr, setDnr] = useState(false);
    const [showTooltip, setShowTooltip] = useState({ Property: false, Health: false });

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
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedFormValues.poa) {
            poaData = storedFormValues.poa;
            setFormData({
                ...poaData.poaProperty || poaData.poaHealth || {},
                statements: poaData.statements || {}
            });
            setOrganDonation(poaData.organDonation || false);
            setDnr(poaData.dnr || false);
        }

        setShowTooltip({ Property: false, Health: false });
    }, [datas]);

    // Update validation errors when errors prop changes
    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    // Function to update localStorage with current POA data
    const updateLocalStorage = () => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.poa = poaData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    // Handle input changes for text fields and checkboxes
    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

        // Additional validations can be added here

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const newPoa = { ...formData };
        if (activeTab === 'Property') {
            poaData.poaProperty = {
                attorney: newPoa.attorney,
                backups: newPoa.backups,
                restrictions: newPoa.restrictions
            };
            setShowTooltip(prev => ({ ...prev, Health: true }));
        } else {
            poaData.poaHealth = {
                attorney: newPoa.attorney,
                backups: newPoa.backups,
                restrictions: newPoa.restrictions
            };
            poaData.organDonation = organDonation;
            poaData.dnr = dnr;
            poaData.statements = formData.statements; // Store selected declarations
            setShowTooltip(prev => ({ ...prev, Property: true }));
        }
        poaData.timestamp = Date.now();
        updateLocalStorage();
        setFormData({
            attorney: '',
            backups: [],
            restrictions: '',
            statements: {}
        });
        setOrganDonation(false);
        setDnr(false);
        setToastMessage(`${activeTab} POA added successfully`);
        setShowToast(true);

        // Force a re-render
        setActiveTab(prevTab => prevTab);
    };

    // Handle deletion of POA
    const handleDelete = (type) => {
        setItemToDelete(type);
        setShowDeleteModal(true);
        setShowTooltip(prev => ({ ...prev, [type]: false }));
    };

    // Confirm deletion
    const confirmDelete = () => {
        if (itemToDelete) {
            if (itemToDelete === 'Property') {
                poaData.poaProperty = null;
            } else {
                poaData.poaHealth = null;
                poaData.organDonation = false;
                poaData.dnr = false;
                poaData.statements = {};
            }
            updateLocalStorage();
            setToastMessage(`${itemToDelete} POA removed successfully`);
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);

            // Force a re-render
            setActiveTab(prevTab => prevTab);
        }
    };

    // Handle editing of POA
    const handleEdit = (type) => {
        setEditingType(type);
        const currentPoa = poaData[`poa${type}`];
        setTempData({
            ...currentPoa,
            backups: currentPoa.backups || [],
            statements: poaData.statements || {}
        });
        if (type === 'Health') {
            setOrganDonation(poaData.organDonation);
            setDnr(poaData.dnr);
        }
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

        // Additional validations can be added here

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const updatedPoa = {
            attorney: tempData.attorney,
            backups: tempData.backups,
            restrictions: tempData.restrictions
        };
        poaData[`poa${editingType}`] = updatedPoa;
        if (editingType === 'Health') {
            poaData.organDonation = organDonation;
            poaData.dnr = dnr;
            poaData.statements = tempData.statements || {};
        }
        poaData.timestamp = Date.now();
        updateLocalStorage();
        setEditingType(null);
        setTempData({});
        setToastMessage(`${editingType} POA updated successfully`);
        setShowToast(true);
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingType(null);
        setTempData({});
    };

    // Add a backup in edit mode
    const addBackupToRow = () => {
        const newBackups = [...tempData.backups, ''];
        setTempData({ ...tempData, backups: newBackups });
    };

    // Check if POA exists for a given type
    const poaExistsForType = (type) => {
        return poaData[`poa${type}`] !== null;
    };

    // Handle tab selection
    const handleTabSelect = (key) => {
        setActiveTab(key);
        setShowTooltip({ Property: false, Health: false });
    };

    // Render content for each tab
    const renderTabContent = (type) => {
        if (poaExistsForType(type)) {
            return (
                <Card className="mb-4">
                    <Card.Body>
                        <p className="text-center">
                            {type} POA has already been added. You can edit the data in the table below or remove it to add a new one.
                        </p>
                    </Card.Body>
                </Card>
            );
        }

        return (
            <Form>
                <Card className="mb-4">
                    <Card.Header as="h5">Add New Power of Attorney</Card.Header>
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

                        {type === 'Health' && (
                            <>
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
                            </>
                        )}

                        <Button className='w-100' variant="outline-success" onClick={handleSubmit}>
                            <i className="bi bi-check-circle me-2"></i>Save POA
                        </Button>
                    </Card.Body>
                </Card>
            </Form>
        );
    };

    return (
        <Container>
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => handleTabSelect(k)}
                className="mb-4"
            >
                <Tab
                    eventKey="Property"
                    title={
                        <OverlayTrigger
                            trigger={[]}
                            show={showTooltip.Property && !poaExistsForType('Property')}
                            placement="top"
                            overlay={
                                <Popover id="popover-property" className="border-red-300 mb-2">
                                    <Popover.Body>
                                        Don't forget to fill out the Property POA!
                                    </Popover.Body>
                                </Popover>
                            }
                        >
                            <span className="flex items-center">
                                Property
                                {showTooltip.Property && !poaExistsForType('Property') && (
                                    <span className="text-red-600 ml-1"> ⚠️</span>
                                )}
                            </span>
                        </OverlayTrigger>
                    }
                >
                    {renderTabContent("Property")}
                </Tab>
                <Tab
                    eventKey="Health"
                    title={
                        <OverlayTrigger
                            trigger={[]}
                            show={showTooltip.Health && !poaExistsForType('Health')}
                            placement="top"
                            overlay={
                                <Popover id="popover-health" className="border-red-300 mb-2">
                                    <Popover.Body>
                                        Don't forget to fill out the Health POA!
                                    </Popover.Body>
                                </Popover>
                            }
                        >
                            <span className="flex items-center">
                                Health
                                {showTooltip.Health && !poaExistsForType('Health') && (
                                    <span className="text-red-600 ml-1"> ⚠️</span>
                                )}
                            </span>
                        </OverlayTrigger>
                    }
                >
                    {renderTabContent("Health")}
                </Tab>
            </Tabs>

            {/* Display existing POAs */}
            {(poaData.poaProperty || poaData.poaHealth) && (
                <Card className="mt-4">
                    <Card.Header as="h5">Existing Powers of Attorney</Card.Header>
                    <Card.Body>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Attorney</th>
                                    <th>Backups</th>
                                    <th>Restrictions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {['Property', 'Health'].map((type) => {
                                    const item = poaData[`poa${type}`];
                                    if (!item) return null;
                                    return (
                                        <tr key={type}>
                                            <td>{type}</td>
                                            <td>{editingType === type ?
                                                <AddPersonDropdown
                                                    options={identifiersNames}
                                                    label="Select attorney..."
                                                    selected={tempData.attorney}
                                                    onSelect={(value) => setTempData({ ...tempData, attorney: value })}
                                                    onAddPerson={handleAddPerson}
                                                    validationErrors={validationErrors}
                                                    setValidationErrors={setValidationErrors}
                                                />
                                                : item.attorney}
                                            </td>
                                            <td>{editingType === type ?
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
                                                : item.backups.join(', ')}
                                            </td>
                                            <td>{editingType === type ?
                                                <Form.Control as="textarea" rows={2} value={tempData.restrictions} onChange={(e) => setTempData({ ...tempData, restrictions: e.target.value })} />
                                                : item.restrictions}
                                            </td>
                                            <td>
                                                <div className='d-flex justify-content-around gap-3'>
                                                    {editingType === type ? (
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
                                                            <Button variant="outline-warning" size="sm" onClick={() => handleEdit(type)} className="me-1 w-50">
                                                                <i className="bi bi-pencil me-1"></i>Edit
                                                            </Button>
                                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(type)} className="w-50">
                                                                <i className="bi bi-trash me-1"></i>Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                        {poaData.poaHealth && (
                            <div>
                                <p><strong>Organ Donation:</strong> {poaData.organDonation ? 'Yes' : 'No'}</p>
                                <p><strong>Do Not Resuscitate (DNR):</strong> {poaData.dnr ? 'Yes' : 'No'}</p>
                                {/* Display selected declarations */}
                                {Object.keys(poaData.statements).length > 0 && (
                                    <div>
                                        <p><strong>Treatment Directions and End-Of-Life Decisions:</strong></p>
                                        <ul>
                                            {declarations.map(declaration => (
                                                poaData.statements[declaration.id] ? (
                                                    <li key={declaration.id}>
                                                        {declaration.label}
                                                        {declaration.options && (
                                                            <ul>
                                                                {declaration.options.map((option, idx) => (
                                                                    poaData.statements[`${declaration.id}_option_${idx}`] && (
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
                message={`Are you sure you want to delete this ${itemToDelete} POA?`}
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

export default Poa;
