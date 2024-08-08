import React, { useState, useEffect } from 'react';
import { Button, Container, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import CustomToast from '@/Components/CustomToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';



const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [currentPackage, setCurrentPackage] = useState({
        id: null,
        name: '',
        price: '',
        description: '',
        campaign: ''
    });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axios.get('/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentPackage({ id: null, name: '', price: '', campaign: '' });
    };

    const handleShow = (mode, pkg = null) => {
        setModalMode(mode);
        if (pkg) {
            setCurrentPackage(pkg);
        }
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'price') {
            newValue = value.replace(/[^\d.]/g, '');

            if (newValue && !newValue.startsWith('$')) {
                newValue = '$' + newValue;
            }
        }

        setCurrentPackage({ ...currentPackage, [name]: newValue });
        // Limpiar el error de validación cuando el usuario empieza a escribir
        setValidationErrors({ ...validationErrors, [name]: '' });
    };

    const validateForm = () => {
        const errors = {};
        if (!currentPackage.name.trim()) {
            errors.name = 'Name cannot be empty';
        }
        if (!currentPackage.price.trim() || isNaN(parseFloat(currentPackage.price.replace('$', '')))) {
            errors.price = 'Price must be a valid number';
        }
        if (!currentPackage.description.trim()) {
            errors.description = 'Description cannot be empty';
        }
        if (!currentPackage.campaign.trim()) {
            errors.campaign = 'Campaign cannot be empty';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            if (modalMode === 'create') {
                await axios.post('/api/packages', currentPackage);
                setToastMessage('Package created successfully');
            } else if (modalMode === 'edit') {
                await axios.put(`/api/packages/${currentPackage.id}`, currentPackage);
                setToastMessage('Package updated successfully');
            }
            fetchPackages();
            handleClose();
            setShowToast(true);
        } catch (error) {
            console.error('Error submitting package:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`/api/packages/${currentPackage.id}`);
            fetchPackages();
            setShowDeleteModal(false);
            setToastMessage('Package deleted successfully');
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting package:', error);
        }
        setCurrentPackage({ id: null, name: '', price: '', description: '', campaign: '' });
    };

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Packages</h2>}
        >
            <Head title="Manage Packages" />
            <Container fluid className="py-12">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <div className="bg-white shadow-sm rounded-lg">
                            <Container className="py-4">
                                <Row className="mb-3">
                                    <Col>
                                        <Button variant="primary" onClick={() => handleShow('create')}>
                                            Add New Package
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div className="table-responsive">
                                            <Table striped bordered hover className="table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Name</th>
                                                        <th>Price</th>
                                                        <th>Description</th>
                                                        <th>Campaign</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {packages.map((pkg) => (
                                                        <tr key={pkg.id}>
                                                            <td className="text-break">{pkg.id}</td>
                                                            <td className="text-break">{pkg.name}</td>
                                                            <td className="text-break">{pkg.price}</td>
                                                            <td className="text-break">{pkg.description}</td>
                                                            <td className="text-break">{pkg.campaign}</td>
                                                            <td>
                                                                <div className="d-flex flex-column flex-sm-row">
                                                                    <Button
                                                                        variant="info"
                                                                        size="sm"
                                                                        onClick={() => handleShow('edit', pkg)}
                                                                        className="mb-2 mb-sm-0 me-sm-2"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="danger"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setCurrentPackage(pkg);
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col xs={6}>
                                        <Link href={route('dashboard')}>
                                            <Button variant="outline-success" size="lg" className="w-100">
                                                Back
                                            </Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'create' ? 'Add New Package' : 'Edit Package'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={currentPackage.name}
                                onChange={handleInputChange}

                            />
                            {validationErrors.name && <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="text"
                                name="price"
                                value={currentPackage.price}
                                onChange={handleInputChange}

                            />
                            {validationErrors.price && <p className="mt-2 text-sm text-red-600">{validationErrors.price}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={currentPackage.description}
                                onChange={handleInputChange}
                            />
                            {validationErrors.description && <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Campaign</Form.Label>
                            <Form.Control
                                type="text"
                                name="campaign"
                                value={currentPackage.campaign}
                                onChange={handleInputChange}

                            />
                            {validationErrors.campaign && <p className="mt-2 text-sm  text-red-600">{validationErrors.campaign}</p>}
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {modalMode === 'create' ? 'Add Package' : 'Update Package'}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this package?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </AuthenticatedLayout>
    );
};

export default Packages;