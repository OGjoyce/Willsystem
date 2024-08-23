import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Table } from 'react-bootstrap';
import { debounce } from 'lodash';

const PackagesReview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const documents = useMemo(() => [
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
                <Button className="w-100" variant="outline-info" size="sm">View</Button>
            </td>
        </tr>
    ), []);

    return (
        <Container fluid className="py-3">
            <Row className="mb-3">
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <Form.Group as={Row}>
                        <Col xs={8} sm={9}>
                            <Form.Control
                                type="text"
                                placeholder="Search"
                                onChange={handleSearchChange}
                            />
                        </Col>
                        <Col xs={6} md={3}>
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
            <div className="table-responsive">
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
        </Container>
    );
};

export default PackagesReview;