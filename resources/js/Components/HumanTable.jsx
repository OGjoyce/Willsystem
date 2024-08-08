import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import { validate } from './Validations';

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
    const [executorPriority, setExecutorPriority] = useState(null); // Cambiado a null para validar si se ha seleccionado
    const [priorityError, setPriorityError] = useState(''); // Error de prioridad
    const maxPriority = 5;

    const handlePriorityChange = (number) => {
        setExecutorPriority(number);
        setPriorityError(''); // Limpiar el error cuando se selecciona una prioridad
    };

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

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

            // Add spouse if married
            const marriedData = datas.find(item => item.married);
            if (marriedData && marriedData.married.relative === "Spouse") {
                newAllRelatives.push(marriedData.married);
            }

            // Add kids
            const kidsData = datas.find(item => item.kids);
            if (kidsData) {
                kidsData.kids.forEach(kid => {
                    newAllRelatives.push({
                        ...kid,
                        uuid: kid.id
                    });
                });
            }

            // Add manually added relatives
            newAllRelatives.push(...relatives);

            setAllRelatives(newAllRelatives);

            // Update executors to ensure spouse data is updated from relatives
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
        setPriorityError('')
        setShow(true)

    };
    const handleCloseNosave = () => {
        setPriorityError('')
        setShow(false);
    }

    const handleShowExecutor = (relative) => {
        setPriorityError('')
        setSelectedExecutor(relative);
        setShowExecutor(true);
    };

    const handleCloseExecutor = () => {
        setPriorityError('')
        if (selectedExecutor) {
            if (executorPriority) {
                const newExecutor = {
                    ...selectedExecutor,
                    priority: executorPriority,
                    id: nextId++ // Asigna un ID único a cada nuevo executor
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

    const handleDeleteExecutor = (id) => {
        setExecutors(prevExecutors => prevExecutors.filter(executor => executor.id !== id));
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
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Relative</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {executors.map((executor) => (
                        <tr key={executor.id}>
                            <td>{executor.priority !== undefined ? executor.priority : 'N/A'}</td> {/* Manejar valor vacío */}
                            <td>{executor.firstName}</td>
                            <td>{executor.lastName}</td>
                            <td>{executor.relative}</td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteExecutor(executor.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {validationErrors.executors && (
                <p className="mt-2 text-center text-danger">{validationErrors.executors}</p>
            )}

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
        </>
    );
}

export default HumanTable;
