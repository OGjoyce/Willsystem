import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
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
                    newAllRelatives.push(kid);
                });
            }

            // Add manually added relatives
            newAllRelatives.push(...relatives);

            setAllRelatives(newAllRelatives);
        }
    }, [datas, relatives]);

    const handleClose = () => {
        const modalData = getHumanData();
        var errors = validate.addHumanData(modalData);

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

    const handleShow = () => setShow(true);
    const handleCloseNosave = () => setShow(false);

    const handleShowExecutor = (relative) => {
        setSelectedExecutor(relative);
        setShowExecutor(true);
    };

    const handleCloseExecutor = () => {
        if (selectedExecutor) {
            setExecutors(prevExecutors => [...prevExecutors, { ...selectedExecutor, id: nextId++ }]);
        }
        setShowExecutor(false);
        setSelectedExecutor(null);
    };

    const handleDeleteExecutor = (id) => {
        setExecutors(prevExecutors => prevExecutors.filter(executor => executor.id !== id));
    };

    return (
        <>
            <Table striped bordered hover responsive>
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

            <div className="d-grid gap-2">
                <Button variant="success" size="lg" onClick={handleShow}>
                    Add new Relative
                </Button>
            </div>

            <Table striped bordered hover responsive>
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
                    {executors.map((executor, index) => (
                        <tr key={executor.id}>
                            <td>{index + 1}</td>
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
                <p className="mt-2 text-sm text-center text-red-600">{validationErrors.executors}</p>
            )}

            <Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Person</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddHuman human={true} errors={validationErrors} />
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

            <Modal show={showExecutor} onHide={() => setShowExecutor(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Selecting Executor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to add the following executor?</p>
                    {selectedExecutor && (
                        <p>{`${selectedExecutor.firstName} ${selectedExecutor.lastName} -> ${selectedExecutor.relative}`}</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={() => setShowExecutor(false)}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCloseExecutor}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default HumanTable;