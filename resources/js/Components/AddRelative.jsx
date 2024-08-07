import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { validate } from './Validations';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import Modal from 'react-bootstrap/Modal';
import ResetPassword from '@/Pages/Auth/ResetPassword';

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

        // Realiza la validación
        var errors = validate.addHumanData(modalData);
        const { email, phone, ...restErrors } = errors;
        errors = restErrors;

        if (Object.keys(errors).length <= 0) {
            const newEntry = {
                id: ids,
                firstName: modalData.firstName,
                lastName: modalData.lastName,
                relative: modalData.relative,
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
            setShow(false);
            setValidationErrors({});
        } else {
            setValidationErrors(errors);
            console.log(errors);
        }
    };

    const handleDelete = (id) => {
        setTableData((prevData) => {
            const updatedData = prevData.filter((obj) => obj.id !== id);

            // Get formValues from localStorage
            const key = 'formValues';
            const savedValues = localStorage.getItem(key);
            const parsedValues = savedValues ? JSON.parse(savedValues) : {};

            // Update kids in formValues
            parsedValues.kids = updatedData;

            // Remove the child from executors if present
            if (parsedValues.executors) {
                parsedValues.executors = parsedValues.executors.filter(
                    executor => !(executor.uuid === id && executor.relative === "Child")
                );
            }

            localStorage.setItem(key, JSON.stringify(parsedValues));
            return updatedData;
        });
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
                            <th>Delete</th>
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
                            tableData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.id}</td>
                                    <td>{item.firstName}</td>
                                    <td>{item.lastName}</td>
                                    <td>{item.relative}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                                            Delete
                                        </Button>
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
        </>
    );
}

export function getChildRelatives() {
    return childRelatives;
}

export default AddRelative;
