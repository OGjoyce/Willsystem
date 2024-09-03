import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import CustomToast from './AdditionalComponents/CustomToast';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';

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
    const [editingRow, setEditingRow] = useState(null);
    const [tempEditData, setTempEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        const formValues = localStorage.getItem('formValues');
        if (formValues) {
            const parsedFormValues = JSON.parse(formValues);
            if (parsedFormValues.trusting) {
                const parsedData = parsedFormValues.trusting;
                setLocalTableData(parsedData);
                tableDataRef.current = parsedData;
                setLocalPointer(parsedData.length ? Math.max(...parsedData.map(item => item.id)) + 1 : 1);
                const totalShares = parsedData.reduce((acc, item) => acc + parseFloat(item.shares), 0);
                setLocalSharescounter(totalShares);
            }
        }
    }, []);

    useEffect(() => {
        const formValues = localStorage.getItem('formValues') ? JSON.parse(localStorage.getItem('formValues')) : {};
        formValues.trusting = localTableData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
        tableDataRef.current = localTableData;
    }, [localTableData]);

    const handleAdd = () => {
        setValidationErrors({});
        const floatShares = parseFloat(shares);

        if (!age || age > 100 || age <= 0) {
            setValidationErrors(prevErrors => ({ ...prevErrors, age: 'A valid age is required' }));
            return;
        }

        if (!shares || shares <= 0 || shares > 100) {
            setValidationErrors(prevErrors => ({ ...prevErrors, shares: 'Valid percent is required for shares' }));
            return;
        }

        const addedAge = localTableData.filter(i => i.age === age);

        if (addedAge.length > 0) {
            setValidationErrors(prevErrors => ({ ...prevErrors, age: 'Age already set, delete the previous selection or change the age to proceed' }));
            return;
        }

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

    const handleDelete = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            const newData = localTableData.filter(obj => obj.id !== itemToDelete);
            const totalShares = newData.reduce((acc, item) => acc + parseFloat(item.shares), 0);

            setLocalTableData(newData);
            setLocalSharescounter(totalShares);
            setToastMessage('Share removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (index) => {
        setEditingRow(index);
        setTempEditData({ ...localTableData[index] });
    };

    const handleSave = (index) => {
        if (!tempEditData) return;

        const updatedData = [...localTableData];
        updatedData[index] = tempEditData;
        const totalShares = updatedData.reduce((acc, item) => acc + parseFloat(item.shares), 0);

        if (totalShares > 100) {
            setValidationErrors(prevErrors => ({ ...prevErrors, shares: `Total shares exceed 100%. Current total is ${totalShares}%` }));
            return;
        }

        setLocalTableData(updatedData);
        setLocalSharescounter(totalShares);
        setToastMessage('Share updated successfully');
        setShowToast(true);
        setEditingRow(null);
        setTempEditData(null);
        setValidationErrors({});
    };

    const handleCancel = () => {
        setEditingRow(null);
        setTempEditData(null);
        setValidationErrors({});
    };

    const handleChange = (field, value) => {
        setTempEditData(prev => ({ ...prev, [field]: value }));
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localTableData.map((item, index) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>
                                    {editingRow === index ? (
                                        <Form.Control
                                            type="number"
                                            value={tempEditData.age}
                                            onChange={(e) => handleChange('age', e.target.value)}
                                        />
                                    ) : (
                                        item.age
                                    )}
                                </td>
                                <td>
                                    {editingRow === index ? (
                                        <Form.Control
                                            type="number"
                                            value={tempEditData.shares}
                                            onChange={(e) => handleChange('shares', e.target.value)}
                                        />
                                    ) : (
                                        item.shares
                                    )}
                                </td>
                                <td>
                                    <div className='d-flex justify-content-around gap-3'>
                                        {editingRow === index ? (
                                            <>
                                                <Button className="w-[50%]" variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                                <Button className="w-[50%]" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-[50%]" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                                <Button className="w-[50%]" variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>
            <div>
                <p><b><u>Total: {localSharescounter} %</u></b></p>
            </div>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this share?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </>
    );
}

export default Trusting;