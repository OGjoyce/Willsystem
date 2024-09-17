import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Collapse } from 'react-bootstrap';
import AddPersonDropdown from './AddPersonDropdown';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import { validate } from './Validations';

var bequestArrObj = [];
var bequestindex = 0;
var globalCounter = 0;

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas, errors }) {
    const [showExecutor, setShowExecutor] = useState(false);
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [selectedRecepient, setSelectedRecepient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [isMarried, setIsMarried] = useState(false);
    const [isSpouseFirst, setIsSpouseFirst] = useState(false);
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [isSharedBequest, setIsSharedBequest] = useState(false);
    const [pendingShares, setPendingShares] = useState(100);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [currentSharedUuid, setCurrentSharedUuid] = useState(1);
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    useEffect(() => {
        let newErrors = {};
        const bequest = bequestText;
        if (isCustomBequest) {
            // placeholder is handled in the Form.Control component
        } else {
            // placeholder is handled in the Form.Control component
        }
        if (bequest === "" && isCustomBequest) {
            newErrors.bequestItem = "Please add a custom bequest in the section above";
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
        } else {
            setValidationErrors({});
        }
    }, [isCustomBequest]);

    useEffect(() => {
        setValidationErrors(errors);

        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            setTable_dataBequest(storedValues.bequests);
            bequestArrObj = storedValues.bequests;
            bequestindex = storedValues.bequests.length > 0 ? Math.max(...storedValues.bequests.map(b => b.id)) : 0;
        }
    }, [errors]);

    useEffect(() => {
        if (selectedRecepient === "Spouse First") {
            setIsSpouseFirst(true);
        } else {
            setIsSpouseFirst(false);
        }
    }, [selectedRecepient]);

    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);

        if (isSharedBequest) {
            // Reset shared bequest logic
            setIsSharedBequest(false);
            setPendingShares(100);
            setCurrentSharedUuid(prevValue => prevValue + 1);
            globalCounter = 0;
            setReadOnly(false);
            setSharesInput(''); // Reset shares input
            // Reset any other related state variables if necessary
        }
    };

    const addRecepient = () => {
        setValidationErrors({});
        var bequest = bequestText;
        var selected = isCustomBequest ? 'NA' : selectedRecepient;
        var backup = isCustomBequest ? 'NA' : selectedBackup;
        var shares = isCustomBequest || isSpouseFirst ? 100 : sharesInput;

        if (bequest === "" || selected === null || backup === null || shares === "" || shares > 100 || shares <= 0 || selected === backup) {
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
                newErrors.shares = "Please enter a percentage value for shares";
            }
            if (shares > 100 || shares <= 0) {
                newErrors.shares = "Shares must be a percentage between 1 and 100";
            }

            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                return null;
            }
        }

        if (bequest !== "" && (isCustomBequest || (selected !== "false" && shares !== "" && shares > 0 && shares <= 100 && selected !== backup))) {
            var obj = {
                "id": bequestindex + 1,
                "names": selected,
                "backup": backup || "NA",
                "shares": shares,
                "bequest": bequest,
                "isCustom": isCustomBequest,
                "shared_uuid": 0
            };

            setBequestText('');
            if (!isCustomBequest) {
                if (isSpouseFirst) {
                    setSelectedRecepient("Spouse First");
                } else {
                    setSelectedRecepient(null);
                }
                setSelectedBackup(null);
                let newErrors = {};
                if (shares < 100) {
                    obj.shared_uuid = currentSharedUuid;
                    setIsSharedBequest(true);
                    setPendingShares(pendingShares - shares);
                    if (pendingShares - shares > 0) {
                        setSharesInput('');
                        setBequestText(bequest);
                        newErrors.sharedBequest = "Please continue distributing shares for current bequest";

                        if (Object.keys(newErrors).length > 0) {
                            setValidationErrors(newErrors);
                        }
                    } else if (pendingShares - shares <= 0) {
                        setSharesInput('');
                        setBequestText('');
                        setValidationErrors({});
                        setIsSharedBequest(false);
                        setPendingShares(100);
                        setCurrentSharedUuid(prevValue => prevValue + 1);
                    }

                } else {
                    setValidationErrors({});
                    setSharesInput('');
                    setBequestText('');
                }
            }

            let shouldAddBequest = false;

            if (isCustomBequest) {
                shouldAddBequest = true;
                setReadOnly(false);
            } else {
                var globalSemaphore = globalCounter;
                globalCounter += Number(shares);

                if (globalCounter > 100) {
                    console.log("Amount of shares should be less or equal than 100");
                    globalCounter = globalSemaphore;
                } else if (globalCounter <= 100) {
                    shouldAddBequest = true;
                    setReadOnly(false); // keep it editable
                    if (!open) {
                        setOpen(true);
                    }

                    if (globalCounter === 100) {
                        setReadOnly(false);
                        globalCounter = 0;
                    }
                }
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
                // Save to localStorage
                const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
                storedValues.bequests = updatedBequests;
                localStorage.setItem('formValues', JSON.stringify(storedValues));
            }
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
            const updatedBequests = table_dataBequest.filter(obj => obj.id !== bequestToDelete);

            setTable_dataBequest(updatedBequests);
            bequestArrObj = updatedBequests;
            bequestindex -= 1;

            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = updatedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));

            setBequestToDelete(null);
            setShowDeleteModal(false);
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
        if (eventKey === 'Spouse First') {
            setIsSpouseFirst(true);
        } else {
            setIsSpouseFirst(false);
        }
        setSelectedRecepient(eventKey);
    };

    const handleBackupSelect = (eventKey) => {
        setSelectedBackup(eventKey);
    };

    const onAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);

        // Update datas[5].relatives
        const updatedDatas = { ...datas };
        const relatives = updatedDatas[5].relatives || {};
        const len = Object.keys(relatives).length;
        relatives[len] = newPerson;
        updatedDatas[5].relatives = relatives;
        datas[5].relatives = relatives; // Update datas

        setValidationErrors({});
    };

    useEffect(() => {
        if (datas != null && firstRender) {
            let names = [];
            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives;
            const kidsq = datas[3].kidsq?.selection;

            var dataobj = { married, kids, relatives };

            var married_names = married?.firstName && married?.lastName ? married?.firstName + " " + married?.lastName : null;

            if (married_names !== null) { setIsMarried(true); }
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
                const namesRel = relatives[key]?.firstName + " " + relatives[key]?.lastName;
                names.push(namesRel);
            }

            setIdentifiersNames(names);
            setFirstRender(false);
        }
    }, [datas, firstRender]);

    return (
        <>
            <Form>
                <Form.Group className="mb-3" controlId="bequestTextArea">
                    <Form.Label style={{ fontWeight: "bold" }}>Bequest:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder={isCustomBequest ? "(e.g., Charitable Donation)" : "(i.e... Gold Chain)"}
                        value={bequestText}
                        onChange={handleTextAreaChange}
                    />
                    {validationErrors.bequestItem && <p className="mt-2 text-sm text-red-600">{validationErrors.bequestItem}</p>}
                </Form.Group>

                <Form.Check
                    className='mb-6 hidden'
                    type="checkbox"
                    id="custom-bequest-checkbox"
                    label="Custom Bequest"
                    checked={isCustomBequest}
                    onChange={(e) => setIsCustomBequest(e.target.checked)}
                    disabled={isSharedBequest ? true : false}
                    active={isSharedBequest ? true : false}
                />
                {isCustomBequest && (
                    <>
                        <Button style={{ width: "80%", margin: "5%" }} variant="outline-success" onClick={() => addRecepient()} >Add Custom Bequest</Button>
                        <Button
                            onClick={() => setOpen(!open)}
                            aria-controls="example-collapse-text"
                            aria-expanded={open}
                            style={{ width: "80%", margin: "5%" }}
                            variant="outline-dark"
                        >
                            See Bequest information
                        </Button>
                    </>
                )}
                {!isCustomBequest && (
                    <>
                        <AddPersonDropdown
                            options={identifiers_names}
                            extraOptions={isMarried && !isSharedBequest ? ['Spouse First'] : []}
                            label="Select Beneficiary"
                            selected={selectedRecepient}
                            onSelect={handleRecepientSelect}
                            onAddPerson={onAddPerson}
                            validationErrors={validationErrors}
                            setValidationErrors={setValidationErrors}
                            variant={isSpouseFirst ? "outline-success" : "outline-dark"}
                        />
                        {validationErrors.beneficiary && <p className="mt-2 text-center text-red-600">{validationErrors.beneficiary}</p>}
                        <AddPersonDropdown
                            options={identifiers_names}
                            label="Select Bequest Backup"
                            selected={selectedBackup}
                            onSelect={handleBackupSelect}
                            onAddPerson={onAddPerson}
                            validationErrors={validationErrors}
                            setValidationErrors={setValidationErrors}
                        />
                        {validationErrors.backupSameAsBeneficiary && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.backupSameAsBeneficiary}</p>}
                        <Form.Group className="mb-3 text-center mt-12" controlId="sharesID">
                            <Form.Control
                                className="text-center"
                                type="number"
                                placeholder="100"
                                value={sharesInput}
                                onChange={(e) => setSharesInput(e.target.value)}
                                readOnly={isSpouseFirst}
                            />
                            {validationErrors.shares && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.shares}</p>}
                            {validationErrors.sharedBequest && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.sharedBequest}</p>}
                            <Form.Label className="text-center">
                                <i className="bi bi-exclamation-circle text-danger mx-2"></i>
                                {isSpouseFirst
                                    ? 'If the bequest is allocated to the spouse first, they receive 100% of it.'
                                    : 'The total shares for each bequest, distributed among all recipients, must sum to 100%.'
                                }
                            </Form.Label>

                            <Button style={{ width: "80%", margin: "5%" }} variant="outline-success" onClick={() => addRecepient()} >Add Recipient</Button>
                            <Button
                                onClick={() => setOpen(!open)}
                                aria-controls="example-collapse-text"
                                aria-expanded={open}
                                style={{ width: "80%", margin: "5%" }}
                                variant="outline-dark"
                            >
                                See Bequest information
                            </Button>
                        </Form.Group>
                    </>
                )}

            </Form>


            {validationErrors.bequest && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.bequest}</p>}
            <Collapse in={open}>
                <div id="example-collapse-text">
                    <Table striped bordered hover responsive style={{ margin: "auto auto 148px auto" }}>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Beneficiary</th>
                                <th>Backup</th>
                                <th>Bequest</th>
                                <th>Shares</th>
                                <th>Custom</th>
                                <th>Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                table_dataBequest.length === 0 ? (
                                    <tr>
                                        <td className='text-center' colSpan="7">
                                            No information added yet, press "Add Recipient Button" to add.
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
                                                    />
                                                ) : (
                                                    item.shares
                                                )}
                                            </td>
                                            <td>{item.isCustom ? 'Yes' : 'No'}</td>
                                            <td>
                                                <div className='d-flex justify-content-around gap-3'>
                                                    {editingRow === index ? (
                                                        <>
                                                            <Button
                                                                className="w-[50%]"
                                                                variant="outline-success"
                                                                size="sm"
                                                                onClick={() => handleSave(index)}
                                                            >
                                                                Save
                                                            </Button>
                                                            <Button
                                                                className="w-[50%]"
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={handleCancel}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                className="w-[50%]"
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => handleDelete(item.id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                            <Button
                                                                className="w-[50%]"
                                                                variant="outline-warning"
                                                                size="sm"
                                                                onClick={() => handleEdit(index)}
                                                            >
                                                                Edit
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            }
                        </tbody>
                    </Table>
                </div>
            </Collapse>

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
        </>
    );
}

export default Bequest;
