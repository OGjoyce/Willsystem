import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';
import { validate } from './Validations';

var all_data = [];
var identifiers_names = [];
var bequestArrObj = [];
var bequestindex = 0;
var globalCounter = 0;

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas, errors }) {
    const [show, setShow] = useState(false);
    const [showExecutor, setShowExecutor] = useState(false);
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [selectedRecepient, setSelectedRecepient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [isMarried, setIsMarried] = useState(false)
    const [isSpouseFirst, setIsSpouseFirst] = useState(false);
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [isSharedBequest, setIsSharedBequest] = useState(false);
    const [pendingShares, setPendingShares] = useState(100);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("")
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null); // Estado para manejar la fila en edición
    const [currentSharedUuid, setCurrentSharedUuid] = useState(1);
    const [tempData, setTempData] = useState({});


    useEffect(() => {
        let newErrors = {}
        const bequest = document.getElementById('bequestTextArea').value
        if (isCustomBequest) {
            document.getElementById('bequestTextArea').placeholder = "(e.g., Charitable Donation)"
        } else {
            document.getElementById('bequestTextArea').placeholder = "(i.e... Gold Chain)"
        }
        if (bequest === "" && isCustomBequest) {
            newErrors.bequestItem = "Please add a custom bequest in the section above";
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors)
        } else {
            setValidationErrors({})
        }
    }, [isCustomBequest])

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

    const reviewBequestSum = (index) => {
        var counter = 0;
        var obj = table_dataBequest[index];
    };

    const addRecepient = () => {
        setValidationErrors({});
        var bequest, selected, backup, shares;
        bequest = document.getElementById('bequestTextArea').value;
        selected = isCustomBequest ? 'NA' : selectedRecepient;
        backup = isCustomBequest ? 'NA' : selectedBackup;
        shares = isCustomBequest || isSpouseFirst ? 100 : document.getElementById('sharesID').value;

        if (bequest === "" || selected === null || backup === null || shares === "" || shares > 100 || shares <= 0 || selected === backup) {
            let newErrors = {};

            if (backup === null) {
                newErrors.backup = "Backup selection is required";
            }
            if (selected === null) {
                newErrors.beneficiary = "Beneficiary selection is required";
            }
            if (selected === null && backup === null) {
                delete newErrors.beneficiary
                delete newErrors.backup
                newErrors.beneficiaryAndBackup = "Beneficiary and Backup are required";
            }
            if (bequest === "") {
                newErrors.bequestItem = "Please add a bequest in the section above";
            }

            if (!isCustomBequest && selected !== null && backup !== null && selected === backup) {
                newErrors.backupSameAsBeneficiary = "Beneficiary and Backup can´t be the same person"
            }

            if (shares === "") {
                newErrors.shares = "Please enter a percentage value for shares"
            }
            if (shares > 100 || shares <= 0) {
                newErrors.shares = "Shares must be a percentage between 1 and 100"
            }

            if (Object.keys(newErrors).length > 0) {
                setValidationErrors(newErrors);
                return null
            }
        }

        if (bequest !== "" && (isCustomBequest || (selected !== "false" && shares !== "" && shares > 0 && shares <= 100 && selected !== backup))) {
            var obj = {
                "id": bequestindex + 1,
                "names": selected,
                "backup": backup,
                "shares": shares,
                "bequest": bequest,
                "isCustom": isCustomBequest,
                "shared_uuid": 0
            };

            document.getElementById('bequestTextArea').value = "";
            if (!isCustomBequest) {
                if (isSpouseFirst) {
                    setSelectedRecepient("Spouse First");
                } else {
                    setSelectedRecepient(null);
                }
                setSelectedBackup(null);
                let newErrors = {};
                if (shares < 100) {
                    obj.shared_uuid = currentSharedUuid
                    setIsSharedBequest(true);
                    setPendingShares(pendingShares - shares);
                    if (pendingShares - shares > 0) {
                        document.getElementById('sharesID').placeholder = `Pending shares for this bequest: ${pendingShares - shares}%`;
                        document.getElementById('sharesID').value = "";
                        document.getElementById('bequestTextArea').value = bequest;
                        newErrors.sharedBequest = "Please continue distributing shares for current bequest";

                        if (Object.keys(newErrors).length > 0) {
                            setValidationErrors(newErrors);
                        }
                    } else if (pendingShares - shares <= 0) {
                        document.getElementById('sharesID').value = "";
                        document.getElementById('sharesID').placeholder = 100;
                        document.getElementById('bequestTextArea').value = "";
                        setValidationErrors({})
                        setIsSharedBequest(false)
                        setPendingShares(100)
                        setCurrentSharedUuid(prevValue => prevValue + 1)
                    }

                } else {
                    setValidationErrors({});
                    document.getElementById('sharesID').value = "";
                    document.getElementById('sharesID').placeholder = 100;
                    document.getElementById('bequestTextArea').value = "";
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
                    setReadOnly(true);
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
                setToastMessage(isCustomBequest ? 'Custom bequest added succesfully' : 'Bequest added successfully')
                setTimeout(() => {
                    setToastMessage('')
                }, 4000)
                setShowToast(true)
                // Save to localStorage
                const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
                storedValues.bequests = updatedBequests;
                localStorage.setItem('formValues', JSON.stringify(storedValues));
            }
        }
    };

    function addAnotherRelative() { }

    function finishBequest() {
        var flag = false;
        var sum = sumValuesBySameIds(table_dataBequest);
        let len = Object.keys(sum).length;
        for (let index = 0; index < len; index++) {
            if (sum[index] !== 100) {
                alert("Please fix the bequest with id: " + index);
                flag = true;
            }
        }
        if (!flag) {
            bequestArrObj = table_dataBequest;
        }
    }

    function sumValuesBySameIds(containerObject) {
        let sums = {};
        containerObject.forEach(obj => {
            if (sums.hasOwnProperty(obj.id)) {
                sums[obj.id] += parseFloat(obj.shares);
            } else {
                sums[obj.id] = parseFloat(obj.shares);
            }
        });
        return sums;
    }

    const setCurrentRecepient = (eventKey) => {
        if (eventKey === 'add-person') {
            handleShow();
        } else {
            setSelectedRecepient(eventKey);
        }
    };

    const setCurrentBackup = (eventKey) => {
        if (eventKey === 'add-person') {
            handleShow();
        } else {
            setSelectedBackup(eventKey);
        }
    };

    const handleClose = () => {
        const newrelative = getHumanData();

        var errors = validate.addHumanData(newrelative);

        if (Object.keys(errors).length <= 0) {
            const names = newrelative.firstName + " " + newrelative.lastName;
            identifiers_names.push(names);

            let len = Object.keys(datas[5].relatives).length;
            datas[5].relatives[len] = newrelative;
            console.log(datas);

            setValidationErrors({});
            setShow(false);
        } else {
            setValidationErrors(errors);
            console.log(errors);
        }
    };

    const handleCloseNosave = () => {
        setShow(false);
    };

    const handleShow = () => {
        console.log("Opening Add Human Modal");
        setShow(true);
    };

    //Manage event on table dropdowns
    const handleSelect = (selectedItem) => {
        setSelectedBackup(selectedItem);
        // Actualiza el valor en tableDataBequest
        const updatedBequests = [...tableDataBequest];
        updatedBequests[index].names = selectedItem;
        setTableDataBequest(updatedBequests);
    };

    const handleDelete = (itemId) => {
        setBequestToDelete(itemId); // Establecer el ID del bequest a eliminar
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        setToastMessage('Bequest removed succesfully')
        setTimeout(() => {
            setToastMessage('')
        }, 4000)

        setShowToast(true)
        if (bequestToDelete !== null) {
            // Filter out the deleted item
            const updatedBequests = table_dataBequest.filter(obj => obj.id !== bequestToDelete);

            // Update the state
            setTable_dataBequest(updatedBequests);

            // Update the global variable
            bequestArrObj = updatedBequests;

            // Decrease the index
            bequestindex -= 1;

            // Update localStorage
            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = updatedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));

            // Reset and close modal
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

        // Save to localStorage
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = updatedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));

        setToastMessage('Bequest updated successfully')
        setTimeout(() => {
            setToastMessage('')
        }, 4000)
        setShowToast(true)
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

    all_data = datas;

    if (all_data != null && firstRender) {
        identifiers_names = [];
        const married = all_data[2]?.married;
        const kids = all_data[4]?.kids;
        const relatives = all_data[5]?.relatives;
        const kidsq = all_data[3].kidsq?.selection;

        var dataobj = { married, kids, relatives };

        var married_names = married?.firstName && married?.lastName ? married?.firstName + " " + married?.lastName : null;

        if (married_names !== null) { setIsMarried(true) }
        if (kidsq === "true") {
            var kids_names = kids?.firstName + " " + kids?.lastName;
            for (let child in kids) {
                const names = kids[child]?.firstName + " " + kids[child]?.lastName;
                identifiers_names.push(names);
            }
        }
        identifiers_names.push(married_names);

        for (let key in relatives) {
            const names = relatives[key]?.firstName + " " + relatives[key]?.lastName;
            identifiers_names.push(names);
        }

        setFirstRender(false);
    }

    return (
        <>
            <Form>
                <Form.Group className="mb-3" controlId="bequestTextArea">

                    <Form.Label style={{ fontWeight: "bold" }}>Bequest:</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="(i.e... Gold chain...)" readOnly={readOnly} />
                    {validationErrors.bequestItem && <p className="mt-2 text-sm text-red-600">{validationErrors.bequestItem}</p>}
                </Form.Group>

                <Form.Check
                    className='mb-6'
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
                        <Col sm={12}>
                            <Button style={{ width: "80%", margin: "5%" }} variant="outline-success" onClick={() => addRecepient()} >Add Custom Bequest</Button>
                        </Col>
                        <Col sm={12}>
                            <Button
                                onClick={() => setOpen(!open)}
                                aria-controls="example-collapse-text"
                                aria-expanded={open}
                                style={{ width: "80%", margin: "5%" }}
                                variant="outline-dark"
                            >
                                See Bequest information
                            </Button>
                        </Col>
                    </>


                )}
                {!isCustomBequest && (
                    <>
                        <Row >
                            <Col sm={12}>
                                <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                                    <Dropdown.Toggle style={{ width: "100%" }} variant={isSpouseFirst ? "outline-success" : "outline-dark"} caret="true" id="size-dropdown">
                                        {
                                            isSpouseFirst
                                                ? <>
                                                    <strong>Selected Beneficiary:</strong> {selectedRecepient}
                                                </>
                                                : (selectedRecepient !== null
                                                    ? <>
                                                        <strong>Selected Beneficiary:</strong> {selectedRecepient}
                                                    </>
                                                    : "Select Beneficiary"
                                                )
                                        }

                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={'text-center'} style={{ width: "100%" }}>
                                        {isMarried && !isSharedBequest && (
                                            <DropdownItem key='spouse-first' eventKey='Spouse First'>Spouse First</DropdownItem>
                                        )}
                                        <Dropdown.Divider />
                                        {identifiers_names.map(size => (
                                            <DropdownItem key={size} eventKey={size}>{size}</DropdownItem>
                                        ))}
                                        <Dropdown.Divider />
                                        <DropdownItem eventKey='add-person' className='text-primary'>Add Person</DropdownItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>
                        {validationErrors.beneficiary && <p className="mt-2 text-center text-red-600">{validationErrors.beneficiary}</p>}
                        <Row >
                            <Col sm={12}>
                                <Dropdown style={{ width: "100%", marginTop: "12px" }} onSelect={setCurrentBackup} >
                                    <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" caret="true" id="size-dropdown">
                                        {
                                            selectedBackup !== null
                                                ? <>
                                                    <strong>Selected Backup:</strong> {selectedBackup}
                                                </>
                                                : 'Select Bequest Backup'
                                        }
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu className={'text-center'} style={{ width: "100%" }}>
                                        {identifiers_names.map(size => (
                                            <DropdownItem key={size} eventKey={size}>{size}</DropdownItem>
                                        ))}
                                        <Dropdown.Divider />
                                        <DropdownItem eventKey='add-person' className='text-primary'>Add Person</DropdownItem>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Row>
                        {validationErrors.beneficiaryAndBackup && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.beneficiaryAndBackup}</p>}
                        {validationErrors.backupSameAsBeneficiary && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.backupSameAsBeneficiary}</p>}
                        {validationErrors.backup && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.backup}</p>}
                        <Form.Group className="mb-3 text-center mt-12" controlId="sharesID">
                            <Form.Control readOnly={isSpouseFirst} controlId="sharesInput" className="text-center" type="number" placeholder="100" />
                            {validationErrors.shares && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.shares}</p>}
                            {validationErrors.sharedBequest && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.sharedBequest}</p>}
                            <Form.Label className="text-center">
                                <i className="bi bi-exclamation-circle text-danger mx-2"></i>
                                {isSpouseFirst
                                    ? 'If the bequest is allocated to the spouse first, they receive 100% of it.'
                                    : 'The total shares for each bequest, distributed among all recipients, must sum to 100%.'
                                }
                            </Form.Label>

                            <Row>
                                <Col sm={6}>
                                    <Button style={{ width: "80%", margin: "5%" }} variant="outline-success" onClick={() => addRecepient()} >Add Recepient</Button>
                                </Col>
                                {/* Eliminar el botón "Add New Beneficiary" */}
                                {/* <Col sm={6}>
                                    <Button style={{ width: "80%", margin: "5%" }} variant="outline-info" onClick={() => handleShow()}>Add New Beneficiary</Button>
                                </Col> */}
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <Button
                                        onClick={() => setOpen(!open)}
                                        aria-controls="example-collapse-text"
                                        aria-expanded={open}
                                        style={{ width: "80%", margin: "5%" }}
                                        variant="outline-dark"
                                    >
                                        See Bequest information
                                    </Button>
                                </Col>
                            </Row>
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
                                                    <Dropdown style={{ width: '100%' }} onSelect={(eventKey) => handleDropdownSelect(index, 'names', eventKey)}>
                                                        <Dropdown.Toggle style={{ width: '100%' }} variant="outline-dark" id={`dropdown-names-${index}`}>
                                                            {item.names || 'Select Beneficiary'}
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className="text-center" style={{ width: '100%' }}>
                                                            {identifiers_names.map(name => (
                                                                <Dropdown.Item key={name} eventKey={name}>
                                                                    {name}
                                                                </Dropdown.Item>
                                                            ))}
                                                            <Dropdown.Divider />
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                ) : (
                                                    item.names
                                                )}
                                            </td>
                                            <td>
                                                {editingRow === index ? (
                                                    <Dropdown style={{ width: '100%' }} onSelect={(eventKey) => handleDropdownSelect(index, 'backup', eventKey)}>
                                                        <Dropdown.Toggle style={{ width: '100%' }} variant="outline-dark" id={`dropdown-backup-${index}`}>
                                                            {item.backup || 'Select Backup'}
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className="text-center" style={{ width: '100%' }}>
                                                            {identifiers_names.map(name => (
                                                                <Dropdown.Item key={name} eventKey={name}>
                                                                    {name}
                                                                </Dropdown.Item>
                                                            ))}
                                                            <Dropdown.Divider />
                                                        </Dropdown.Menu>
                                                    </Dropdown>
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

            <Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Person</Modal.Title>
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

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete} // Pasar la función para confirmar la eliminación
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
