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
    Alert,
} from "react-bootstrap";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "react-data-table-component";

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [errors, setErrors] = useState({}); // New state for errors

    const [modalUser, setModalUser] = useState({
        name: "",
        email: "",
        user_type: 1,
        password: "",
        password_confirmation: "",
    });

    // Fetch users from the API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/users");
            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle modal actions for adding, editing, and deleting a user
    const handleAddUser = () => {
        setModalType("add");
        setErrors({});
        setModalUser({
            name: "",
            email: "",
            user_type: 1,
            password: "",
            password_confirmation: "",
        });
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setModalType("edit");
        setErrors({});
        // Ensure password fields are empty during editing unless you want to update them
        setModalUser({
            ...user,
            password: "",
            password_confirmation: "",
        });
        setShowModal(true);
    };

    const handleDeleteUser = (user) => {
        setModalType("delete");
        setErrors({});
        setModalUser(user);
        setShowModal(true);
    };

    const handleModalSubmit = async () => {
        try {
            setErrors({});
            let response;
            // Build the payload from modalUser state.
            let payload = {
                name: modalUser.name,
                email: modalUser.email,
                user_type: modalUser.user_type,
            };

            if (modalType === "add") {
                payload.password = modalUser.password;
                payload.password_confirmation = modalUser.password_confirmation;
                response = await fetch("/api/users", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });
            } else if (modalType === "edit") {
                // Optionally include password if user provided new ones
                if (modalUser.password) {
                    payload.password = modalUser.password;
                    payload.password_confirmation = modalUser.password_confirmation;
                }
                response = await fetch(`/api/users/${modalUser.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });
            } else if (modalType === "delete") {
                response = await fetch(`/api/users/${modalUser.id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                });
            }

            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Error response:", errorResponse);
                // Set errors state to display in the modal
                setErrors(errorResponse.errors || {});
                throw new Error(
                    errorResponse.message || `Failed to ${modalType} user`
                );
            }

            setShowModal(false);
            fetchUsers(); // Reload the list after operation
        } catch (error) {
            console.error("Error submitting modal:", error.message);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Define columns for the DataTable
    const columns = [
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">{row.name}</span>
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
            name: "User Type",
            selector: (row) => row.user_type,
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-700 font-medium">
                    {row.user_type === 1 && "User"}
                    {row.user_type === 2 && "Admin"}
                    {row.user_type === 3 && "Root"}
                    {row.user_type === 4 && "Lawyer"}
                </span>
            ),
        },
        {
            name: "Actions",
            cell: (row) => (
                <div className="d-flex align-items-center gap-2">
                    <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleEditUser(row)}
                    >
                        <i className="bi bi-pencil me-1"></i> Edit
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteUser(row)}
                    >
                        <i className="bi bi-trash"></i> Delete
                    </Button>
                </div>
            ),
            ignoreRowClick: true,
        },
    ];

    // Custom styles for the DataTable
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
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Users Management
                </h2>
            }
        >
            <Container className="py-5">
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
                        <Button variant="primary" onClick={handleAddUser}>
                            <i className="bi bi-person-add"></i> Add New User
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
                        data={filteredUsers}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100, 256]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="500px"
                        noDataComponent="No users found."
                        customStyles={customStyles}
                    />
                )}

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {modalType === "add" && "Add New User"}
                            {modalType === "edit" && "Edit User"}
                            {modalType === "delete" && "Delete User"}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {modalType === "delete" ? (
                            <p>
                                Are you sure you want to delete{" "}
                                <strong>{modalUser.name}</strong>?
                            </p>
                        ) : (
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name"
                                        value={modalUser.name || ""}
                                        onChange={(e) =>
                                            setModalUser({ ...modalUser, name: e.target.value })
                                        }
                                    />
                                    {errors.name && (
                                        <div className="text-danger mt-1">
                                            {errors.name.join(" ")}
                                        </div>
                                    )}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter email"
                                        value={modalUser.email || ""}
                                        onChange={(e) =>
                                            setModalUser({ ...modalUser, email: e.target.value })
                                        }
                                    />
                                    {errors.email && (
                                        <div className="text-danger mt-1">
                                            {errors.email.join(" ")}
                                        </div>
                                    )}
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>User Type</Form.Label>
                                    <Form.Select
                                        value={modalUser.user_type}
                                        onChange={(e) =>
                                            setModalUser({
                                                ...modalUser,
                                                user_type: parseInt(e.target.value),
                                            })
                                        }
                                    >
                                        <option value={1}>User</option>
                                        <option value={2}>Admin</option>
                                        <option value={3}>Root</option>
                                        <option value={4}>Lawyer</option>
                                    </Form.Select>
                                    {errors.user_type && (
                                        <div className="text-danger mt-1">
                                            {errors.user_type.join(" ")}
                                        </div>
                                    )}
                                </Form.Group>
                                {(modalType === "add" || modalType === "edit") && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter password"
                                                value={modalUser.password || ""}
                                                onChange={(e) =>
                                                    setModalUser({
                                                        ...modalUser,
                                                        password: e.target.value,
                                                    })
                                                }
                                            />
                                            {errors.password && (
                                                <div className="text-danger mt-1">
                                                    {errors.password.join(" ")}
                                                </div>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Confirm Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Confirm password"
                                                value={modalUser.password_confirmation || ""}
                                                onChange={(e) =>
                                                    setModalUser({
                                                        ...modalUser,
                                                        password_confirmation: e.target.value,
                                                    })
                                                }
                                            />
                                            {errors.password_confirmation && (
                                                <div className="text-danger mt-1">
                                                    {errors.password_confirmation.join(" ")}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </>
                                )}
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

export default UsersManagement;
