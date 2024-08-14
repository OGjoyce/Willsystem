import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import Form from 'react-bootstrap/Form';
import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import { validate } from './Validations';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import { Dropdown } from 'react-bootstrap';

let nextId = 1;

let relativesObj = [];
let executorsObj = [];

export function getRelatives() {
    return relativesObj;
}

export function getExecutors() {
    return executorsObj;
}

function HumanTable({ id, datas, errors }) {
    const [relatives, setRelatives] = useState(() => {
        const savedValues = localStorage.getItem('formValues');
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        return parsedValues.relatives || [];
    });

    const [executors, setExecutors] = useState(() => {
        const savedValues = localStorage.getItem('formValues');
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        return parsedValues.executors || [];
    });

    const [show, setShow] = useState(false);
    const [showExecutor, setShowExecutor] = useState(false);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [selectedExecutor, setSelectedExecutor] = useState(null);
    const [allRelatives, setAllRelatives] = useState([]);
    const [executorPriority, setExecutorPriority] = useState(null);
    const [priorityError, setPriorityError] = useState('');
    const maxPriority = 5;
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [allNames, setAllNames] = useState([]);
    const [tempExecutors, setTempExecutors] = useState([]);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        if (datas) {
            const names = allRelatives.map(relative => `${relative.firstName} ${relative.lastName}`);
            setAllNames([...new Set(names)]); // Elimina duplicados
        }
    }, [datas, allRelatives]);

    useEffect(() => {
        const savedValues = localStorage.getItem('formValues');
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        parsedValues.relatives = relatives;
        localStorage.setItem('formValues', JSON.stringify(parsedValues));
        relativesObj = relatives;
    }, [relatives]);

    useEffect(() => {
        const savedValues = localStorage.getItem('formValues');
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        parsedValues.executors = executors;
        localStorage.setItem('formValues', JSON.stringify(parsedValues));
        executorsObj = executors;
    }, [executors]);

    useEffect(() => {
        if (datas) {
            const newAllRelatives = [];

            const marriedData = datas.find(item => item.married);
            if (marriedData && marriedData.married.relative === "Spouse") {
                newAllRelatives.push(marriedData.married);
            }

            const kidsData = datas.find(item => item.kids);
            if (kidsData) {
                kidsData.kids.forEach(kid => {
                    newAllRelatives.push({
                        ...kid,
                        uuid: kid.id
                    });
                });
            }

            newAllRelatives.push(...relatives);

            setAllRelatives(newAllRelatives);

            setExecutors(prevExecutors => {
                const updatedExecutors = prevExecutors.map(executor => {
                    if (executor.relative === "Spouse") {
                        const spouseFromRelatives = newAllRelatives.find(rel => rel.relative === "Spouse");
                        return spouseFromRelatives ? { ...spouseFromRelatives, id: executor.id, priority: executor.priority } : executor;
                    }
                    return executor;
                });
                return updatedExecutors;
            });
        }
    }, [datas, relatives]);

    const handleClose = () => {
        const modalData = getHumanData();
        const errors = validate.addHumanData(modalData);

        if (Object.keys(errors).length <= 0) {
            const newRelative = {
                ...modalData,
                id: nextId++
            };
            setRelatives(prevRelatives => [...prevRelatives, newRelative]);
            setShow(false);
            setValidationErrors({});
        } else {
            setValidationErrors(errors);
        }
    };

    const handleShow = () => {
        setPriorityError('');
        setShow(true);
    };

    const handleCloseNosave = () => {
        setPriorityError('');
        setShow(false);
    };

    const handleShowExecutor = (relative) => {
        setPriorityError('');
        setSelectedExecutor(relative);
        setShowExecutor(true);
    };

    const handleCloseExecutor = () => {
        setPriorityError('');
        if (selectedExecutor) {
            if (executorPriority) {
                const newExecutor = {
                    ...selectedExecutor,
                    priority: executorPriority,
                    id: nextId++
                };

                setExecutors(prevExecutors => [
                    ...prevExecutors,
                    newExecutor
                ]);

                setPriorityError('');
                setShowExecutor(false);
                setSelectedExecutor(null);
                setExecutorPriority(null);
            } else {
                setPriorityError('Priority must be selected.');
            }
        }
    };

    const handlePriorityChange = (number) => {
        setExecutorPriority(number);
        setPriorityError('');
    };

    const handleEdit = (index) => {
        setEditingRow(index);
        setTempExecutors([...executors]);
    };

    const handleSave = (index) => {
        setExecutors(tempExecutors);
        setToastMessage('Executor updated successfully');
        setShowToast(true);
        setEditingRow(null);
    };

    const handleCancel = () => {
        setTempExecutors([]);
        setEditingRow(null);
    };

    const handleDelete = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            setExecutors(prevExecutors => prevExecutors.filter(executor => executor.id !== itemToDelete));
            setToastMessage('Executor removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleDropdownSelect = (index, key, value) => {
        const updatedExecutors = [...tempExecutors];
        if (key === 'firstName') {
            const [firstName, lastName] = value.split(' ');
            const selectedRelative = allRelatives.find(rel =>
                rel.firstName === firstName && rel.lastName === lastName
            );

            if (selectedRelative) {
                updatedExecutors[index] = {
                    ...updatedExecutors[index],
                    firstName,
                    lastName,
                    relative: selectedRelative.relative
                };
            }
        } else {
            updatedExecutors[index][key] = value;
        }
        setTempExecutors(updatedExecutors);
    };

    return (
        <>
            <Table striped bordered hover responsive className="text-center">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Relative</th>
                        <th>Select</th>
                    </tr>
                </thead>
                <tbody>
                    {allRelatives.map((relative, index) => (
                        <tr key={index + 1}>
                            <td>{index + 1}</td>
                            <td>{relative.firstName}</td>
                            <td>{relative.lastName}</td>
                            <td>{relative.relative}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleShowExecutor(relative)}>
                                    Select Executor
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className="d-grid gap-2 mb-3">
                <Button variant="success" size="lg" onClick={handleShow}>
                    Add New Relative
                </Button>
            </div>

            <Table striped bordered hover responsive className="text-center">
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Executor</th>
                        <th>Relative</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {(editingRow !== null ? tempExecutors : executors).map((executor, index) => (
                        <tr key={executor.id}>
                            <td>
                                {editingRow === index ? (
                                    <Form.Control
                                        type="number"
                                        value={executor.priority}
                                        onChange={(e) => handleDropdownSelect(index, 'priority', Number(e.target.value))}
                                        min="1"
                                        max={maxPriority}
                                    />
                                ) : (
                                    executor.priority
                                )}
                            </td>
                            <td>
                                {editingRow === index ? (
                                    <Dropdown onSelect={(eventKey) => handleDropdownSelect(index, 'firstName', eventKey)}>
                                        <Dropdown.Toggle variant="outline-dark" id={`dropdown-executor-${index}`}>
                                            {`${executor.firstName} ${executor.lastName}` || 'Select Executor'}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {allNames.map((name, idx) => (
                                                <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                ) : (
                                    `${executor.firstName} ${executor.lastName}`
                                )}
                            </td>
                            <td>{executor.relative}</td>
                            <td>
                                <div className='d-flex justify-content-around gap-3'>
                                    {editingRow === index ? (
                                        <>
                                            <Button style={{ width: "50%" }} variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                            <Button style={{ width: "50%" }} variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button style={{ width: "50%" }} variant="outline-danger" size="sm" onClick={() => handleDelete(executor.id)}>Delete</Button>
                                            <Button style={{ width: "50%" }} variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={show} onHide={handleCloseNosave} dialogClassName="modal-90w">
                <Modal.Header closeButton>
                    <Modal.Title>Add Person</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddHuman human={true} errors={validationErrors} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseNosave}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showExecutor} onHide={() => setShowExecutor(false)} dialogClassName="modal-60w">
                <Modal.Header closeButton>
                    <Modal.Title>Selecting Executor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <p>Are you sure you want to add the following executor?</p>
                        {selectedExecutor && (
                            <p><strong>{`${selectedExecutor.firstName} ${selectedExecutor.lastName}`}</strong> - {selectedExecutor.relative}</p>
                        )}

                        <p>Select priority:</p>
                        <Pagination className="d-inline-flex justify-content-center">
                            {[...Array(maxPriority)].map((_, index) => (
                                <Pagination.Item
                                    key={index + 1}
                                    active={index + 1 === executorPriority}
                                    onClick={() => handlePriorityChange(index + 1)}
                                >
                                    {index + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                        {priorityError && <p className="mt-2 text-danger">{priorityError}</p>}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExecutor(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCloseExecutor}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this executor?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </>
    );
}

export default HumanTable;