import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Button, Table, Dropdown } from 'react-bootstrap';

const PackageApproval = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [openDropdown, setOpenDropdown] = useState(null);

    // This data should be dynamically extracted from object_status
    const [documents, setDocuments] = useState([
        { id: 1, type: 'Will', latestVersion: 'v1', status: 'Approved' },
        { id: 2, type: 'POA1', latestVersion: 'v3', status: 'Pending' },
        { id: 3, type: 'POA2', latestVersion: 'v1', status: 'Changes Requested' },
    ]);

    const handleStatusChange = (docId, newStatus) => {
        setDocuments(documents.map(doc =>
            doc.id === docId ? { ...doc, status: newStatus } : doc
        ));
        setOpenDropdown(null);
    };

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Package Approval</h2>}
        >
            <Head title={"Package Status"} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        <Container className="flex flex-col h-full">
                            <h3 className='text-xl font-bold mb-4'>Showing all your documents</h3>
                            <h4 className='text-lg text-gray-600 mb-6'>Current Package: Facebook Campaign</h4>

                            {/* Scrollable table container */}
                            <div className="overflow-x-auto flex-grow">
                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Document Type</th>
                                            <th>Version</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc) => (
                                            <tr key={doc.id}>
                                                <td>{doc.type}</td>
                                                <td className='text-center'>
                                                    <i class="bi  bi-eye">  {doc.latestVersion}</i>
                                                </td>
                                                <td className={
                                                    doc.status === "Approved"
                                                        ? 'text-green-600'
                                                        : (
                                                            doc.status === "Changes Requested"
                                                                ? 'text-red-600'
                                                                : 'text-yellow-600'
                                                        )
                                                }
                                                >
                                                    {doc.status}
                                                    {
                                                        doc.status === "Changes Requested"
                                                            ? <span className='text-black ml-2'>

                                                                <i class="bi bi-eye"></i>
                                                            </span>
                                                            : ""
                                                    }
                                                </td>
                                                <td>
                                                    <div className='d-flex justify-content-around gap-3'>
                                                        <Dropdown className='w-[50%]' show={openDropdown === doc.id} onToggle={() => setOpenDropdown(openDropdown === doc.id ? null : doc.id)}>
                                                            <Dropdown.Toggle variant="outline-danger" size="sm" className="w-[100%] h-[100%]">
                                                                Select Option
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => handleStatusChange(doc.id, 'Approved')}>Approved</Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleStatusChange(doc.id, 'Changes Requested')}>Request Changes</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <Row style={{ marginBottom: "24px" }}>
                                <Col xs={6}>
                                    <Link href={route('packages-review')}>
                                        <Button variant="outline-success" size="lg" className="w-full max-w-sm">
                                            Go Back
                                        </Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default PackageApproval;