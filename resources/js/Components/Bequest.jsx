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
    const [isSpouseFirst, setIsSpouseFirst] = useState(false);
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [isSharedBequest, setIsSharedBequest] = useState(false);
    // pendingShares represents the available shares for the current shared bequest item.
    const [pendingShares, setPendingShares] = useState(100);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [currentSharedUuid, setCurrentSharedUuid] = useState(1);
    // currentSharedBequest holds the text of the current shared bequest item in progress.
    const [currentSharedBequest, setCurrentSharedBequest] = useState('');
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    // Recalculate validation errors for the bequest text.
    useEffect(() => {
        let newErrors = {};
        const bequest = bequestText;
        if (bequest === "" && isCustomBequest) {
            newErrors.bequestItem = "Please add a custom bequest in the section above";
        }
        setValidationErrors(Object.keys(newErrors).length > 0 ? newErrors : {});
    }, [isCustomBequest, bequestText]);

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
        setIsSpouseFirst(selectedRecipient === "Spouse First");
    }, [selectedRecipient]);

    // Recalculate pendingShares for the current shared bequest item whenever the table data changes.
    useEffect(() => {
        if (currentSharedBequest.trim() !== "") {
            const allocated = table_dataBequest
                .filter(item => item.shared_uuid === currentSharedUuid)
                .reduce((acc, item) => acc + Number(item.shares), 0);
            setPendingShares(100 - allocated);
        }
    }, [table_dataBequest, currentSharedUuid, currentSharedBequest]);

    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);
        // The input value is maintained for shared bequests until the user clears or modifies it.
    };

    const addRecepient = () => {
        setValidationErrors({});
        var bequest = bequestText.trim();
        var selected = isCustomBequest ? 'NA' : selectedRecipient;
        var backup = isCustomBequest ? 'NA' : selectedBackup;
        var shares = isCustomBequest || isSpouseFirst ? 100 : sharesInput;

        // For non-shared bequests (shares >= 100), enforce duplicate validation.
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
        var obj = {
            "id": table_dataBequest.length + 1,
            "names": selected,
            "backup": backup || "NA",
            "shares": shares,
            "bequest": bequest,
            "isCustom": isCustomBequest,
            "shared_uuid": 0
        };

        if (!isCustomBequest) {
            // For shared bequests, perform validations first without resetting the dropdown selections.
            if (Number(shares) < 100) {
                let available;
                if (currentSharedBequest.trim().toLowerCase() === bequest.toLowerCase()) {
                    const allocated = table_dataBequest
                        .filter(item => item.shared_uuid === currentSharedUuid)
                        .reduce((acc, item) => acc + Number(item.shares), 0);
                    available = 100 - allocated;
                } else {
                    available = 100;
                    const newSharedUuid = currentSharedUuid + 1;
                    setCurrentSharedUuid(newSharedUuid);
                    setCurrentSharedBequest(bequest);
                    obj.shared_uuid = newSharedUuid;
                    setSharesInput('');
                }
                if (currentSharedBequest.trim().toLowerCase() === bequest.toLowerCase() && available === 0) {
                    setValidationErrors({ shares: "This bequest item has been fully allocated" });
                    return;
                }
                if (Number(shares) > available) {
                    setValidationErrors({ shares: "Only " + available + " shares are available for current bequest item" });
                    return;
                }
                if (currentSharedBequest.trim().toLowerCase() === bequest.toLowerCase()) {
                    obj.shared_uuid = currentSharedUuid;
                }
                // Update available shares after this addition.
                const newAvailable = available - Number(shares);
                setPendingShares(newAvailable);
                let newErrors = {};
                if (newAvailable > 0) {
                    newErrors.shares = "Pending shares for current bequest item: " + newAvailable;
                } else if (newAvailable === 0) {
                    newErrors.shares = "This bequest item has been fully allocated";
                    // Clear the inputs immediately when the bequest is fully allocated
                    setBequestText('');
                    setSharesInput('');
                    // Optionally, reset shared bequest state if you wish to start a new shared bequest
                    setCurrentSharedBequest('');
                    setIsSharedBequest(false);
                }
                setValidationErrors(newErrors);
                // If a validation error was set above, the function would have returned already.
            }
        }

        // At this point, validations have passed so you can now clear the dropdown selections.
        if (!isCustomBequest) {
            setSelectedRecipient(isSpouseFirst ? "Spouse First" : null);
            setSelectedBackup(null);
        }

        let shouldAddBequest = false;
        if (isCustomBequest) {
            shouldAddBequest = true;
            setReadOnly(false);
        } else if (Number(shares) >= 100) {
            var globalSemaphore = globalCounter;
            globalCounter += Number(shares);
            if (globalCounter > 100) {
                console.log("The amount of shares should be less than or equal to 100");
                globalCounter = globalSemaphore;
            } else if (globalCounter <= 100) {
                shouldAddBequest = true;
                setReadOnly(false);
                if (!open) {
                    setOpen(true);
                }
                if (globalCounter === 100) {
                    setReadOnly(false);
                    globalCounter = 0;
                }
            }
        } else {
            shouldAddBequest = true;
        }

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
        setIsSpouseFirst(eventKey === 'Spouse First');
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
                                // Make read-only when the current shared bequest is in progress and not all shares are available.
                                readOnly={isSharedBequest && pendingShares < 100}
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
                            disabled={isSharedBequest}
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
                                    extraOptions={isMarried && !isSharedBequest ? ['Spouse First'] : []}
                                    label="Select Beneficiary"
                                    selected={selectedRecipient}
                                    onSelect={handleRecepientSelect}
                                    onAddPerson={onAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                    variant={isSpouseFirst ? "outline-success" : "outline-dark"}
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
                                        readOnly={isSpouseFirst}
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
