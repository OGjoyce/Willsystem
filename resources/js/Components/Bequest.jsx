import React, { useState, useEffect, useRef } from 'react';
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
import { extractData } from '@/utils/objectStatusUtils';

// Global variable to maintain the array of bequests (for external use)
let bequestArrObj = [];

export function getBequestArrObj() {
    return bequestArrObj;
}

/**
 * Helper function: regroupBequests
 *
 * This function takes an array of bequest items and:
 * 1. Computes a normalized version of the bequest text (trimmed and lower-cased).
 * 2. Groups items by that text and assigns a group ID (shared_uuid) to each.
 * 3. Updates the isShared flag: if more than one item share the same bequest text, mark them as shared.
 * 4. Returns the list sorted by group id (to keep grouped items together) and then by the item’s id.
 */
const regroupBequests = (items) => {
    const groupMap = {}; // key: normalized bequest text, value: group id
    let nextGroupId = 1;

    // Assign group IDs based on normalized bequest text.
    items.forEach(item => {
        const key = item.bequest.trim().toLowerCase();
        if (key !== "") {
            if (!groupMap[key]) {
                groupMap[key] = nextGroupId;
                nextGroupId++;
            }
            item.shared_uuid = groupMap[key];
        } else {
            // In case the bequest text is empty
            item.shared_uuid = 0;
        }
    });

    // Update the isShared flag: if more than one item has the same group, mark them as shared.
    const groupCounts = {};
    items.forEach(item => {
        groupCounts[item.shared_uuid] = (groupCounts[item.shared_uuid] || 0) + 1;
    });
    items.forEach(item => {
        item.isShared = groupCounts[item.shared_uuid] > 1;
    });

    // Sort the items: first by the group ID so that similar items appear together,
    // then by the unique id (preserving insertion order within the group).
    const sortedItems = [...items].sort((a, b) => {
        if (a.shared_uuid !== b.shared_uuid) {
            return a.shared_uuid - b.shared_uuid;
        }
        return a.id - b.id;
    });

    return sortedItems;
};

function Bequest({ id, datas, errors, onAddPersonFromDropdown }) {
    // Local state declarations
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [table_dataBequest, setTableDataBequest] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [isMarried, setIsMarried] = useState(false);
    // Although we still have a "Shared Bequest" checkbox to affect UI behavior
    // (like making the textarea read-only), the grouping is now handled automatically.
    const [isSharedBequest, setIsSharedBequest] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    // Removed nextSharedUuid state variable—group IDs will be computed by regroupBequests.
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    // useRef to generate unique IDs independent of the array length
    const bequestIdRef = useRef(0);

    // When in Shared Bequest mode the textarea is read-only.
    const bequestInputReadOnly = isSharedBequest;

    // Initialize errors and any stored data from localStorage.
    useEffect(() => {
        setValidationErrors(errors || {});
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            // Regroup bequests to ensure consistent shared_uuid assignments.
            const regrouped = regroupBequests(storedValues.bequests);
            setTableDataBequest(regrouped);
            bequestArrObj = regrouped;
            const maxId = storedValues.bequests.length > 0
                ? Math.max(...storedValues.bequests.map(b => b.id))
                : 0;
            bequestIdRef.current = maxId;
        }
    }, [errors]);

    // Update marital status based on datas.
    useEffect(() => {
        setIsMarried(!!(datas[2]?.married?.firstName || datas[2]?.married?.lastName));
    }, [datas]);

    // Handle changes in the bequest textarea.
    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);
    };

    /**
     * addRecepient
     *
     * This function now creates a new bequest item (with a placeholder shared_uuid)
     * and then calls regroupBequests to automatically assign group IDs. This ensures:
     * - Every new item gets a shared ID.
     * - If the bequest text is repeated (or later another duplicate is added),
     *   all items with the same text share the same shared_uuid.
     * - The table is re-sorted immediately.
     */
    const addRecepient = () => {
        setValidationErrors({});
        const bequest = bequestText.trim();
        const selected = selectedRecipient;
        const backup = selectedBackup;
        const shares = sharesInput;

        // Basic validations for required fields and a positive number for shares.
        if (
            bequest === "" ||
            selected === null ||
            backup === null ||
            shares === "" ||
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
            if (selected !== null && backup !== null && selected === backup) {
                newErrors.backupSameAsBeneficiary = "Beneficiary and Backup can't be the same person";
            }
            if (shares === "") {
                newErrors.shares = "Please enter a value for shares";
            }
            if (Number(shares) <= 0) {
                newErrors.shares = "Shares must be a value greater than 0";
            }
            setValidationErrors(newErrors);
            return;
        }

        // Increase the unique ID counter.
        bequestIdRef.current += 1;

        // Create the new bequest item.
        // Notice that we set shared_uuid to 0 for now.
        // After adding, we call regroupBequests to (re)assign proper shared_uuid values.
        const newBequest = {
            id: bequestIdRef.current,
            names: selected,
            backup: backup || "NA",
            shares: shares,
            bequest: bequest,
            // Use the current checkbox value (which may affect UI) but grouping is recalculated
            isShared: isSharedBequest,
            shared_uuid: 0
        };

        // Add the new item and regroup the entire list.
        const updatedBequests = [...table_dataBequest, newBequest];
        const regroupedBequests = regroupBequests(updatedBequests);
        setTableDataBequest(regroupedBequests);
        bequestArrObj = regroupedBequests;

        // Clear the beneficiary and backup selections.
        setSelectedRecipient(null);
        setSelectedBackup(null);
        // In non‑shared mode, also clear the bequest text.
        if (!isSharedBequest) {
            setBequestText('');
        }
        setSharesInput('');

        setToastMessage(
            isSharedBequest
                ? 'Shared bequest added successfully'
                : 'Bequest added successfully'
        );
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);

        // Save the updated list to localStorage.
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = regroupedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));
    };

    // Delete handling: after deletion, regroup the bequests.
    const handleDelete = (itemId) => {
        setBequestToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setToastMessage('Bequest removed successfully');
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);
        if (bequestToDelete !== null) {
            setShowDeleteModal(false);
            const updatedBequests = table_dataBequest.filter(obj => obj.id !== bequestToDelete);
            const regroupedBequests = regroupBequests(updatedBequests);
            setTableDataBequest(regroupedBequests);
            bequestArrObj = regroupedBequests;
            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = regroupedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));
            setBequestToDelete(null);
        }
    };

    // Editing logic.
    const handleEdit = (index) => {
        setTempData({ ...table_dataBequest[index] });
        setEditingRow(index);
    };

    /**
     * When saving an edit, we reassign the group IDs in case the bequest text changed.
     */
    const handleSave = (index) => {
        const updatedBequests = [...table_dataBequest];
        const regroupedBequests = regroupBequests(updatedBequests);
        setTableDataBequest(regroupedBequests);
        bequestArrObj = regroupedBequests;
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = regroupedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));
        setToastMessage('Bequest updated successfully');
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);
        setEditingRow(null);
        setTempData({});
    };

    const handleDropdownSelect = (index, key, value) => {
        if (editingRow === index) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[index] = { ...updatedBequests[index], [key]: value };
            setTableDataBequest(updatedBequests);
        }
    };

    const handleCancel = () => {
        if (editingRow !== null) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[editingRow] = tempData;
            setTableDataBequest(updatedBequests);
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

    // Add a new person (e.g., from the dropdown).
    const onAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);
        const updatedDatas = { ...datas };
        if (!updatedDatas[5]) {
            updatedDatas[5] = { relatives: [] };
        }
        const relatives = updatedDatas[5].relatives || [];
        relatives.push(newPerson);
        updatedDatas[5].relatives = relatives;
        onAddPersonFromDropdown([newPerson]);
        setValidationErrors({});
    };

    // Load bequests from datas if they exist.
    useEffect(() => {
        if (datas) {
            const rawBequests = extractData(datas, 'bequests', null, []);
            const bequestsArray = Object.keys(rawBequests)
                .filter(key => !isNaN(key))
                .map(key => rawBequests[key]);
            const regroupedBequests = regroupBequests(bequestsArray);
            setTableDataBequest(regroupedBequests);
            bequestArrObj = regroupedBequests;
            const maxId = bequestsArray.length > 0
                ? Math.max(...bequestsArray.map(b => b.id))
                : 0;
            bequestIdRef.current = maxId;
            if (bequestArrObj.length > 0) {
                setOpen(true);
            }
        }
    }, [datas]);

    // Initialize the list of names (identifiers) from datas on first render.
    useEffect(() => {
        if (datas && firstRender) {
            let names = [];
            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives || [];
            const kidsq = datas[3]?.kidsq?.selection;
            const married_names = (married?.firstName || married?.lastName)
                ? `${married.firstName || ''} ${married.lastName || ''}`.trim()
                : null;
            if (married_names) {
                setIsMarried(true);
            }
            if (kidsq === "true" && kids) {
                kids.forEach(child => {
                    const childName = `${child.firstName} ${child.lastName}`;
                    names.push(childName);
                });
            }
            if (married_names) {
                names.push(married_names);
            }
            relatives.forEach(relative => {
                const relName = `${relative.firstName} ${relative.lastName}`;
                names.push(relName);
            });
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
                                placeholder={isSharedBequest ? "(Shared bequest – selection only)" : "(Enter bequest item)"}
                                value={bequestText}
                                onChange={handleTextAreaChange}
                                readOnly={bequestInputReadOnly}
                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.bequestItem && (
                                <Form.Text className="text-danger">
                                    {validationErrors.bequestItem}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                {/* Checkbox for "Shared Bequest" */}
                <Row className="mt-2">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="shared-bequest-checkbox"
                            label="Shared Bequest"
                            checked={isSharedBequest}
                            onChange={(e) => setIsSharedBequest(e.target.checked)}
                            className="text-lg"
                        />
                    </Col>
                </Row>

                {/* Beneficiary and Backup selection, and shares input */}
                <Row className="mt-4">
                    <Col md={6}>
                        <AddPersonDropdown
                            options={identifiersNames}
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
                            <Form.Text className="text-danger">
                                {validationErrors.beneficiary}
                            </Form.Text>
                        )}
                    </Col>
                    <Col md={6}>
                        <AddPersonDropdown
                            options={identifiersNames}
                            label="Select Bequest Backup"
                            selected={selectedBackup}
                            onSelect={handleBackupSelect}
                            onAddPerson={onAddPerson}
                            validationErrors={validationErrors}
                            setValidationErrors={setValidationErrors}
                        />
                        {validationErrors.backupSameAsBeneficiary && (
                            <Form.Text className="text-danger">
                                {validationErrors.backupSameAsBeneficiary}
                            </Form.Text>
                        )}
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col md={6}>
                        <Form.Group controlId="sharesID">
                            <Form.Label>Number of Shares</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter number of shares"
                                value={sharesInput}
                                onChange={(e) => setSharesInput(e.target.value)}
                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.shares && (
                                <Form.Text className="text-danger">
                                    {validationErrors.shares}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                    <Col md={6} className="d-flex align-items-center">
                        <Form.Text className="text-muted">
                            You can assign as many shares as you want.
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

                {validationErrors.bequest && (
                    <Row className="mt-3">
                        <Col>
                            <Form.Text className="text-danger">
                                {validationErrors.bequest}
                            </Form.Text>
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
                                                <td className="text-center" colSpan="7">
                                                    No information added yet. Press "Save" to add.
                                                </td>
                                            </tr>
                                        ) : (
                                            table_dataBequest.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <AddPersonDropdown
                                                                options={identifiersNames}
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
                                                                options={identifiersNames}
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
                                                                readOnly={item.isShared}
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
                                                                    <Button variant="outline-success" onClick={() => handleSave(index)}>
                                                                        Save
                                                                    </Button>
                                                                    <Button variant="outline-secondary" onClick={handleCancel}>
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outline-danger" onClick={() => handleDelete(item.id)}>
                                                                        <i className="bi bi-trash3"></i> Delete
                                                                    </Button>
                                                                    <Button variant="outline-warning" onClick={() => handleEdit(index)}>
                                                                        <i className="bi bi-pencil"></i> Edit
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
