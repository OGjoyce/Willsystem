import React, { useState, useEffect } from "react";
import {
    Container,
    Row,
    Col,
    Button,
    Spinner,
    Form,
    InputGroup,
    Modal,
} from "react-bootstrap";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "react-data-table-component";
import AvailabilitySchedulerGrid from "@/Components/Scheduler/AvailabilitySchedulerGrid";

const LawyersManagement = () => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showScheduler, setShowScheduler] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [modalLawyer, setModalLawyer] = useState(null);

    useEffect(() => {
        const fetchLawyers = () => {
            setTimeout(() => {
                setLawyers([
                    { id: 1, name: "John Doe", email: "johndoe@example.com", specialty: "Criminal Law" },
                    { id: 2, name: "Jane Smith", email: "janesmith@example.com", specialty: "Family Law" },
                    { id: 3, name: "Robert Johnson", email: "robertjohnson@example.com", specialty: "Corporate Law" },
                ]);
                setLoading(false);
            }, 1000);
        };

        fetchLawyers();
    }, []);

    const handleAddLawyer = () => {
        setModalType("add");
        setModalLawyer({ name: "", email: "", specialty: "" });
        setShowModal(true);
    };

    const handleEditLawyer = (lawyer) => {
        setModalType("edit");
        setModalLawyer(lawyer);
        setShowModal(true);
    };

    const handleDeleteLawyer = (lawyer) => {
        setModalType("delete");
        setModalLawyer(lawyer);
        setShowModal(true);
    };

    const handleManageSchedule = (lawyer) => {
        setSelectedLawyer(lawyer);
        setShowScheduler(true);
    };

    const handleModalSubmit = () => {
        if (modalType === "add") {
            const newId = lawyers.length ? Math.max(lawyers.map((l) => l.id)) + 1 : 1;
            setLawyers((prev) => [...prev, { ...modalLawyer, id: newId }]);
        } else if (modalType === "edit") {
            setLawyers((prev) =>
                prev.map((lawyer) =>
                    lawyer.id === modalLawyer.id ? modalLawyer : lawyer
                )
            );
        } else if (modalType === "delete") {
            setLawyers((prev) => prev.filter((lawyer) => lawyer.id !== modalLawyer.id));
        }
        setShowModal(false);
    };

    const filteredLawyers = lawyers.filter((lawyer) =>
        lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => <span className="text-sm text-gray-700 font-medium">{row.name}</span>,
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
            cell: (row) => <span className="text-sm text-gray-700 font-medium">{row.email}</span>,
        },
        {
            name: "Specialty",
            selector: (row) => row.specialty,
            sortable: true,
            cell: (row) => <span className="text-sm text-gray-700 font-medium">{row.specialty}</span>,
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleManageSchedule(row)}
                    >
                        <i className="bi bi-calendar-week"> </i>
                        Manage Schedule
                    </Button>
                    <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleEditLawyer(row)}
                    >
                        <i className="bi bi-pencil me-1"> </i>
                        Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteLawyer(row)}
                    >
                        <i className="bi bi-trash"> </i>
                        Delete
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: "#f9fafb",
            },
        },
        headCells: {
            style: {
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#1f2937",
                paddingLeft: "16px",
                paddingRight: "16px",
            },
        },
        cells: {
            style: {
                fontSize: "0.85rem",
                color: "#374151",
                paddingLeft: "16px",
                paddingRight: "16px",
            },
        },
    };

    return (
        <AuthenticatedLayout
            user={{ name: "Admin" }}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Lawyers Management</h2>}
        >
            <Container className="py-5">
                {showScheduler ? (
                    <div style={{ height: "75vh", overflow: "auto" }}>
                        <AvailabilitySchedulerGrid lawyer={selectedLawyer} showScheduler={showScheduler} setShowScheduler={setShowScheduler} />
                    </div>
                ) : (
                    <>
                        <Row className="mb-4">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text id="search-icon">
                                        <i className="bi bi-search"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name or email"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6} className="text-end">
                                <Button variant="primary" onClick={handleAddLawyer}>
                                    <i className="bi bi-person-add"> </i>
                                    Add New Lawyer
                                </Button>
                            </Col>
                        </Row>

                        {loading ? (
                            <div className="text-center">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={filteredLawyers}
                                pagination
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 25, 50, 100, 256]}
                                highlightOnHover
                                responsive
                                fixedHeader
                                fixedHeaderScrollHeight="500px"
                                noDataComponent="No lawyers found."
                                customStyles={customStyles}
                            />
                        )}
                    </>
                )}

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalType === "add" && "Add New Lawyer"}
                            {modalType === "edit" && "Edit Lawyer"}
                            {modalType === "delete" && "Delete Lawyer"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {modalType === "delete" ? (
                            <p>Are you sure you want to delete {modalLawyer?.name}?</p>
                        ) : (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name"
                                        value={modalLawyer?.name || ""}
                                        onChange={(e) => setModalLawyer({ ...modalLawyer, name: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={modalLawyer?.email || ""}
                                        onChange={(e) => setModalLawyer({ ...modalLawyer, email: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Specialty</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter specialty"
                                        value={modalLawyer?.specialty || ""}
                                        onChange={(e) => setModalLawyer({ ...modalLawyer, specialty: e.target.value })}
                                    />
                                </Form.Group>
                            </Form>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={modalType === "delete" ? "danger" : "primary"}
                            onClick={handleModalSubmit}
                        >
                            {modalType === "delete" ? "Delete" : "Save Changes"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </AuthenticatedLayout>
    );
};

export default LawyersManagement;
