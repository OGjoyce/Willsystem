import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Table } from 'react-bootstrap';
import axios from 'axios';

const SelectPackageModal = ({ show, onHide, onSelect }) => {
    const [packages, setPackages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPackages = packages.filter((pkg) =>
        Object.values(pkg).some(
            (value) =>
                value &&
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header>
                <Modal.Title>Select a Package to start</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search packages..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Form.Group>
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
                            {filteredPackages.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td>{pkg.id}</td>
                                    <td>{pkg.name}</td>
                                    <td>{pkg.price}</td>
                                    <td>{pkg.description}</td>
                                    <td>{pkg.campaign}</td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleSelect(pkg)}
                                        >
                                            Select
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {/* Footer content if needed */}
            </Modal.Footer>
        </Modal>
    );
};

export default SelectPackageModal;