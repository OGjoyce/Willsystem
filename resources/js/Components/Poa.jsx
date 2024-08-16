import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Dropdown, Button, Table, Card, Tabs, Tab, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';

let poaData = [];

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
    const [editingRow, setEditingRow] = useState(null);
    const [tempData, setTempData] = useState({});
    const [formData, setFormData] = useState({
        type: 'Property', // Default tab
        attorney: '',
        backups: [],
        restrictions: '',
    });
    const [activeTab, setActiveTab] = useState('Property');

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
            setFormData(poaData);
        }
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

    const handleDropdownSelect = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
    };

    const handleSubmit = () => {
        setValidationErrors({});

        poaData.push({ ...formData, type: activeTab, id: Date.now() });
        updateLocalStorage();
        setFormData({
            attorney: '',
            backups: [],
            restrictions: '',
        });
        setToastMessage('POA added successfully');
        setShowToast(true);

        // Change tab based on the newly added POA type
        setActiveTab(activeTab === 'Property' ? 'Health' : 'Property');
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            poaData = poaData.filter(item => item.id !== itemToDelete);
            updateLocalStorage();
            setToastMessage('POA removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (index) => {
        setEditingRow(index);
        setTempData({ ...poaData[index] });
    };

    const handleSave = (index) => {
        poaData[index] = tempData;
        updateLocalStorage();
        setEditingRow(null);
        setTempData({});
        setToastMessage('POA updated successfully');
        setShowToast(true);
    };

    const handleCancel = () => {
        setEditingRow(null);
        setTempData({});
    };

    return (
        <Container>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
                <Tab eventKey="Property" title="Property">
                    <Form>
                        <Card className="mb-4">
                            <Card.Header as="h5">Add New Power of Attorney</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col sm={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Attorney</Form.Label>
                                            <Dropdown onSelect={(eventKey) => handleDropdownSelect('attorney', eventKey)}>
                                                <Dropdown.Toggle variant="outline-dark" id="dropdown-attorney" className="w-[100%]">
                                                    {formData.attorney || 'Select attorney...'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="w-100 text-center">
                                                    {identifiersNames.map((name, index) => (
                                                        <Dropdown.Item key={index} eventKey={name}>{name}</Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <Form.Control.Feedback type="invalid">{validationErrors.attorney}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Backups (optional):</Form.Label>
                                    {formData.backups.map((backup, index) => (
                                        <Dropdown key={index} className="mb-2" onSelect={(eventKey) => handleBackupChange(index, eventKey)}>
                                            <Dropdown.Toggle variant="outline-secondary" id={`dropdown-backup-${index}`} className="w-[100%]">
                                                {backup || `Select backup ${index + 1}...`}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="w-100 text-center">
                                                {identifiersNames.map((name, idx) => (
                                                    <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ))}

                                    <Button variant="outline-secondary" onClick={addBackup} className="mt-2 w-[100%]">
                                        <i className="bi bi-plus-circle me-2"></i>Add Backup
                                    </Button>
                                    <Form.Control.Feedback type="invalid">{validationErrors.backups}</Form.Control.Feedback>
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
                                        isInvalid={!!validationErrors.restrictions}
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.restrictions}</Form.Control.Feedback>
                                </Form.Group>

                                <Button className='w-100' variant="outline-success" onClick={handleSubmit}>
                                    <i className="bi bi-plus-circle me-2"></i>Add POA
                                </Button>
                            </Card.Body>
                        </Card>
                    </Form>
                </Tab>
                <Tab eventKey="Health" title="Health">
                    <Form>
                        <Card className="mb-4">
                            <Card.Header as="h5">Add New Power of Attorney</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col sm={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Attorney</Form.Label>
                                            <Dropdown onSelect={(eventKey) => handleDropdownSelect('attorney', eventKey)}>
                                                <Dropdown.Toggle variant="outline-dark" id="dropdown-attorney" className="w-100">
                                                    {formData.attorney || 'Select attorney...'}
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className="w-100">
                                                    {identifiersNames.map((name, index) => (
                                                        <Dropdown.Item key={index} eventKey={name}>{name}</Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <Form.Control.Feedback type="invalid">{validationErrors.attorney}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Backups (optional):</Form.Label>
                                    {formData.backups.map((backup, index) => (
                                        <Dropdown key={index} className="mb-2" onSelect={(eventKey) => handleBackupChange(index, eventKey)}>
                                            <Dropdown.Toggle variant="outline-secondary" id={`dropdown-backup-${index}`} className="w-100">
                                                {backup || `Select backup ${index + 1}...`}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="w-100">
                                                {identifiersNames.map((name, idx) => (
                                                    <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ))}
                                    <Button variant="outline-secondary" onClick={addBackup} className="mt-2 w-[100%]">
                                        <i className="bi bi-plus-circle me-2"></i>Add Backup
                                    </Button>
                                    <Form.Control.Feedback type="invalid">{validationErrors.backups}</Form.Control.Feedback>
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
                                        isInvalid={!!validationErrors.restrictions}
                                    />
                                    <Form.Control.Feedback type="invalid">{validationErrors.restrictions}</Form.Control.Feedback>
                                </Form.Group>

                                <Button className='w-100' variant="outline-success" onClick={handleSubmit}>
                                    <i className="bi bi-plus-circle me-2"></i>Add POA
                                </Button>
                            </Card.Body>
                        </Card>
                    </Form>
                </Tab>
            </Tabs>

            {poaData.length > 0 && (
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
                                {poaData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{editingRow === index ?
                                            <Form.Select value={tempData.type} onChange={(e) => setTempData({ ...tempData, type: e.target.value })}>
                                                <option value="Property">Property</option>
                                                <option value="Health">Health</option>
                                            </Form.Select> : item.type}
                                        </td>
                                        <td>{editingRow === index ?
                                            <Dropdown onSelect={(eventKey) => setTempData({ ...tempData, attorney: eventKey })}>
                                                <Dropdown.Toggle variant="outline-secondary" className="w-100">{tempData.attorney}</Dropdown.Toggle>
                                                <Dropdown.Menu className="w-100">
                                                    {identifiersNames.map((name, idx) => (
                                                        <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown> : item.attorney}
                                        </td>
                                        <td>{editingRow === index ?
                                            tempData.backups.map((backup, idx) => (
                                                <Dropdown key={idx} className="mb-1" onSelect={(eventKey) => {
                                                    const newBackups = [...tempData.backups];
                                                    newBackups[idx] = eventKey;
                                                    setTempData({ ...tempData, backups: newBackups });
                                                }}>
                                                    <Dropdown.Toggle variant="outline-secondary" className="w-100">{backup}</Dropdown.Toggle>
                                                    <Dropdown.Menu className="w-100">
                                                        {identifiersNames.map((name, nameIdx) => (
                                                            <Dropdown.Item key={nameIdx} eventKey={name}>{name}</Dropdown.Item>
                                                        ))}
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            )) : item.backups.join(', ')}
                                        </td>
                                        <td>{editingRow === index ?
                                            <Form.Control as="textarea" rows={2} value={tempData.restrictions} onChange={(e) => setTempData({ ...tempData, restrictions: e.target.value })} />
                                            : item.restrictions}
                                        </td>
                                        <td>
                                            {editingRow === index ? (
                                                <>
                                                    <Button variant="success" size="sm" onClick={() => handleSave(index)} className="me-1">
                                                        <i className="bi bi-check-circle me-1"></i>Save
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                                                        <i className="bi bi-x-circle me-1"></i>Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit this POA</Tooltip>}>
                                                        <Button variant="warning" size="sm" onClick={() => handleEdit(index)} className="me-1">
                                                            <i className="bi bi-pencil me-1"></i>Edit
                                                        </Button>
                                                    </OverlayTrigger>
                                                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete this POA</Tooltip>}>
                                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                                                            <i className="bi bi-trash me-1"></i>Delete
                                                        </Button>
                                                    </OverlayTrigger>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this POA?"
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
