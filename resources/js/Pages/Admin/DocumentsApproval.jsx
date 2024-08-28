import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Button, Table, Dropdown, Modal, Form } from 'react-bootstrap';

const PackageApproval = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [changeRequest, setChangeRequest] = useState('');
    const [editableDocId, setEditableDocId] = useState(null);

    const [documents, setDocuments] = useState([
        { id: 1, type: 'Will', latestVersion: 'v1', status: 'Approved' },
        { id: 2, type: 'POA1', latestVersion: 'v3', status: 'Pending' },
        { id: 3, type: 'POA2', latestVersion: 'v1', status: 'Changes Requested', changeRequest: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.' },
    ]);

    const handleStatusChange = (docId, newStatus) => {
        setDocuments(documents.map(doc =>
            doc.id === docId ? { ...doc, status: newStatus, changeRequest: newStatus === 'Changes Requested' ? changeRequest : '' } : doc
        ));
        setOpenDropdown(null);
        setShowModal(false);
        setChangeRequest('');
    };

    const handleSaveChanges = (docId) => {
        setDocuments(documents.map(doc =>
            doc.id === docId ? { ...doc, changeRequest: changeRequest } : doc
        ));
        setEditableDocId(null);
    };

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Documents Approval</h2>}
        >
            <Head title={"Package Status"} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">

                        <Container className="flex flex-col h-full">
                            <h3 className='text-xl font-bold mb-4'>Approve or request changes on your documents</h3>
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
                                                    <i className="bi  bi-eye">  {doc.latestVersion}</i>
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
                                                    {editableDocId === doc.id ? (
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={changeRequest}
                                                            onChange={(e) => setChangeRequest(e.target.value)}
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        <>
                                                            {doc.status}
                                                            {
                                                                doc.status === "Changes Requested" &&
                                                                <>
                                                                    <span className='text-black ml-2 cursor-pointer'>
                                                                        <i
                                                                            className="bi bi-eye"
                                                                            onClick={() => {
                                                                                setEditableDocId(doc.id);
                                                                                setChangeRequest(doc.changeRequest);
                                                                            }}
                                                                        ></i>
                                                                    </span>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {doc.changeRequest}
                                                                    </p>
                                                                </>
                                                            }
                                                        </>
                                                    )}
                                                </td>
                                                <td>

                                                    {editableDocId === doc.id ? (
                                                        <>
                                                            <div className='d-flex justify-content-around gap-3'>
                                                                <Button className='w-[50%]' variant="outline-success" size="sm" onClick={() => handleSaveChanges(doc.id)}>Save</Button>
                                                                <Button className='w-[50%]' variant="outline-secondary" size="sm" onClick={() => setEditableDocId(null)}>Cancel</Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Dropdown className='w-[100%]' show={openDropdown === doc.id} onToggle={() => setOpenDropdown(openDropdown === doc.id ? null : doc.id)}>
                                                            <Dropdown.Toggle variant="outline-dark" size="sm" className="w-[100%] h-[100%]">
                                                                Select Option
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item onClick={() => setShowModal(true) && setCurrentDocId(doc.id)}>
                                                                    Request Changes
                                                                </Dropdown.Item>
                                                                <Dropdown.Item onClick={() => handleStatusChange(doc.id, 'Approved')}>Approve</Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    )}

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            <Row className="mt-3">
                                <Col xs={6}>
                                    <Link href={route('dashboard')}>
                                        <Button variant="outline-success" size="lg" className="w-100">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>

            {/* Modal for requesting changes */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="changeRequestText">
                        <Form.Label>Enter the changes you want to request:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={changeRequest}
                            onChange={(e) => setChangeRequest(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => handleStatusChange(currentDocId, 'Changes Requested')}>Save Changes</Button>
                </Modal.Footer>
            </Modal>

        </AuthenticatedLayout>
    );
};

export default PackageApproval;
