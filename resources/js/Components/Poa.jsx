import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Table, Card, Tabs, Tab, OverlayTrigger, Tooltip, Popover
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

let poaData = {
    poaProperty: null,
    poaHealth: null,
    organDonation: false,
    dnr: false,
    timestamp: Date.now()
};

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
    });
    const [activeTab, setActiveTab] = useState('Property');
    const [organDonation, setOrganDonation] = useState(false);
    const [dnr, setDnr] = useState(false);
    const [showTooltip, setShowTooltip] = useState({ Property: false, Health: false });

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

        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedFormValues.poa) {
            poaData = storedFormValues.poa;
            setFormData(poaData.poaProperty || poaData.poaHealth || {});
            setOrganDonation(poaData.organDonation || false);
            setDnr(poaData.dnr || false);
        }

        setShowTooltip({ Property: false, Health: false });
    }, [datas]);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    const updateLocalStorage = () => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.poa = poaData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectAttorney = (value) => {
        setFormData(prev => ({ ...prev, attorney: value }));
        setValidationErrors(prevErrors => ({ ...prevErrors, attorney: '' }));
    };

    const handleAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);

        if (!datas[5]) datas[5] = {};
        if (!datas[5].relatives) datas[5].relatives = [];
        datas[5].relatives.push(newPerson);
    };

    const addBackup = () => {
        setFormData(prev => ({
            ...prev,
            backups: [...prev.backups, '']
        }));
    };

    const handleBackupChange = (index, value) => {
        const newBackups = [...formData.backups];
        newBackups[index] = value;
        setFormData(prev => ({ ...prev, backups: newBackups }));
        setValidationErrors(prevErrors => ({ ...prevErrors, backups: '' }));
    };

    const handleDeleteBackup = (index) => {
        const newBackups = formData.backups.filter((_, idx) => idx !== index);
        setFormData(prev => ({ ...prev, backups: newBackups }));
    };

    const handleSubmit = () => {
        setValidationErrors({});

        let errors = {};

        if (!formData.attorney) {
            errors.attorney = 'Attorney is required';
        }

        if (formData.backups.includes(formData.attorney)) {
            errors.backups = 'Backup cannot be the same as the attorney';
        }

        if (Object.values(errors).length > 0) {
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
            setShowTooltip(prev => ({ ...prev, Property: true }));
        }
        poaData.timestamp = Date.now();
        updateLocalStorage();
        setFormData({
            attorney: '',
            backups: [],
            restrictions: '',
        });
        setToastMessage(`${activeTab} POA added successfully`);
        setShowToast(true);

        // Force a re-render
        setActiveTab(prevTab => prevTab);
    };

    const handleDelete = (type) => {
        setItemToDelete(type);
        setShowDeleteModal(true);
        setShowTooltip(prev => ({ ...prev, [type]: false }));
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            if (itemToDelete === 'Property') {
                poaData.poaProperty = null;
            } else {
                poaData.poaHealth = null;
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

    const handleEdit = (type) => {
        setEditingType(type);
        const currentPoa = poaData[`poa${type}`];
        setTempData({
            ...currentPoa,
            backups: currentPoa.backups || []
        });
        if (type === 'Health') {
            setOrganDonation(poaData.organDonation);
            setDnr(poaData.dnr);
        }
    };

    const handleSave = () => {
        let errors = {};

        if (!tempData.attorney) {
            errors.attorney = 'Attorney is required';
        }

        if (tempData.backups.includes(tempData.attorney)) {
            errors.backups = 'Backup cannot be the same as the attorney';
        }

        if (Object.values(errors).length > 0) {
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
        }
        poaData.timestamp = Date.now();
        updateLocalStorage();
        setEditingType(null);
        setTempData({});
        setToastMessage(`${editingType} POA updated successfully`);
        setShowToast(true);
    };

    const handleCancel = () => {
        setEditingType(null);
        setTempData({});
    };

    const addBackupToRow = () => {
        const newBackups = [...tempData.backups, ''];
        setTempData({ ...tempData, backups: newBackups });
    };

    const poaExistsForType = (type) => {
        return poaData[`poa${type}`] !== null;
    };

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setShowTooltip({ Property: false, Health: false });
    };

    const renderTabContent = (type) => {
        if (poaExistsForType(type)) {
            return (
                <Card className="mb-4">
                    <Card.Body>
                        <p className="text-center">
                            POA of {type} already added. You can edit the data in the table below or remove it to add a new one.
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
                                        Don&apos;t forget to fill out the Property POA!
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
                                        Don&apos;t forget to fill out the Health POA!
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
                            </div>
                        )}
                    </Card.Body>
                </Card>
            )}

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message={`Are you sure you want to delete this ${itemToDelete} POA?`}
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
};

export default Poa;
