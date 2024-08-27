import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Table } from 'react-bootstrap';
import { Link, Head } from '@inertiajs/react';
import { debounce } from 'lodash';

const PackagesReview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const documents = useMemo(() => [
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
        { id: 1, user: 'jhondoe@email.com', package: 'Package 1', approved: '4/7', status: 'completed' },
        { id: 2, user: 'charlespatrick@email.com', package: 'Package 2', approved: '2/5', status: 'pending' },
        { id: 3, user: 'dianejhonson@email.com', package: 'Package 3', approved: '3/3', status: 'changes requested' },
    ], []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc =>
            (statusFilter === 'All' || doc.status.toLowerCase() === statusFilter.toLowerCase()) &&
            (doc.package.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.user.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [documents, statusFilter, searchTerm]);

    const debouncedSearch = useMemo(
        () => debounce((value) => setSearchTerm(value), 300),
        []
    );

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const handleStatusFilterChange = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    const renderTableRow = useCallback((doc) => (
        <tr key={doc.id}>
            <td>{doc.user}</td>
            <td>{doc.package}</td>
            <td>{doc.approved}</td>
            <td>{doc.status}</td>
            <td>


                <Link href={route('package-status')}>
                    <Button className="w-100" variant="outline-info" size="sm">
                        View
                    </Button>
                </Link>

            </td>
        </tr>
    ), []);

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"Review Packages"}</h2>}
        >
            <Head title={"Welcome, Admin"} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>

                        <Container style={{ display: "flex", flexDirection: "column", height: "70vh", justifyContent: "space-between" }}>
                            <Row className="mb-3">
                                <Col xs={12} md={9} className="mb-3 mb-md-0">
                                    <Form.Group as={Row}>
                                        <Col xs={8} md={4}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search"
                                                onChange={handleSearchChange}
                                            />
                                        </Col>
                                        <Col xs={6} md={5}>
                                            <Dropdown>
                                                <Dropdown.Toggle
                                                    variant="outline-dark"
                                                    id="dropdown-basic"
                                                    className="w-100 text-truncate"
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <span className="me-1">Filter:</span>
                                                    <span className="text-truncate">{statusFilter}</span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className='w-100'>
                                                    {['All', 'Pending', 'Changes Requested', 'Completed'].map((status) => (
                                                        <Dropdown.Item
                                                            key={status}
                                                            onClick={() => handleStatusFilterChange(status)}
                                                            className="text-truncate"
                                                        >
                                                            {status}
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                <p className="text-center mb-4">Start typing the owner's email or package to filter results in the table below.</p>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Package</th>
                                            <th>Approved</th>
                                            <th>Status</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.map(renderTableRow)}
                                    </tbody>
                                </Table>
                            </div>
                            <Row style={{ marginBottom: "24px" }}>
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
                </div>
            </div>
        </AuthenticatedLayout >
    );
};

export default PackagesReview;
