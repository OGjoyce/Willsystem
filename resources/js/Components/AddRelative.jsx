import { useState, useEffect } from 'react';
import { Button, Table, Modal } from 'react-bootstrap';
import CustomToast from './AdditionalComponents/CustomToast';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import { validate } from './Validations';

let ids = 1;
var childRelatives;

function AddRelative({ relative, datas, errors, onDataChange }) {
    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState(() => {
        const key = 'formValues';
        const savedValues = localStorage.getItem(key);
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        return parsedValues.kids || [];
    });
    const [validationErrors, setValidationErrors] = useState(errors);
    const [editId, setEditId] = useState(null);
    const [editValues, setEditValues] = useState({ firstName: '', lastName: '' });
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        childRelatives = tableData;
        console.log(childRelatives);
    }, [tableData]);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    const handleCloseNosave = () => {
        setShow(false);
        setValidationErrors({});
    };

    const handleShow = () => {
        setShow(true);
    };

    const handleClose = () => {
        const modalData = getHumanData("childrens");

        // Perform validation
        var errors = validate.addHumanData(modalData);
        const { email, phone, ...restErrors } = errors;
        errors = restErrors;

        if (Object.keys(errors).length <= 0) {
            const newEntry = {
                id: tableData.length + 1,
                firstName: modalData.firstName,
                middleName: modalData.middleName,
                lastName: modalData.lastName,
                relative: modalData.relative,
                isBlendedFamily: modalData.blendedFamily,
                isIncludedOnSpousalWill: modalData.isIncludedOnSpousalWill,
                city: modalData.city,
                country: modalData.country,
                province: modalData.province,
            };

            setTableData((prevData) => {
                const updatedData = [...prevData, newEntry];
                const key = 'formValues';
                const savedValues = localStorage.getItem(key);
                const parsedValues = savedValues ? JSON.parse(savedValues) : {};
                parsedValues.kids = updatedData;
                localStorage.setItem(key, JSON.stringify(parsedValues));
                return updatedData;
            });

            ids += 1;
            setToastMessage('Child added successfully');
            setShowToast(true);
            setShow(false);
            setValidationErrors({});
        } else {
            setValidationErrors(errors);
            console.log(errors);
        }
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        ids = ids - 1;
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            setTableData((prevData) => {
                const updatedData = prevData.filter((obj) => obj.id !== itemToDelete);

                // Get formValues from localStorage
                const key = 'formValues';
                const savedValues = localStorage.getItem(key);
                const parsedValues = savedValues ? JSON.parse(savedValues) : {};

                // Update kids in formValues
                parsedValues.kids = updatedData;

                // Remove the child from executors if present
                if (parsedValues.executors) {
                    parsedValues.executors = parsedValues.executors.filter(
                        executor => !(executor.uuid === itemToDelete && executor.relative === "Child")
                    );
                }

                localStorage.setItem(key, JSON.stringify(parsedValues));
                return updatedData;
            });

            // Show the CustomToast
            setToastMessage('Child removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleEditClick = (id, firstName, lastName) => {
        setEditId(id);
        setEditValues({ firstName, lastName });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handleSaveEdit = () => {
        setTableData((prevData) => {
            const updatedData = prevData.map((item) =>
                item.id === editId
                    ? { ...item, firstName: editValues.firstName, lastName: editValues.lastName }
                    : item
            );
            const key = 'formValues';
            const savedValues = localStorage.getItem(key);
            const parsedValues = savedValues ? JSON.parse(savedValues) : {};
            parsedValues.kids = updatedData;
            localStorage.setItem(key, JSON.stringify(parsedValues));
            return updatedData;
        });

        // Show the CustomToast
        setToastMessage('Child updated successfully');
        setShowToast(true);

        setEditId(null);
        setEditValues({ firstName: '', lastName: '' });
    };

    return (
        <>
            <div className="d-grid gap-2">
                <Button variant="outline-info" size="lg" onClick={handleShow}>
                    Add Child
                </Button>

                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Relative</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    No records found, please add new child using above button...
                                </td>
                            </tr>
                        ) : (
                            tableData.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>
                                        {editId === item.id ? (
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={editValues.firstName}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            item.firstName
                                        )}
                                    </td>
                                    <td>
                                        {editId === item.id ? (
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={editValues.lastName}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            item.lastName
                                        )}
                                    </td>
                                    <td>{item.relative}</td>
                                    <td>
                                        <div className='d-flex gap-2'>
                                            {editId === item.id ? (
                                                <>
                                                    <Button style={{ width: "50%" }} variant="outline-success" size="sm" onClick={handleSaveEdit}>
                                                        Save
                                                    </Button>
                                                    <Button style={{ width: "50%" }} variant="outline-secondary" size="sm" onClick={() => setEditId(null)}>
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        style={{ width: "50%" }}
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}>
                                                        Delete
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        style={{ width: "50%" }}
                                                        size="sm"
                                                        onClick={() => handleEditClick(item.id, item.firstName, item.lastName)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
                {validationErrors.kids && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.kids}</p>}
            </div>

            <Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Child</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddHuman childrens={true} errors={validationErrors} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleCloseNosave}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this child?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </>
    );
}

export function getChildRelatives() {
    return childRelatives;
}

export default AddRelative;
