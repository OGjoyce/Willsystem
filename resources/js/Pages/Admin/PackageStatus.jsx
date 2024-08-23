import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Table } from 'react-bootstrap';
import { debounce } from 'lodash';

const PackageStatus = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // This data needs to be extracted from object_status
    const documents = [
        { id: 1, type: 'Will', latestVersion: 'v1', status: 'completed' },
        { id: 2, type: 'POA1', latestVersion: 'v3', status: 'pending' },
        { id: 3, type: 'POA2', latestVersion: 'v1', status: 'changes requested' },
    ];


    return (
        <Container fluid className="py-3">
            <h3 className='text-xl mb-4'>Viewing documents of user@email.com </h3>

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Document</th>
                            <th>Latest Version</th>
                            <th>Status</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.type}</td>
                                <td>{doc.latestVersion}</td>
                                <td>{doc.status}</td>
                                <td>
                                    <div className='d-flex justify-content-around gap-3'>
                                        <Button className="w-[50%]" variant="outline-danger" size="sm">Change Status</Button>
                                        <Button className="w-[50%]" variant="outline-warning" size="sm">Edit</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
        </Container >
    );
};

export default PackageStatus;