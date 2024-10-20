import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Inertia } from '@inertiajs/inertia';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Button, Table, Dropdown, Modal, Form, Alert } from 'react-bootstrap';
import PDFViewer from '@/Components/PDF/PDFViewer';
import useDocumentApproval from './useDocumentApproval';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';
import axios from 'axios';

const DocumentsApproval = ({ id, auth }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [changeRequest, setChangeRequest] = useState('');
    const [editableDocId, setEditableDocId] = useState(null);
    const [showPDFViewer, setShowPDFViewer] = useState(false);
    const [currentDocumentDOM, setCurrentDocumentDOM] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetch()
    })

    const fetch = async () => {
        const response = await axios.get('/generate-token')
        console.log(response.data)
    }


    // Use the custom hook here
    const { documents, error, loading, handleStatusChange } = useDocumentApproval(id);

    const handleViewDocument = (docId) => {
        const document = documents.find(doc => doc.id === docId);
        if (document && document.content) {
            setCurrentDocumentDOM(document.content);
            setShowPDFViewer(true);
        } else {
            console.error('Document content not found');
        }
    };

    async function handleSaveChanges(docId) {
        try {
            await handleStatusChange(docId, 'Changes Requested', changeRequest);
            setEditableDocId(null);
            setChangeRequest('');
            setToastMessage('Changes saved successfully');
            setShowToast(true);
        } catch (error) {
            console.error('Error saving changes:', error);
            setToastMessage('Failed to save changes. Please try again.');
            setShowToast(true);
        }
        setShowModal(false)
    };

    const handleDropdownClick = (doc) => {
        if (doc.status === "Changes requested") {
            // If changes are already requested, open the editor in the table
            setEditableDocId(doc.id);
            setChangeRequest(doc.changeRequest || '');
            setOpenDropdown(null); // Close the dropdown
        } else {
            // Otherwise, show the modal
            setShowModal(true);
            setCurrentDocId(doc.id);
            setChangeRequest('');
            setOpenDropdown(null); // Close the dropdown
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Documents Approval</h2>}
        >
            <Head title="Documents Approval" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <Container className="flex flex-col h-full">
                            <h3 className='text-xl font-bold mb-4'>Approve or request changes on your documents</h3>
                            <h4 className='text-lg text-gray-600 mb-6'>Current Package: Facebook Campaign</h4>

                            {loading ? (
                                <Alert variant="info">Loading documents...</Alert>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : documents.length === 0 ? (
                                <Alert variant="warning">No documents found</Alert>
                            ) : (
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
                                                        <i className="bi bi-eye cursor-pointer" onClick={() => handleViewDocument(doc.id)}> {doc.latestVersion}</i>
                                                    </td>
                                                    <td className={
                                                        doc.status === "Approved"
                                                            ? 'text-green-600'
                                                            : (doc.status === "Changes requested"
                                                                ? 'text-red-600'
                                                                : 'text-yellow-600')
                                                    }>
                                                        {editableDocId === doc.id ? (
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={6}
                                                                value={changeRequest}
                                                                onChange={(e) => setChangeRequest(e.target.value)}
                                                                className="w-full"
                                                            />
                                                        ) : (
                                                            <>
                                                                {doc.status}
                                                                {doc.status === "Changes requested" && (
                                                                    <>
                                                                        <span className='text-black ml-2 cursor-pointer'>
                                                                            <i
                                                                                className="bi bi-pencil-square"
                                                                                onClick={() => {
                                                                                    setEditableDocId(doc.id);
                                                                                    setChangeRequest(doc.changeRequest);
                                                                                    setCurrentDocId(doc.id)
                                                                                }}
                                                                            ></i>
                                                                        </span>
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {doc.changeRequest}
                                                                        </p>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editableDocId === doc.id ? (
                                                            <div className='d-flex justify-content-around gap-3'>
                                                                <Button className='w-[50%]' variant="outline-success" size="sm" onClick={() => { handleSaveChanges(currentDocId) }}>Save</Button>
                                                                <Button className='w-[50%]' variant="outline-secondary" size="sm" onClick={() => setEditableDocId(null)}>Cancel</Button>
                                                            </div>
                                                        ) : (
                                                            <Dropdown className='w-[100%]' show={openDropdown === doc.id} onToggle={() => setOpenDropdown(openDropdown === doc.id ? null : doc.id)}>
                                                                <Dropdown.Toggle variant="outline-dark" size="sm" className="w-[100%] h-[100%]">
                                                                    Select Option
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className='w-[100%] text-center'>
                                                                    <Dropdown.Item onClick={() => handleDropdownClick(doc)}>
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
                            )}
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

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Request Changes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="changeRequestText">
                        <Form.Label>Enter the changes you want to request:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={changeRequest}
                            onChange={(e) => setChangeRequest(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => { handleSaveChanges(currentDocId) }}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
            <PDFViewer
                content={currentDocumentDOM}
                show={showPDFViewer}
                handleClose={() => setShowPDFViewer(false)}
            />
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </AuthenticatedLayout>
    );
};

export default DocumentsApproval;
