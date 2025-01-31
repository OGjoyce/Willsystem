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

const PoaHealth = ({ datas, errors, onAddPersonFromDropdown }) => {
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
        activationType: 'immediate',
        statements: {
            terminalCondition: {
                noLifeSupport: false,
                noTubeFeeding: false,
                noActiveTreatment: false
            },
            unconsciousCondition: {
                noLifeSupport: false,
                noTubeFeeding: false,
                noActiveTreatment: false
            },
            mentalImpairment: {
                noLifeSupport: false,
                noTubeFeeding: false,
                noActiveTreatment: false
            },
            violentBehavior: {
                useDrugs: false
            },
            painManagement: {
                useDrugs: false
            }
        }
    });
    const [organDonation, setOrganDonation] = useState(false);
    const [dnr, setDnr] = useState(false);

    // Define available declarations and their options
    // Definir las declaraciones disponibles en PoaHealth
    const declarations = [
        {
            id: 'terminalCondition',
            label: 'Incurable and irreversible terminal condition',
            options: [
                { value: 'noLifeSupport', label: 'I do not wish to be given life support or other life-prolonging treatment' },
                { value: 'lifeSupport', label: 'I wish to be given life support' }
            ]
        },
        {
            id: 'persistentlyUnconscious',
            label: 'Persistently unconscious with no likelihood of regaining consciousness',
            options: [
                { value: 'noArtificialSupport', label: 'I do not wish to be kept on artificial life support' },
                { value: 'artificialSupport', label: 'I wish to be kept on artificial life support' }
            ]
        },
        {
            id: 'mentallyImpaired',
            label: 'Severely and permanently mentally impaired',
            options: [
                { value: 'noArtificialSupport', label: 'I do not wish to be kept on artificial life support' },
                { value: 'artificialSupport', label: 'I wish to be kept on artificial life support' }
            ]
        },
        {
            id: 'violentBehavior',
            label: 'Suffering from a condition with violent or degrading behavior',
            options: [
                { value: 'drugControl', label: 'I want my symptoms controlled with appropriate drugs' },
                { value: 'noDrugControl', label: 'I do not wish my symptoms to be controlled with drugs' }
            ]
        },
        {
            id: 'painManagement',
            label: 'Suffering from pain due to the condition',
            options: [
                { value: 'drugControl', label: 'I want my symptoms controlled with appropriate drugs' },
                { value: 'noDrugControl', label: 'I do not wish my symptoms to be controlled with drugs' }
            ]
        }
    ];

    // Esta parte ya estaba en tu código pero ahora debe reflejar estas nuevas opciones en los checkboxes


    useEffect(() => {
        // Limpiar los datos del formulario y los datos globales de poaHealthData
        setFormData({
            attorney: '',
            backups: [],
            restrictions: '',
            activationType: 'immediate',
            statements: {}
        });
        setOrganDonation(false);
        setDnr(false);

        // Limpiar la variable global poaHealthData
        poaHealthData = {
            poaHealth: null,
            organDonation: false,
            dnr: false,
            statements: {}, // Limpia las declaraciones seleccionadas
            timestamp: Date.now()
        };



    }, []);


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

    const handleActivationTypeChange = (event) => {
        setFormData(prev => ({ ...prev, activationType: event.target.value }));
    };


    // Add a new person to the identifiersNames and relatives list
    const handleAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);

        if (!datas[5]) datas[5] = {};
        if (!datas[5].relatives) datas[5].relatives = [];
        datas[5].relatives.push(newPerson);
        onAddPersonFromDropdown([newPerson])
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
    const handleDeclarationChange = (declarationId, option, isChecked) => {
        setFormData((prev) => ({
            ...prev,
            statements: {
                ...prev.statements,
                [declarationId]: {
                    ...prev.statements[declarationId],
                    [option]: isChecked
                }
            }
        }));
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
            restrictions: formData.restrictions,
            activationType: formData.activationType
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
                                <Form.Label>Activation Type</Form.Label>
                                <div>
                                    <Form.Check
                                        type="radio"
                                        label="Immediately"
                                        value="immediate"
                                        checked={formData.activationType === 'immediate'}
                                        onChange={handleActivationTypeChange}
                                    />
                                    <Form.Check
                                        type="radio"
                                        label="Upon a finding of lack of capacity or incapacitation"
                                        value="incapacity"
                                        checked={formData.activationType === 'incapacity'}
                                        onChange={handleActivationTypeChange}
                                    />
                                </div>
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
                            <Form.Group>
                                <Form.Label><strong>If I have an incurable and irreversible terminal condition that will result in my death, I direct that:</strong></Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to be given life support or other life-prolonging treatment."
                                    checked={formData.statements.terminalCondition?.noLifeSupport}
                                    onChange={(e) => handleDeclarationChange('terminalCondition', 'noLifeSupport', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive tube feeding, even if withholding such feeding would hasten my death."
                                    checked={formData.statements.terminalCondition?.noTubeFeeding}
                                    onChange={(e) => handleDeclarationChange('terminalCondition', 'noTubeFeeding', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive active treatment for any other separate condition that threatens my life."
                                    checked={formData.statements.terminalCondition?.noActiveTreatment}
                                    onChange={(e) => handleDeclarationChange('terminalCondition', 'noActiveTreatment', e.target.checked)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label><strong>If I am diagnosed as persistently unconscious and will not regain consciousness, I direct that:</strong></Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to be kept on any artificial life support."
                                    checked={formData.statements.unconsciousCondition?.noLifeSupport}
                                    onChange={(e) => handleDeclarationChange('unconsciousCondition', 'noLifeSupport', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive tube feeding, even if withholding such feeding would hasten my death."
                                    checked={formData.statements.unconsciousCondition?.noTubeFeeding}
                                    onChange={(e) => handleDeclarationChange('unconsciousCondition', 'noTubeFeeding', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive active treatment for any other separate condition that threatens my life."
                                    checked={formData.statements.unconsciousCondition?.noActiveTreatment}
                                    onChange={(e) => handleDeclarationChange('unconsciousCondition', 'noActiveTreatment', e.target.checked)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label><strong>If I am diagnosed as being severely and permanently mentally impaired, I direct that:</strong></Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to be kept on any artificial life support."
                                    checked={formData.statements.mentalImpairment?.noLifeSupport}
                                    onChange={(e) => handleDeclarationChange('mentalImpairment', 'noLifeSupport', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive tube feeding, even if withholding such feeding would hasten my death."
                                    checked={formData.statements.mentalImpairment?.noTubeFeeding}
                                    onChange={(e) => handleDeclarationChange('mentalImpairment', 'noTubeFeeding', e.target.checked)}
                                />
                                <Form.Check
                                    type="checkbox"
                                    label="I do not wish to receive active treatment for any other separate condition that threatens my life."
                                    checked={formData.statements.mentalImpairment?.noActiveTreatment}
                                    onChange={(e) => handleDeclarationChange('mentalImpairment', 'noActiveTreatment', e.target.checked)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label><strong>If my behavior becomes violent or degrading, I direct that:</strong></Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="I want my symptoms controlled with appropriate drugs, even if that worsens my physical condition or shortens my life."
                                    checked={formData.statements.violentBehavior?.useDrugs}
                                    onChange={(e) => handleDeclarationChange('violentBehavior', 'useDrugs', e.target.checked)}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label><strong>If I appear to be in pain, I direct that:</strong></Form.Label>
                                <Form.Check
                                    type="checkbox"
                                    label="I want my symptoms controlled with appropriate drugs, even if that worsens my physical condition or shortens my life."
                                    checked={formData.statements.painManagement?.useDrugs}
                                    onChange={(e) => handleDeclarationChange('painManagement', 'useDrugs', e.target.checked)}
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
