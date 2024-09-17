import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Table,
    Collapse,
    Container,
    Row,
    Col,
    Alert,
} from 'react-bootstrap';
import AddPersonDropdown from './AddPersonDropdown';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';

let bequestArrObj = [];
let bequestIndex = 0;

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas, errors }) {
    const [showExecutor, setShowExecutor] = useState(false);
    const [open, setOpen] = useState(false);
    const [tableDataBequest, setTableDataBequest] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [isMarried, setIsMarried] = useState(false);
    const [isSpouseFirst, setIsSpouseFirst] = useState(false);
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [isSharedBequest, setIsSharedBequest] = useState(false);
    const [pendingShares, setPendingShares] = useState(100);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [currentSharedUuid, setCurrentSharedUuid] = useState(1);
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    useEffect(() => {
        let newErrors = {};
        if (isCustomBequest && bequestText === '') {
            newErrors.bequestItem = "Please add a custom bequest in the section above";
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
        } else {
            setValidationErrors({});
        }
    }, [isCustomBequest, bequestText]);

    useEffect(() => {
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            setTableDataBequest(storedValues.bequests);
            bequestArrObj = storedValues.bequests;
            bequestIndex = storedValues.bequests.length > 0 ? Math.max(...storedValues.bequests.map(b => b.id)) : 0;
        }
    }, []);

    useEffect(() => {
        if (selectedRecipient === "Spouse First") {
            setIsSpouseFirst(true);
        } else {
            setIsSpouseFirst(false);
        }
    }, [selectedRecipient]);

    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);

        if (isSharedBequest) {
            setIsSharedBequest(false);
            setPendingShares(100);
            setCurrentSharedUuid(prevValue => prevValue + 1);
            setReadOnly(false);
            setSharesInput('');
        }
    };

    const addRecipient = () => {
        let newErrors = {};

        if (!isCustomBequest) {
            if (selectedRecipient === null) {
                newErrors.beneficiary = "Beneficiary selection is required";
            }
            if (sharesInput === '' || sharesInput > 100 || sharesInput <= 0) {
                newErrors.shares = "Shares must be a percentage between 1 and 100";
            }
            if (selectedRecipient === selectedBackup) {
                newErrors.backupSameAsBeneficiary = "Beneficiary and Backup can't be the same person";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        const newBequest = {
            id: bequestIndex + 1,
            names: isCustomBequest ? 'NA' : selectedRecipient,
            backup: isCustomBequest ? 'NA' : selectedBackup,
            shares: isCustomBequest || isSpouseFirst ? 100 : sharesInput,
            bequest: bequestText,
            isCustom: isCustomBequest,
            shared_uuid: 0
        };

        setTableDataBequest([...tableDataBequest, newBequest]);
        bequestArrObj.push(newBequest);
        setBequestText('');
        setSelectedRecipient(null);
        setSelectedBackup(null);
        setSharesInput('');
        setToastMessage('Bequest added successfully');
        setShowToast(true);

        localStorage.setItem('formValues', JSON.stringify({ ...JSON.parse(localStorage.getItem('formValues') || '{}'), bequests: [...tableDataBequest, newBequest] }));
    };

    const handleDelete = (itemId) => {
        setBequestToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        const updatedBequests = tableDataBequest.filter(obj => obj.id !== bequestToDelete);
        setTableDataBequest(updatedBequests);
        bequestArrObj = updatedBequests;
        setBequestIndex(bequestIndex - 1);
        localStorage.setItem('formValues', JSON.stringify({ ...JSON.parse(localStorage.getItem('formValues') || '{}'), bequests: updatedBequests }));
        setShowDeleteModal(false);
        setToastMessage('Bequest removed successfully');
        setShowToast(true);
    };

    return (
        <Container className="py-4">
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="bequestTextArea">
                            <Form.Label className="font-weight-bold text-lg">Bequest</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={isCustomBequest ? '(e.g., Charitable Donation)' : '(e.g., Gold Chain)'}
                                value={bequestText}
                                onChange={handleTextAreaChange}
                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.bequestItem && (
                                <Form.Text className="text-red-500">{validationErrors.bequestItem}</Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3 hidden">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="custom-bequest-checkbox"
                            label="Custom Bequest"
                            checked={isCustomBequest}
                            onChange={(e) => setIsCustomBequest(e.target.checked)}
                            disabled={isSharedBequest}
                            className="text-lg"
                        />
                    </Col>
                </Row>

                {!isCustomBequest && (
                    <>
                        <Row className="mt-4">
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiersNames}
                                    extraOptions={isMarried && !isSharedBequest ? ['Spouse First'] : []}
                                    label="Select Beneficiary"
                                    selected={selectedRecipient}
                                    onSelect={setSelectedRecipient}
                                    validationErrors={validationErrors}
                                    variant={isSpouseFirst ? 'outline-success' : 'outline-dark'}
                                />
                                {validationErrors.beneficiary && (
                                    <Form.Text className="text-red-500">{validationErrors.beneficiary}</Form.Text>
                                )}
                            </Col>
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiersNames}
                                    label="Select Backup"
                                    selected={selectedBackup}
                                    onSelect={setSelectedBackup}
                                    validationErrors={validationErrors}
                                />
                                {validationErrors.backupSameAsBeneficiary && (
                                    <Form.Text className="text-red-500">{validationErrors.backupSameAsBeneficiary}</Form.Text>
                                )}
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col md={6}>
                                <Form.Group controlId="sharesID">
                                    <Form.Label>Percentage of Shares (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="100"
                                        value={sharesInput}
                                        onChange={(e) => setSharesInput(e.target.value)}
                                        readOnly={isSpouseFirst}
                                        className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                    {validationErrors.shares && (
                                        <Form.Text className="text-red-500">{validationErrors.shares}</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Text className="text-muted">
                                    The total shares for each bequest, distributed among all recipients, must sum to 100%.
                                </Form.Text>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col className="d-flex justify-content-between">
                                <Button variant="outline-success" onClick={addRecipient}>Add Recipient</Button>
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setOpen(!open)}
                                    aria-controls="bequest-table"
                                    aria-expanded={open}
                                >
                                    {open ? 'Hide Bequest Information' : 'Show Bequest Information'}
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}

                <Row className="mt-4">
                    <Col>
                        <Collapse in={open}>
                            <div id="bequest-table">
                                <Table striped bordered hover responsive>
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th>ID</th>
                                            <th>Beneficiary</th>
                                            <th>Backup</th>
                                            <th>Bequest</th>
                                            <th>Shares</th>
                                            <th>Custom</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableDataBequest.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center text-gray-500">
                                                    No information added yet. Press "Add Recipient" to add.
                                                </td>
                                            </tr>
                                        ) : (
                                            tableDataBequest.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.id}</td>
                                                    <td>{item.names}</td>
                                                    <td>{item.backup}</td>
                                                    <td>{item.bequest}</td>
                                                    <td>{item.shares}</td>
                                                    <td>{item.isCustom ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        <div className="d-flex justify-content-around gap-2">
                                                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Collapse>
                    </Col>
                </Row>
            </Form>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this bequest?"
            />
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Bequest;
