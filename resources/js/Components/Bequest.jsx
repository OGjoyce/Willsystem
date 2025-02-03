import React, { useState, useEffect } from 'react';
import {
    Form,
    Button,
    Table,
    Collapse,
    Container,
    Row,
    Col,
} from 'react-bootstrap';
import AddPersonDropdown from './AddPersonDropdown';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import { validate } from './Validations';
import { extractData } from '@/utils/objectStatusUtils';

let bequestArrObj = [];
let bequestindex = 0;
let globalCounter = 0;

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas, errors, onAddPersonFromDropdown }) {
    const [showExecutor, setShowExecutor] = useState(false);
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [isMarried, setIsMarried] = useState(false);
    // Notice that we no longer need “isSharedBequest” since we compute the group status on the fly.
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [pendingShares, setPendingShares] = useState(100);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    // Remove currentSharedUuid and currentSharedBequest; instead, we use a counter for new shared groups:
    const [nextSharedUuid, setNextSharedUuid] = useState(1);
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    // When the bequest text or table data changes (for non‑custom items),
    // compute how many shares have already been allocated for that bequest.
    useEffect(() => {
        if (!isCustomBequest && bequestText.trim() !== "") {
            const allocated = table_dataBequest
                .filter(item =>
                    item.bequest.trim().toLowerCase() === bequestText.trim().toLowerCase() &&
                    item.shared_uuid !== 0
                )
                .reduce((acc, item) => acc + Number(item.shares), 0);
            setPendingShares(100 - allocated);
        } else {
            setPendingShares(100);
        }
    }, [bequestText, table_dataBequest, isCustomBequest]);

    // When bequest text is used for adding a new non-custom (shared) bequest,
    // keep the text input read‑only if some shares have already been allocated.
    // (This prevents changing the bequest name once allocations have begun.)
    // For custom bequests the text should remain editable.
    // Note: if pendingShares < 100 it means there is already an active group.
    // (When pendingShares equals 100, no group exists yet.)
    // You could also compute this from the table data if preferred.
    const bequestInputReadOnly = !isCustomBequest && pendingShares < 100;

    useEffect(() => {
        setValidationErrors(errors);
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            setTable_dataBequest(storedValues.bequests);
            bequestArrObj = storedValues.bequests;
            bequestindex =
                storedValues.bequests.length > 0
                    ? Math.max(...storedValues.bequests.map(b => b.id))
                    : 0;
        }
    }, [errors]);

    useEffect(() => {
        setIsMarried(!!(datas[2]?.married?.firstName || datas[2]?.married?.lastName));
    }, [datas]);

    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);
    };

    const addRecepient = () => {
        setValidationErrors({});
        const bequest = bequestText.trim();
        // For non‑custom bequests, the beneficiary and backup come from dropdown selections.
        const selected = isCustomBequest ? 'NA' : selectedRecipient;
        const backup = isCustomBequest ? 'NA' : selectedBackup;
        // For non‑custom (shared) items, shares come from the input; for custom or spouse-first, use 100.
        const shares = isCustomBequest || selected === "Spouse First" ? 100 : sharesInput;

        // Duplicate check for bequests that are fully allocated
        if (Number(shares) >= 100) {
            const isDuplicateBequest = table_dataBequest.some(
                item => item.bequest.toLowerCase() === bequest.toLowerCase()
            );
            if (isDuplicateBequest) {
                setValidationErrors(prevErrors => ({
                    ...prevErrors,
                    bequestItem: "All shares for this bequest have already been fully allocated"
                }));
                return;
            }
        }

        // Basic validations
        if (
            bequest === "" ||
            selected === null ||
            backup === null ||
            shares === "" ||
            Number(shares) > 100 ||
            Number(shares) <= 0 ||
            (selected !== "Spouse First" && selected === backup)
        ) {
            let newErrors = {};
            if (selected === null) {
                newErrors.beneficiary = "Beneficiary selection is required";
            }
            if (bequest === "") {
                newErrors.bequestItem = "Please add a bequest in the section above";
            }
            if (!isCustomBequest && selected !== null && backup !== null && selected === backup) {
                newErrors.backupSameAsBeneficiary = "Beneficiary and Backup can't be the same person";
            }
            if (shares === "") {
                newErrors.shares = "Please enter a value for shares";
            }
            if (Number(shares) > 100 || Number(shares) <= 0) {
                newErrors.shares = "Shares must be a value between 1 and 100";
            }
            setValidationErrors(newErrors);
            return;
        }

        // Prepare the new bequest object
        const obj = {
            "id": table_dataBequest.length + 1,
            "names": selected,
            "backup": backup || "NA",
            "shares": shares,
            "bequest": bequest,
            "isCustom": isCustomBequest,
            // For custom bequests, shared_uuid remains 0.
            "shared_uuid": 0
        };

        // For non‑custom (shared) bequests, we want to group allocations by bequest name.
        if (!isCustomBequest) {
            const bequestName = bequest;
            // Look for any existing items in the table that share this bequest name (ignoring case)
            const existingGroupItems = table_dataBequest.filter(
                item =>
                    item.bequest.trim().toLowerCase() === bequestName.toLowerCase() &&
                    item.shared_uuid !== 0
            );
            let groupSharedUuid;
            let available = 100;
            if (existingGroupItems.length > 0) {
                // Use the same shared uuid as the existing group.
                groupSharedUuid = existingGroupItems[0].shared_uuid;
                const allocated = existingGroupItems.reduce((acc, item) => acc + Number(item.shares), 0);
                available = 100 - allocated;
            } else {
                // No group exists yet for this bequest name; create a new group.
                groupSharedUuid = nextSharedUuid;
                setNextSharedUuid(nextSharedUuid + 1);
            }
            // Validate that enough shares are available
            if (available === 0) {
                setValidationErrors({ shares: "This bequest item has been fully allocated" });
                return;
            }
            if (Number(shares) > available) {
                setValidationErrors({ shares: "Only " + available + " shares are available for current bequest item" });
                return;
            }
            // Assign the group identifier to this item.
            obj.shared_uuid = groupSharedUuid;
            // Update the pending shares for this group (so that if the user wants to add more allocations,
            // they will see the remaining shares available).
            const newAvailable = available - Number(shares);
            setPendingShares(newAvailable);
            let newErrors = {};
            if (newAvailable > 0) {
                newErrors.shares = "Pending shares for current bequest item: " + newAvailable;
            } else if (newAvailable === 0) {
                newErrors.shares = "This bequest item has been fully allocated";
                // Clear the inputs when the group is complete
                setBequestText('');
                setSharesInput('');
            }
            setValidationErrors(newErrors);
        }

        // For custom bequests, we simply allow the addition.
        // (In that case the bequest text remains editable.)
        let shouldAddBequest = true;

        if (shouldAddBequest) {
            const updatedBequests = [...table_dataBequest, obj];
            setTable_dataBequest(updatedBequests);
            bequestArrObj = updatedBequests;
            bequestindex += 1;
            setToastMessage(isCustomBequest ? 'Custom bequest added successfully' : 'Bequest added successfully');
            setTimeout(() => {
                setToastMessage('');
            }, 4000);
            setShowToast(true);
            // Save the updated list to localStorage.
            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = updatedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));
        }
    };

    const handleDelete = (itemId) => {
        setBequestToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setToastMessage('Bequest removed successfully');
        setTimeout(() => {
            setToastMessage('');
        }, 4000);
        setShowToast(true);
        if (bequestToDelete !== null) {
            setShowDeleteModal(false);
            const updatedBequests = table_dataBequest.filter(obj => obj.id !== bequestToDelete);
            setTable_dataBequest(updatedBequests);
            bequestArrObj = updatedBequests;
            bequestindex -= 1;
            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = updatedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));
            setBequestToDelete(null);
        }
    };

    const handleEdit = (index) => {
        setTempData(table_dataBequest[index]);
        setEditingRow(index);
    };

    const handleSave = (index) => {
        const updatedBequests = [...table_dataBequest];
        setTable_dataBequest(updatedBequests);
        bequestArrObj = updatedBequests;
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = updatedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));
        setToastMessage('Bequest updated successfully');
        setTimeout(() => {
            setToastMessage('');
        }, 4000);
        setShowToast(true);
        setEditingRow(null);
        setTempData({});
    };

    const handleDropdownSelect = (index, key, value) => {
        if (editingRow === index) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[index] = { ...updatedBequests[index], [key]: value };
            setTable_dataBequest(updatedBequests);
        }
    };

    const handleCancel = () => {
        if (editingRow !== null) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[editingRow] = tempData;
            setTable_dataBequest(updatedBequests);
        }
        setEditingRow(null);
        setTempData({});
    };

    const handleRecepientSelect = (eventKey) => {
        setSelectedRecipient(eventKey);
    };

    const handleBackupSelect = (eventKey) => {
        setSelectedBackup(eventKey);
    };

    const onAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);
        // Update datas[5].relatives.
        const updatedDatas = { ...datas };
        const relatives = updatedDatas[5].relatives || [];
        const len = Object.keys(relatives).length;
        if (!datas[5].relatives) {
            datas[5].relatives = [];
        }
        relatives[len] = newPerson;
        updatedDatas[5].relatives = relatives;
        datas[5].relatives = relatives; // Update datas.
        onAddPersonFromDropdown([newPerson]);
        setValidationErrors({});
    };

    useEffect(() => {
        if (datas) {
            // Extract the `bequests` object and convert it to an array.
            const rawBequests = extractData(datas, 'bequests', null, []);
            const bequestsArray = Object.keys(rawBequests)
                .filter(key => !isNaN(key))
                .map(key => rawBequests[key]);
            setTable_dataBequest(bequestsArray);
            bequestArrObj = bequestsArray;
            bequestindex =
                bequestsArray.length > 0 ? Math.max(...bequestsArray.map(b => b.id)) : 0;
            if (bequestArrObj.length > 0) {
                setOpen(true);
            }
        }
    }, [datas]);

    useEffect(() => {
        if (datas != null && firstRender) {
            let names = [];
            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives;
            const kidsq = datas[3]?.kidsq?.selection;
            var married_names =
                married?.firstName || married?.lastName
                    ? married?.firstName + " " + married?.lastName
                    : null;
            if (married_names !== null) {
                setIsMarried(true);
            }
            if (kidsq === "true") {
                for (let child in kids) {
                    const childName = kids[child]?.firstName + " " + kids[child]?.lastName;
                    names.push(childName);
                }
            }
            if (married_names) {
                names.push(married_names);
            }
            for (let key in relatives) {
                const namesRel =
                    relatives[key]?.firstName + " " + relatives[key]?.lastName;
                names.push(namesRel);
            }
            setIdentifiersNames(names);
            setFirstRender(false);
        }
    }, [datas, firstRender]);

    return (
        <Container className="py-4">
            <Form>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="bequestTextArea">
                            <Form.Label className="font-weight-bold">Bequest:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={isCustomBequest ? "(e.g., Charitable Donation)" : "(e.g., Gold Chain)"}
                                value={bequestText}
                                onChange={handleTextAreaChange}
                                // Use our computed flag so that if a shared group already exists and is incomplete,
                                // the bequest text remains read-only.
                                readOnly={bequestInputReadOnly}
                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.bequestItem && (
                                <Form.Text className="text-danger">{validationErrors.bequestItem}</Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3 d-none">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="custom-bequest-checkbox"
                            label="Custom Bequest"
                            checked={isCustomBequest}
                            onChange={(e) => setIsCustomBequest(e.target.checked)}
                            disabled={/* disable if working on a shared group */ !isCustomBequest && pendingShares < 100}
                            className="text-lg"
                        />
                    </Col>
                </Row>

                {isCustomBequest && (
                    <>
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    style={{ width: "80%", margin: "5%" }}
                                    variant="outline-success"
                                    onClick={addRecepient}
                                >
                                    Add Custom Bequest
                                </Button>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col>
                                <Button
                                    onClick={() => setOpen(!open)}
                                    aria-controls="bequest-info"
                                    aria-expanded={open}
                                    style={{ width: "80%", margin: "5%" }}
                                    variant="outline-dark"
                                >
                                    {open ? 'Hide Bequest Information' : 'See Bequest Information'}
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}

                {!isCustomBequest && (
                    <>
                        <Row className="mt-4">
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    extraOptions={isMarried ? ['Spouse First'] : []}
                                    label="Select Beneficiary"
                                    selected={selectedRecipient}
                                    onSelect={handleRecepientSelect}
                                    onAddPerson={onAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                    variant={selectedRecipient === "Spouse First" ? "outline-success" : "outline-dark"}
                                />
                                {validationErrors.beneficiary && (
                                    <Form.Text className="text-danger">{validationErrors.beneficiary}</Form.Text>
                                )}
                            </Col>
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiers_names}
                                    label="Select Bequest Backup"
                                    selected={selectedBackup}
                                    onSelect={handleBackupSelect}
                                    onAddPerson={onAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                                {validationErrors.backupSameAsBeneficiary && (
                                    <Form.Text className="text-danger">{validationErrors.backupSameAsBeneficiary}</Form.Text>
                                )}
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col md={6}>
                                <Form.Group controlId="sharesID">
                                    <Form.Label>Number of Shares</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="100"
                                        value={sharesInput}
                                        onChange={(e) => setSharesInput(e.target.value)}
                                        readOnly={selectedRecipient === "Spouse First"}
                                        className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                    {validationErrors.shares && (
                                        <Form.Text className="text-danger">{validationErrors.shares}</Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Text className="text-muted">
                                    The bequest item will be divided based on total shares and distributed among all recipients.
                                </Form.Text>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col className="d-flex justify-content-between">
                                <Button variant="outline-success" onClick={addRecepient}>
                                    Save
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={() => setOpen(!open)}
                                    aria-controls="bequest-info"
                                    aria-expanded={open}
                                >
                                    {open ? 'Hide Bequest Information' : 'See Bequest Information'}
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}

                {validationErrors.bequest && (
                    <Row className="mt-3">
                        <Col>
                            <Form.Text className="text-danger">{validationErrors.bequest}</Form.Text>
                        </Col>
                    </Row>
                )}

                <Row className="mt-4">
                    <Col>
                        <Collapse in={open}>
                            <div id="bequest-info">
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Beneficiary</th>
                                            <th>Backup</th>
                                            <th>Bequest</th>
                                            <th>Shares</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table_dataBequest.length === 0 ? (
                                            <tr>
                                                <td className='text-center' colSpan="7">
                                                    No information added yet. Press "Add Recipient" to add.
                                                </td>
                                            </tr>
                                        ) : (
                                            table_dataBequest.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <AddPersonDropdown
                                                                options={identifiers_names}
                                                                label="Select Beneficiary"
                                                                selected={item.names}
                                                                onSelect={(value) => handleDropdownSelect(index, 'names', value)}
                                                                onAddPerson={onAddPerson}
                                                                validationErrors={validationErrors}
                                                                setValidationErrors={setValidationErrors}
                                                            />
                                                        ) : (
                                                            item.names
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <AddPersonDropdown
                                                                options={identifiers_names}
                                                                label="Select Backup"
                                                                selected={item.backup}
                                                                onSelect={(value) => handleDropdownSelect(index, 'backup', value)}
                                                                onAddPerson={onAddPerson}
                                                                validationErrors={validationErrors}
                                                                setValidationErrors={setValidationErrors}
                                                            />
                                                        ) : (
                                                            item.backup
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={1}
                                                                value={item.bequest}
                                                                onChange={(e) => handleDropdownSelect(index, 'bequest', e.target.value)}
                                                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            item.bequest
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <Form.Control
                                                                type="number"
                                                                value={item.shares}
                                                                onChange={(e) => handleDropdownSelect(index, 'shares', e.target.value)}
                                                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            item.shares
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            {editingRow === index ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline-success"
                                                                        onClick={() => handleSave(index)}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        onClick={handleCancel}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        onClick={() => handleDelete(item.id)}
                                                                    >
                                                                        <i className="bi bi-trash3"></i>  Delete
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        onClick={() => handleEdit(index)}
                                                                    >
                                                                        <i className="bi bi-pencil"></i>  Edit
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
