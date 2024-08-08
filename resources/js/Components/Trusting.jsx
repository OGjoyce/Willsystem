import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

// Create a ref to hold the tableData array
const tableDataRef = { current: [] };

export function getTableData() {
    return tableDataRef.current;
}

function Trusting({ datas, errors }) {
    const [localTableData, setLocalTableData] = useState([]);
    const [localPointer, setLocalPointer] = useState(1);
    const [localSharescounter, setLocalSharescounter] = useState(0);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [age, setAge] = useState('');
    const [shares, setShares] = useState('');

    // Initialize table data from localStorage on component mount
    useEffect(() => {
        const formValues = localStorage.getItem('formValues');
        if (formValues) {
            const parsedFormValues = JSON.parse(formValues);
            if (parsedFormValues.trusting) {
                const parsedData = parsedFormValues.trusting;
                setLocalTableData(parsedData);
                tableDataRef.current = parsedData; // Update ref
                setLocalPointer(parsedData.length ? parsedData[parsedData.length - 1].id + 1 : 1);
                const totalShares = parsedData.reduce((acc, item) => acc + parseFloat(item.shares), 0);
                setLocalSharescounter(totalShares);
            }
        }
    }, []);

    // Update localStorage whenever localTableData changes
    useEffect(() => {
        const formValues = localStorage.getItem('formValues') ? JSON.parse(localStorage.getItem('formValues')) : {};
        formValues.trusting = localTableData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
        tableDataRef.current = localTableData; // Update ref
    }, [localTableData]);

    const handleAdd = () => {
        setValidationErrors({});
        const floatShares = parseFloat(shares);
        let flag = false;

        // Validate age
        if (!age || age > 100 || age <= 0) {
            setValidationErrors(prevErrors => ({ ...prevErrors, age: 'A valid age is required' }));
            return;
        }

        // Validate shares
        if (!shares || shares <= 0 || shares > 100) {
            setValidationErrors(prevErrors => ({ ...prevErrors, shares: 'Valid percent is required for shares' }));
            return;
        }

        // Check if the age already exists
        const addedAge = localTableData.filter(i => i.age === age);

        if (addedAge.length > 0) {
            setValidationErrors(prevErrors => ({ ...prevErrors, age: 'Age already set, delete the previous selection or change the age to proceed' }));
            return;
        }

        // Check if shares exceed 100%
        if ((localSharescounter + floatShares) > 100) {
            setValidationErrors(prevErrors => ({ ...prevErrors, shares: `Cannot add ${shares}%. Current total is ${localSharescounter}%. The sum cannot exceed 100%` }));
            return;
        }

        const newEntry = {
            id: localPointer,
            age: age,
            shares: shares
        };

        setLocalTableData(prevData => [...prevData, newEntry]);
        setLocalPointer(prevPointer => prevPointer + 1);
        setLocalSharescounter(prevCounter => prevCounter + floatShares);
        setAge('');
        setShares('');
    };

    const handleDelete = (itemid) => {
        const newData = localTableData.filter(obj => obj.id !== itemid);
        const totalShares = newData.reduce((acc, item) => acc + parseFloat(item.shares), 0);

        setLocalTableData(newData);
        setLocalSharescounter(totalShares);
        setLocalPointer(prevPointer => prevPointer - 1);
    };

    return (
        <>
            <h1>Testamentary Trust</h1>
            <p>Designate amounts received by minors and ages</p>
            <p>! Remember that the sum of the shares should be equal to 100%, see the table below</p>
            <Form>
                <Form.Group controlId="age">
                    <Form.Label>Age</Form.Label>
                    <Form.Control type="number" value={age} onChange={(e) => setAge(e.target.value)} />
                    {validationErrors.age && <p className="mt-2 text-sm text-red-600">{validationErrors.age}</p>}
                </Form.Group>
                <Form.Group controlId="shares">
                    <Form.Label>Shares %</Form.Label>
                    <Form.Control type="number" value={shares} onChange={(e) => setShares(e.target.value)} />
                    {validationErrors.shares && <p className="mt-2 text-sm text-red-600">{validationErrors.shares}</p>}
                </Form.Group>
            </Form>
            <Button variant="success" size="sm" onClick={handleAdd}>Add new Share</Button>
            <div id="example-collapse-text">
                {validationErrors.trusting && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.trusting}</p>}
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>Age</th>
                            <th>Percentage</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localTableData.length === 0 ? (
                            <tr>
                                <td colSpan="4">No information added yet, press "Add New Share" to add.</td>
                            </tr>
                        ) : (
                            localTableData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.id}</td>
                                    <td>{item.age}</td>
                                    <td>{item.shares}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            <div>
                <p><b><u>Total: {localSharescounter} %</u></b></p>
            </div>
        </>
    );
}

export default Trusting;
