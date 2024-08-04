import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import Modal from 'react-bootstrap/Modal';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

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
    var [table_dataBequest, setTable_dataBequest] = useState([]);
    var [selectedRecepient, setSelectedRecepient] = useState("Select a recepient to continue...");
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [validationErrors, setValidationErrors] = useState({})

    useEffect(() => {
        setValidationErrors(errors)
        // Load formValues from localStorage
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            setTable_dataBequest(storedValues.bequests);
            bequestArrObj = storedValues.bequests;
            bequestindex = storedValues.bequests.length > 0 ? Math.max(...storedValues.bequests.map(b => b.id)) : 0;
        }
    }, [errors])

    const reviewBequestSum = (index) => {
        var counter = 0;
        var obj = table_dataBequest[index];
    }

    const addRecepient = () => {
        var bequest, selected, shares;
        bequest = document.getElementById('bequestTextArea').value;
        selected = isCustomBequest ? 'NA' : selectedRecepient;
        shares = isCustomBequest ? "100%" : document.getElementById('sharesID').value;

        if (bequest != "" && (isCustomBequest || (selected != "false" && shares != "" && shares > 0 && shares <= 100))) {
            var obj = {
                "id": bequestindex + 1,
                "names": selected,
                "shares": shares,
                "bequest": bequest,
                "isCustom": isCustomBequest
            }

            document.getElementById('bequestTextArea').value = "";
            if (!isCustomBequest) {
                setSelectedRecepient("Select other Recepient...");
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

                    if (globalCounter == 100) {
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

                setValidationErrors({})

                // Save to localStorage
                const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
                storedValues.bequests = updatedBequests;
                localStorage.setItem('formValues', JSON.stringify(storedValues));
            }
        }
    }

    function addAnotherRelative() {

    }

    function finishBequest() {
        var flag = false;
        var sum = sumValuesBySameIds(table_dataBequest);
        let len = Object.keys(sum).length;
        for (let index = 0; index < len; index++) {
            if (sum[index] != 100) {
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
        setSelectedRecepient(eventKey);
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
            console.log(errors)
        }

    }

    const handleCloseNosave = () => {
        setShow(false);
    }

    const handleShow = () => {
        console.log("nice");
        setShow(true);
    }

    const handleDelete = (itemId) => {
        // Filter out the deleted item
        const updatedBequests = table_dataBequest.filter(obj => obj.id !== itemId);

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
    };

    all_data = datas;

    if (all_data != null && firstRender) {
        identifiers_names = []
        const married = all_data[2].married;
        const kids = all_data[4].kids;
        const relatives = all_data[5].relatives;
        const kidsq = all_data[3].kidsq?.selection;

        var dataobj = { married, kids, relatives }

        var married_names = married?.firstName + " " + married?.lastName;
        if (kidsq == "true") {
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
                    <Form.Label>Bequest</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="(i.e... Gold chain...)" readOnly={readOnly} />
                </Form.Group>

                <Form.Check
                    type="checkbox"
                    id="custom-bequest-checkbox"
                    label="Custom Bequest"
                    checked={isCustomBequest}
                    onChange={(e) => setIsCustomBequest(e.target.checked)}
                />

                {!isCustomBequest && (
                    <>
                        <Row >
                            <Col md="auto">
                                <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                                    <DropdownToggle variants="success" caret="true" id="size-dropdown">
                                        Select Recepient
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {identifiers_names.map(size => (
                                            <DropdownItem key={size} eventKey={size}>{size}</DropdownItem>
                                        ))}
                                    </DropdownMenu>
                                </Dropdown>
                            </Col>
                            <Col md="auto" style={{ border: "1px solid black" }}>
                                {
                                    selectedRecepient == "false" ?
                                        null
                                        :
                                        <p>Selected Recepient:<b> {selectedRecepient} </b></p>
                                }
                            </Col>
                        </Row>

                        <Form.Group className="mb-3" controlId="sharesID">
                            <Form.Label>The total shares should be equal to 100% </Form.Label>
                            <Form.Control type="number" placeholder="100" />
                        </Form.Group>
                    </>
                )}

                <Button variant="outline-success" onClick={() => addRecepient()} >Add Recepient</Button>
                <Button variant="outline-info" onClick={() => handleShow()}>Add Another Relative</Button>
            </Form>

            <Button
                onClick={() => setOpen(!open)}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                style={{ width: "80%", margin: "5%" }}
                variant="outline-dark"
            >
                See Bequest information
            </Button>
            {validationErrors.bequest && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.bequest}</p>}
            <Collapse in={open}>
                <div id="example-collapse-text">
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Names</th>
                                <th>Bequest</th>
                                <th>Shares</th>
                                <th>Custom</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                table_dataBequest.length == 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            No information added yet, press "Add Recipient Button" to add.
                                        </td>
                                    </tr>
                                ) : (
                                    table_dataBequest.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id}</td>
                                            <td>{item.names}</td>
                                            <td>{item.bequest}</td>
                                            <td>{item.shares}</td>
                                            <td>{item.isCustom ? 'Yes' : 'No'}</td>
                                            <td>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
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
        </>
    );
}

export default Bequest;