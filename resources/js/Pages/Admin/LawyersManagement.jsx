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
    const [modalLawyer, setModalLawyer] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        lawFirmId: 1, // Inicializado en 1
    });


    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/lawyers');
            if (!response.ok) {
                throw new Error('Failed to fetch lawyers');
            }
            const data = await response.json();
            setLawyers(data.data || []);
        } catch (error) {
            console.error("Error fetching lawyers:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {


        fetchLawyers();
    }, []);

    const handleAddLawyer = () => {
        setModalType("add");
        setModalLawyer({
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            email: "",
            lawFirmId: 1,
        });
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

    const handleModalSubmit = async () => {
        try {
            let response;
            let payload = {
                first_name: modalLawyer.firstName,
                last_name: modalLawyer.lastName,
                date_of_birth: modalLawyer.dateOfBirth,
                email: modalLawyer.email,
                law_firm_id: modalLawyer.lawFirmId,
            };

            if (modalType === "add") {
                response = await fetch('/api/lawyers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else if (modalType === "edit") {
                response = await fetch(`/api/lawyers/${modalLawyer.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
            } else if (modalType === "delete") {
                response = await fetch(`/api/lawyers/${modalLawyer.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
            }

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Error response:", errorResponse);
                throw new Error(errorResponse.message || `Failed to ${modalType} lawyer`);
            }

            const data = await response.json();


            setShowModal(false);
            fetchLawyers(); // Recargar la lista de abogados
        } catch (error) {
            console.error("Error submitting modal:", error.message);

        }
    };



    const filteredLawyers = lawyers.filter((lawyer) =>
        lawyer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const columns = [
        {
            name: "First Name",
            selector: (row) => row.first_name,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">{row.first_name}</span>
            ),
        },
        {
            name: "Last Name",
            selector: (row) => row.last_name,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">{row.last_name}</span>
            ),
        },
        {
            name: "Date of Birth",
            selector: (row) => row.date_of_birth,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">{row.date_of_birth}</span>
            ),
        },
        {
            name: "Email",
            selector: (row) => row.email,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">{row.email}</span>
            ),
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
                        <AvailabilitySchedulerGrid
                            lawyer={selectedLawyer}
                            showScheduler={showScheduler}
                            setShowScheduler={setShowScheduler}
                        />
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
                                        placeholder="Search by first name, last name or email"
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
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>
                                    {modalLawyer?.firstName} {modalLawyer?.lastName}
                                </strong>
                                ?
                            </p>
                        ) : (
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter first name"
                                                value={modalLawyer?.firstName || ""}
                                                onChange={(e) =>
                                                    setModalLawyer({
                                                        ...modalLawyer,
                                                        firstName: e.target.value,
                                                    })
                                                }
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter last name"
                                                value={modalLawyer?.lastName || ""}
                                                onChange={(e) =>
                                                    setModalLawyer({
                                                        ...modalLawyer,
                                                        lastName: e.target.value,
                                                    })
                                                }
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        placeholder="Enter date of birth"
                                        value={modalLawyer?.dateOfBirth || ""}
                                        onChange={(e) =>
                                            setModalLawyer({
                                                ...modalLawyer,
                                                dateOfBirth: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={modalLawyer?.email || ""}
                                        onChange={(e) =>
                                            setModalLawyer({
                                                ...modalLawyer,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </Form.Group>
                                {/* Si deseas mostrar el Law Firm ID, pero no editable, puedes descomentar lo siguiente:
                                <Form.Group className="mb-3">
                                    <Form.Label>Law Firm ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={modalLawyer?.lawFirmId || 1}
                                        readOnly
                                    />
                                </Form.Group>
                                */}
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
