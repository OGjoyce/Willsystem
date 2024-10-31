import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Container, Form, Row, Col, Modal, InputGroup } from 'react-bootstrap';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmationModal from '@/Components/AdditionalComponents/ConfirmationModal';
import DataTable from 'react-data-table-component';
import { debounce } from 'lodash';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Link, Head } from '@inertiajs/react';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [currentPackage, setCurrentPackage] = useState({
        id: null,
        name: '',
        price: '',
        description: '',
        campaign: '',
        cliente_reference: '',
        expiration_date: '',
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

    const handleShow = (mode, pkg = null) => {
        setModalMode(mode);
        setCurrentPackage(pkg || {
            id: null,
            name: '',
            price: '',
            description: '',
            campaign: '',
            cliente_reference: '',
            expiration_date: '',
        });
        setShowModal(true);
    };

    const handleSearchChange = useCallback(debounce((value) => setSearchTerm(value), 300), []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPackage({ ...currentPackage, [name]: value });
        setValidationErrors({ ...validationErrors, [name]: '' });
    };

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg =>
            pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [packages, searchTerm]);

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Price', 'Description', 'Campaign', 'Cliente Reference', 'Expiration Date'];
        const rows = filteredPackages.map(pkg => [
            pkg.id, pkg.name, pkg.price, pkg.description, pkg.campaign, pkg.cliente_reference, pkg.expiration_date
        ]);

        const csvContent = `${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
        saveAs(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'packages_data.csv');
    };

    const exportExcel = () => {
        const worksheetData = [
            ['ID', 'Name', 'Price', 'Description', 'Campaign', 'Cliente Reference', 'Expiration Date'],
            ...filteredPackages.map(pkg => [
                pkg.id, pkg.name, pkg.price, pkg.description, pkg.campaign, pkg.cliente_reference, pkg.expiration_date
            ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PackagesData');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'packages_data.xlsx');
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true },
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Price', selector: row => row.price, sortable: true },
        { name: 'Description', selector: row => row.description, sortable: true },
        { name: 'Campaign', selector: row => row.campaign, sortable: true },
        { name: 'Cliente Reference', selector: row => row.cliente_reference, sortable: true },
        { name: 'Expiration Date', selector: row => row.expiration_date, sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <Button className='w-[100%]' variant="outline-warning" size="sm" onClick={() => handleShow('edit', row)}>Edit</Button>
                    <Button className='w-[100%]' variant="outline-danger" size="sm" onClick={() => { setCurrentPackage(row); setShowDeleteModal(true); }}>Delete</Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: '#f1f5f9' } },
        headCells: { style: { fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' } },
        cells: { style: { fontSize: '0.85rem', color: '#374151' } },
    };

    const validateForm = () => {
        const errors = {};
        if (!currentPackage.name.trim()) errors.name = 'Name cannot be empty';
        if (!currentPackage.price.trim()) errors.price = 'Price cannot be empty';
        if (!currentPackage.description.trim()) errors.description = 'Description cannot be empty';
        if (!currentPackage.campaign.trim()) errors.campaign = 'Campaign cannot be empty';
        if (currentPackage.expiration_date && isNaN(Date.parse(currentPackage.expiration_date))) {
            errors.expiration_date = 'Expiration date must be a valid date';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            const packageData = { ...currentPackage, price: currentPackage.price.replace('$', '') };
            if (modalMode === 'create') {
                await axios.post('/api/packages', packageData);
                setToastMessage('Package created successfully');
            } else {
                await axios.put(`/api/packages/${currentPackage.id}`, packageData);
                setToastMessage('Package updated successfully');
            }
            fetchPackages();
            setShowModal(false);
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
    };

    return (
        <AuthenticatedLayout
            user="Admin"
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Manage Packages</h2>}
        >
            <Head title="Manage Packages" />
            <Container fluid className="py-4 bg-gray-100 min-h-screen">
                <Container className="bg-white shadow-sm rounded-lg p-4 mb-4">
                    <Row className="d-flex align-items-center justify-content-between mb-3">
                        <Col><h2 className="font-semibold text-xl text-gray-800">Package Management</h2></Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button variant="outline-success" onClick={exportExcel}>Export Excel</Button>
                            <Button variant="outline-primary" onClick={exportCSV}>Export CSV</Button>
                            <Button variant="primary" onClick={() => handleShow('create')}>Add Package</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Search Packages"
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>

                <Container className="bg-white shadow-sm rounded-lg">
                    <DataTable
                        columns={columns}
                        data={filteredPackages}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100, 256]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="500px"
                        customStyles={customStyles}
                        noDataComponent="No data to display."
                    />
                </Container>

                {/* Modals */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                                {validationErrors.name && <p className="text-danger">{validationErrors.name}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="price"
                                    value={currentPackage.price}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.price && <p className="text-danger">{validationErrors.price}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="description"
                                    value={currentPackage.description}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.description && <p className="text-danger">{validationErrors.description}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Campaign</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="campaign"
                                    value={currentPackage.campaign}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.campaign && <p className="text-danger">{validationErrors.campaign}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Cliente Reference</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cliente_reference"
                                    value={currentPackage.cliente_reference}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Expiration Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expiration_date"
                                    value={currentPackage.expiration_date}
                                    onChange={handleInputChange}
                                />
                                {validationErrors.expiration_date && <p className="text-danger">{validationErrors.expiration_date}</p>}
                            </Form.Group>
                            <Button type="submit">{modalMode === 'create' ? 'Add Package' : 'Update Package'}</Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <ConfirmationModal
                    show={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    message="Are you sure you want to delete this package?"
                />
                <CustomToast show={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
            </Container>
        </AuthenticatedLayout>
    );
};

export default Packages;
