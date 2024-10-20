import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Button, Table, Dropdown, Modal, Form, Alert } from 'react-bootstrap';
import PDFViewer from '@/Components/PDF/PDFViewer';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';
import useDocumentApproval from './useDocumentApproval';

const PackageStatus = ({ id }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentDocId, setCurrentDocId] = useState(null);
    const [changeRequest, setChangeRequest] = useState('');
    const [editableDocId, setEditableDocId] = useState(null);
    const [showPDFViewer, setShowPDFViewer] = useState(false);
    const [currentDocumentDOM, setCurrentDocumentDOM] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { documents, error, loading, handleStatusChange } = useDocumentApproval(id);


    const handleViewDocument = (owner, docId) => {

        const document = documents.find(doc => doc.owner === owner && doc.id === docId);
        console.log(document)
        if (document && document.content) {
            setCurrentDocumentDOM(document.content);
            setShowPDFViewer(true);
        } else {
            console.error('Document content not found');
        }
    };

    console.log(openDropdown)

    async function handleSaveChanges(owner, docId) {
        try {
            await handleStatusChange(owner, docId, 'Changes Requested', changeRequest);
            setEditableDocId(null);
            setChangeRequest('');
            setToastMessage('Changes saved successfully');
            setShowToast(true);
        } catch (error) {
            console.error('Error saving changes:', error);
            setToastMessage('Failed to save changes. Please try again.');
            setShowToast(true);
        }
        setShowModal(false);
        await fetchDocuments();
    }


    const handleDropdownClick = (doc) => {
        if (doc.status === "Changes requested") {
            setEditableDocId(doc.id);
            setChangeRequest(doc.changeRequest || '');
            setOpenDropdown(null);
        } else {
            setShowModal(true);
            setCurrentDocId(doc.id);
            setChangeRequest('');
            setOpenDropdown(null);
        }
    };

    const groupedByOwner = documents.reduce((acc, doc) => {
        if (!acc[doc.owner]) acc[doc.owner] = [];
        acc[doc.owner].push(doc);
        return acc;
    }, {});

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Package Status Overview</h2>}
        >
            <Head title="Package Status" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <Container className="flex flex-col h-full">
                            {loading ? (
                                <Alert variant="info">Loading documents...</Alert>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : documents.length === 0 ? (
                                <Alert variant="warning">No documents found</Alert>
                            ) : (
                                Object.keys(groupedByOwner).map(owner => (
                                    <div key={owner} className="mb-10">
                                        <h1 class="font-bold text-black pl-2 my-2 border-l-4  border-teal-600 ">Documents for: <small class="ms-2 font-semibold text-gray-500">{owner}</small></h1>
                                        <div className="overflow-x-auto flex-grow">
                                            <Table striped bordered hover responsive>
                                                <thead>
                                                    <tr>
                                                        <th>Document Type</th>
                                                        <th>Version</th>
                                                        <th>Status</th>
                                                        <th>Created At</th>
                                                        <th>Updated At</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupedByOwner[owner].map((doc) => (
                                                        <tr key={doc.id}>
                                                            <td>{doc.type}</td>
                                                            <td className='text-center'>
                                                                <i className="bi bi-eye cursor-pointer" onClick={() => handleViewDocument(owner, doc.id)}> {doc.latestVersion}</i>
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
                                                            <td>{doc.createdAt}</td>
                                                            <td>{doc.updatedAt}</td>
                                                            <td>
                                                                {editableDocId === doc.id ? (
                                                                    <div className='d-flex justify-content-around gap-3'>
                                                                        <Button className='w-[50%]' variant="outline-success" size="sm" onClick={() => handleSaveChanges(owner, doc.id)}>Save</Button>
                                                                        <Button className='w-[50%]' variant="outline-secondary" size="sm" onClick={() => setEditableDocId(null)}>Cancel</Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className='d-flex justify-content-around gap-3'>
                                                                        <Dropdown className='w-[50%]' show={openDropdown === `owner: ${doc.owner}, docId: ${doc.id}`} onToggle={() => setOpenDropdown(openDropdown === `owner: ${doc.owner}, docId: ${doc.id}` ? null : `owner: ${doc.owner}, docId: ${doc.id}`)}>
                                                                            <Dropdown.Toggle variant="outline-danger" size="sm" className="w-[100%]">
                                                                                Change Status
                                                                            </Dropdown.Toggle>
                                                                            <Dropdown.Menu className='w-[100%] text-center'>
                                                                                <Dropdown.Item onClick={() => handleStatusChange(owner, doc.id, 'Pending')}>Pending</Dropdown.Item>
                                                                                <Dropdown.Item onClick={() => handleStatusChange(owner, doc.id, 'Approved')}>Approved</Dropdown.Item>
                                                                                <Dropdown.Item onClick={() => handleDropdownClick(doc)}>
                                                                                    Request Changes
                                                                                </Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                        <Button variant="outline-warning" size="sm" className="w-[50%]" onClick={() => handleEditDocument(doc.id)}>Edit Document</Button>
                                                                    </div>
                                                                )}
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Row className="mt-3">
                                <Col xs={6}>
                                    <Link href={route('files-review')}>
                                        <Button variant="outline-success" size="lg" className="w-100">
                                            Go Back
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
                    <Button variant="primary" onClick={() => handleSaveChanges(currentDocId)}>Save Changes</Button>
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

export default PackageStatus;
