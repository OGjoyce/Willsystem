import React, { useState, useEffect } from 'react';
import {
    Container, Row, Col, Form, Button, Table, Dropdown
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { extractData } from '@/utils/objectStatusUtils';

let returndata;
export function getWipeoutData() {
    return returndata;
}

let bequestindex = 0;

function Wipeout({ id, datas, errors }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [options, setOptions] = useState([]);
    const [custom, setCustom] = useState(false);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [availableShares, setAvailableShares] = useState(100);
    const [editingRow, setEditingRow] = useState(null);
    const [tempEditData, setTempEditData] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSpecificBeneficiary, setIsSpecificBeneficiary] = useState(false);
    const [isOrganization, setIsOrganization] = useState(false);

    const [beneficiary, setBeneficiary] = useState('');
    const [backup, setBackup] = useState('');
    const [shares, setShares] = useState('');
    const [type, setType] = useState('');
    const [toBeDetermined, setToBeDetermined] = useState(false);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        if (isSpecificBeneficiary) {
            setSelectedCategory(null)
        }
    }, [isSpecificBeneficiary])

    useEffect(() => {
        if (datas) {
            const Wipeout = extractData(datas, 'wipeout', null, {});
            const rawWipeout = Wipeout?.wipeout || {}
            if (rawWipeout.table_dataBequest?.length > 0) {
                setTable_dataBequest(rawWipeout.table_dataBequest || []);
                setSelectedOption(null);
                setIsSpecificBeneficiary(true)
                setAvailableShares(rawWipeout.availableShares);
            } else {
                setTable_dataBequest([])
                setAvailableShares(100)
                setSelectedCategory(rawWipeout.selectedCategory);

            }



            bequestindex = rawWipeout.table_dataBequest?.length || 0;

            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives;
            const kidsq = datas[3]?.kidsq?.selection;

            let names = [];
            if (married) {
                names.push(`${married.firstName} ${married.lastName}`);
            }

            if (kidsq === "true" && kids) {
                Object.values(kids).forEach(child => {
                    names.push(`${child.firstName} ${child.lastName}`);
                });
            }

            if (relatives) {
                Object.values(relatives).forEach(relative => {
                    names.push(`${relative.firstName} ${relative.lastName}`);
                });
            }

            setIdentifiersNames(names);

            const marriedStatus = datas[1]?.marriedq?.selection === "true";
            const sosoStatus = datas[1]?.marriedq?.selection === "soso";

            setOptions([
                `${marriedStatus || sosoStatus
                    ? "50% to parents and siblings and 50% to parents and siblings of spouse"
                    : "100% to parents and siblings"}`,
                `${marriedStatus || sosoStatus
                    ? "50% to siblings and 50% to siblings of spouse"
                    : "100% to siblings"}`
            ]);
        }
    }, [datas]);

    useEffect(() => {
        returndata = {
            wipeout: {
                selectedCategory,
                selectedOption,
                custom,
                table_dataBequest,
                availableShares
            },
            timestamp: Date.now()
        };
    }, [selectedCategory, selectedOption, custom, table_dataBequest, availableShares]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setValidationErrors({});
        setCustom(false);
        setTable_dataBequest([]);
        bequestindex = 0;
        setAvailableShares(100);
        setSelectedOption(null);
    };

    const handleAddItem = () => {
        let newErrors = {};

        if (!beneficiary) {
            newErrors.beneficiary = "Beneficiary is required";
        }

        if (beneficiary === backup) {
            newErrors.backup = "Beneficiary and backup can't be the same";
        }

        const sharesNum = parseFloat(shares);

        if (isNaN(sharesNum) || sharesNum <= 0 || sharesNum > availableShares) {
            newErrors.shares = `Please enter a valid number between 0 and ${availableShares}`;
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        const newItem = {
            id: bequestindex,
            beneficiary,
            backup: backup || 'N/A',
            shares: sharesNum,
            type: isOrganization ? "N/A" : type
        };

        setTable_dataBequest([...table_dataBequest, newItem]);
        setAvailableShares(availableShares - sharesNum);
        bequestindex++;

        setBeneficiary('');
        setBackup('');
        setShares('');
        setType('');
        setValidationErrors({});
        setToastMessage('Wipeout beneficiary added successfully');
        setShowToast(true);
    };

    const handleDelete = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            const updatedTableData = table_dataBequest.filter(item => item.id !== itemToDelete);
            const deletedItem = table_dataBequest.find(item => item.id === itemToDelete);

            setTable_dataBequest(updatedTableData);
            setAvailableShares(availableShares + deletedItem.shares);
            setShowDeleteModal(false);
            setToastMessage('Wipeout beneficiary removed successfully');
            setShowToast(true);
        }
    };

    return (
        <Container>
            <Form>
                <Form.Label style={{ marginBottom: "24px", fontWeight: "bold" }}>Wipeout:</Form.Label>
                <Row>
                    <Col sm={12}>
                        <Dropdown onSelect={handleCategorySelect} style={{ width: "100%", marginBottom: "10px" }}>
                            <Dropdown.Toggle
                                style={{ width: "100%" }}
                                variant={selectedCategory !== null ? "outline-success" : "outline-dark"}
                                id="category-dropdown"
                                disabled={isSpecificBeneficiary}
                            >
                                {selectedCategory !== null ? selectedCategory : 'Select Wipeout'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className={'text-center'} style={{ width: "100%" }}>
                                {options.map((option, index) => (
                                    <Dropdown.Item key={index} eventKey={option}>{option}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <Form.Check
                            type="checkbox"
                            id="specific-beneficiary-checkbox"
                            label="Specific Wipeout Beneficiary"
                            checked={isSpecificBeneficiary}
                            onChange={(e) => setIsSpecificBeneficiary(e.target.checked)}
                        />
                        <Form.Check
                            type="checkbox"
                            id="to-be-determined-checkbox"
                            label="To be determined by client"
                            checked={toBeDetermined}
                            onChange={() => setToBeDetermined(!toBeDetermined)}
                        />
                    </Col>
                </Row>
                {isSpecificBeneficiary && (
                    <>
                        <Row>
                            <Col sm={12}>
                                <Form.Check
                                    type="checkbox"
                                    id="organization-checkbox"
                                    label="Organization"
                                    checked={isOrganization}
                                    onChange={(e) => setIsOrganization(e.target.checked)}
                                />
                            </Col>
                        </Row>
                        <Form.Group className="mt-3">
                            <Form.Label>Beneficiary</Form.Label>
                            {isOrganization ? (
                                <Form.Control
                                    type="text"
                                    placeholder="Enter organization name"
                                    value={beneficiary}
                                    onChange={(e) => setBeneficiary(e.target.value)}
                                />
                            ) : (
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    label="Select a beneficiary"
                                    selected={beneficiary}
                                    onSelect={setBeneficiary}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                            )}
                            {validationErrors.beneficiary && (
                                <p className="text-danger">{validationErrors.beneficiary}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Backup</Form.Label>
                            {isOrganization ? (
                                <Form.Control
                                    type="text"
                                    placeholder="Enter backup organization name"
                                    value={backup}
                                    onChange={(e) => setBackup(e.target.value)}
                                />
                            ) : (
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    label="Select a backup"
                                    selected={backup}
                                    onSelect={setBackup}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                            )}
                            {validationErrors.backup && (
                                <p className="text-danger">{validationErrors.backup}</p>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Shares %</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter percentage"
                                value={shares}
                                onChange={(e) => setShares(e.target.value)}
                            />
                            {validationErrors.shares && (
                                <p className="text-danger">{validationErrors.shares}</p>
                            )}
                        </Form.Group>
                        {!isOrganization && (
                            <Form.Group>
                                <Form.Label>Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">Select type</option>
                                    <option value="Per Stirpes">Per Stirpes</option>
                                    <option value="Per Capita">Per Capita</option>
                                </Form.Control>
                                {validationErrors.type && (
                                    <p className="text-danger">{validationErrors.type}</p>
                                )}
                            </Form.Group>
                        )}
                        <Button
                            className="mt-3"
                            variant="outline-success"
                            onClick={handleAddItem}
                        >
                            Add Wipeout Beneficiary
                        </Button>
                    </>
                )}
                {isSpecificBeneficiary && <Table striped bordered hover responsive className="mt-3">
                    <thead>
                        <tr>
                            <th>Beneficiary</th>
                            <th>Backup</th>
                            <th>Shares %</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_dataBequest.length === 0 ? (
                            <tr>
                                <td colSpan="5">No wipeout beneficiaries added yet.</td>
                            </tr>
                        ) : (
                            table_dataBequest.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.beneficiary}</td>
                                    <td>{item.backup}</td>
                                    <td>{item.shares}</td>
                                    <td>{item.type}</td>
                                    <td>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
                }
            </Form>
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this wipeout beneficiary?"
            />
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Wipeout;
