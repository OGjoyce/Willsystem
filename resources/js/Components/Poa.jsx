
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'react-bootstrap/DropdownToggle';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownMenu from 'react-bootstrap/DropdownMenu';
import DropdownItem from 'react-bootstrap/DropdownItem';
import Image from 'react-bootstrap/Image';

var all_data;
var identifiers_names = [];
export default function Poa({ datas }) {
    const [checkedState, setCheckedState] = useState({
        organdonation: false,
        dnr: false
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState({
            ...checkedState,
            [name]: checked
        });


    };
    const setCurrentRecepient = (eventKey) => {
        console.log(eventKey);
        setSelectedRecepient(eventKey);
    };


    const [firstRender, setFirstRender] = useState(true);
    all_data = datas;

    if (all_data != null && firstRender) {

        // const married = all_data[2].married;
        // const kids = all_data[4].kids;
        // const relatives = all_data[5].relatives;
        // const kidsq = all_data[3].kidsq.selection;

        // var dataobj = {}
        // dataobj = {
        //     married, kids, relatives
        // }

        // var married_names = married.firstName + " " + married.lastName;
        // if (kidsq == "true") {
        //     var kids_names = kids.firstName + " " + kids.lastName;
        //     for (let child in kids) {
        //         const names = kids[child].firstName + " " + kids[child].lastName;
        //         identifiers_names.push(names);
        //     }


        // }
        // else {


        // }
        // identifiers_names.push(married_names);



        // for (let key in relatives) {
        //     const names = relatives[key].firstName + " " + relatives[key].lastName;
        //     identifiers_names.push(names);
        // }
        setFirstRender(false);


    }



    return (
        <>


            <Form>
                <p>Select the guardian for your childs</p>
                <Form.Group className="mb-3">
                    <DropdownButton
                        size="lg"
                        variant="outline-dark"
                        id="guardianSelector"
                        title={selected != null ? selected : 'Select the Guardian'}
                        onSelect={setCurrentRecepient}
                    >
                        {identifiers_names.map((option, index) => (
                            <Dropdown.Item key={index} eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <DropdownButton
                        size="lg"
                        variant="outline-dark"
                        id="prioritySelector"
                        title={'Select priority'}
                        onSelect={setCurrentRecepient}
                    >
                        {priorityInformation.map((option, index) => (
                            <Dropdown.Item key={index} eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Form.Group>
                <Button variant="outline-success" onClick={() => AddGuardianButton()} >Add Guardian</Button>
            </Form>
            <Row>
                <Col sm={12}>
                    <Dropdown variants="outline-dark" style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle caret id="poa1">
                            Attorney for Property one
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa1join">
                            <p> Joint - Attorney for Property one</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa2">
                            <p> Attorney for Property two</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa2joint">
                            <p> Joint - Attorney for Property two</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>


            <Row>
                <Col sm={12}>
                    <InputGroup>
                        <Form.Label> Restrictions on Property </Form.Label>

                        <Form.Control as="textarea" aria-label="With textarea" id="textAreaCustomClause" />
                    </InputGroup>

                </Col>
            </Row>


            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa1">
                            Attorney for Health one
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa1join">
                            <p> Joint - Attorney for Health one</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa2">
                            <p> Attorney for Health two</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                        <DropdownToggle variants="outline-dark" caret id="poa2joint">
                            <p> Joint - Attorney for Health two</p>
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </Col>
            </Row>
            <Row>
                <Col sm={6}>

                    <Form.Check
                        type="checkbox"
                        id="organdonation"
                        name="organdonation"
                        label="Organ Donation"
                        checked={checkedState.organdonation}
                        onChange={handleCheckboxChange}
                    />


                </Col>
                <Col sm={6}>

                    <Form.Check
                        type="checkbox"
                        id="dnr"
                        name="dnr"
                        label="DNR (Do Not Resucitate)"
                        checked={checkedState.dnr}
                        onChange={handleCheckboxChange}
                    />


                </Col>
            </Row>




        </>
    );

}