import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Container, Form, Row, Col, Modal, InputGroup } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { debounce } from 'lodash';

const SelectPackageModal = ({ show, onHide, onSelect }) => {
    const [packages, setPackages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentPackage, setCurrentPackage] = useState({
        id: null,
        name: '',
        price: '',
        description: '',
        campaign: '',
        cliente_reference: '',
        expiration_date: '',
        is_signature_required: false,
    });

    // Fetch packages on modal show
    useEffect(() => {
        if (show) {
            fetchPackages();
        }
    }, [show]);

    const fetchPackages = async () => {
        try {
            const response = await axios.get('/api/packages');
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const handleSelect = (pkg) => {
        onSelect(pkg);
        onHide();
    };

    const handleSearch = useCallback(debounce((value) => setSearchTerm(value), 300), []);

    const filteredPackages = useMemo(() => {
        return packages.filter((pkg) =>
            Object.values(pkg).some(
                (value) =>
                    value &&
                    value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [packages, searchTerm]);

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Price', 'Description', 'Campaign', 'Cliente Reference', 'Expiration Date', 'Is Signature Required'];
        const rows = filteredPackages.map(pkg => [
            pkg.id, pkg.name, pkg.price, pkg.description, pkg.campaign, pkg.cliente_reference, pkg.expiration_date, pkg.is_signature_required ? 'Yes' : 'No'
        ]);
        const csvContent = `${headers.join(',')}\n${rows.map(row => row.join(',')).join('\n')}`;
        saveAs(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'packages_data.csv');
    };

    const exportExcel = () => {
        const worksheetData = [
            ['ID', 'Name', 'Price', 'Description', 'Campaign', 'Cliente Reference', 'Expiration Date', 'Is Signature Required'],
            ...filteredPackages.map(pkg => [
                pkg.id, pkg.name, pkg.price, pkg.description, pkg.campaign, pkg.cliente_reference, pkg.expiration_date, pkg.is_signature_required ? 'Yes' : 'No'
            ]),
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'PackagesData');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'packages_data.xlsx');
    };

    const columns = [
        //{ name: 'ID', selector: row => row.id, sortable: true },
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Price', selector: row => row.price, sortable: true },
        { name: 'Description', selector: row => row.description, sortable: true },
        { name: 'Campaign', selector: row => row.campaign, sortable: true },
        { name: 'Cliente Reference', selector: row => row.cliente_reference, sortable: true },
        { name: 'Expiration Date', selector: row => row.expiration_date, sortable: true },
        { name: 'Is Signature Required', selector: row => row.is_signature_required ? 'Yes' : 'No', sortable: true },
        {
            name: 'Actions',
            cell: row => (
                <div className='d-flex gap-2'>
                    <Button variant="outline-primary" size="sm" onClick={() => handleSelect(row)}>Select</Button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: false,
        }
    ];

    const customStyles = {
        headRow: { style: { backgroundColor: '#f1f5f9' } },
        headCells: { style: { fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' } },
        cells: { style: { fontSize: '0.85rem', color: '#374151' } },
    };

    return (
        <Modal show={show} onHide={onHide} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>Select a Package</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </InputGroup>
                <div className="table-responsive">
                    <DataTable
                        columns={columns}
                        data={filteredPackages}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        highlightOnHover
                        responsive
                        customStyles={customStyles}
                        noDataComponent="No data to display."
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-success" onClick={exportExcel}>Export Excel</Button>
                <Button variant="outline-primary" onClick={exportCSV}>Export CSV</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SelectPackageModal;
