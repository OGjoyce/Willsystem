
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
let arrayObject = new Array(11);

export function getPoa() {
    return arrayObject;
}
export default function Poa({ datas }) {
    const [checkboxes, setCheckboxes] = useState({
        organ: false,
        dnr: false,
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes({
            ...checkboxes,
            [name]: checked,
        });
        arrayObject[10] = checkboxes;
        arrayObject[9] = checkboxes;
    };
    const setCurrentRecepient = (eventKey, event) => {
        if (event == null) {
            if (eventKey == 4) {
                arrayObject[eventKey] = document.getElementById('poa4').value;
            }



        }
        else {
            const { name, index } = JSON.parse(eventKey);

            arrayObject[index] = name;



        }
       
        console.log(arrayObject);

    };


    const [firstRender, setFirstRender] = useState(true);
    var [selected, setSelected] = useState(null);
    all_data = datas;

    if (all_data != null && firstRender) {

        const married = all_data[2].married;
        const kids = all_data[4].kids;
        const relatives = all_data[5].relatives;
        const kidsq = all_data[3].kidsq.selection;

        var dataobj = {}
        dataobj = {
            married, kids, relatives
        }

        var married_names = married.firstName + " " + married.lastName;
        if (kidsq == "true") {
            var kids_names = kids.firstName + " " + kids.lastName;
            for (let child in kids) {
                const names = kids[child].firstName + " " + kids[child].lastName;
                identifiers_names.push(names);
            }


        }
        else {


        }
        identifiers_names.push(married_names);



        for (let key in relatives) {
            const names = relatives[key].firstName + " " + relatives[key].lastName;
            identifiers_names.push(names);
        }
        setFirstRender(false);


    }



    return (
        <>
            <Container>

                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa0">
                                Attorney for Property one
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 0 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>

                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa1">
                                Joint - Attorney for Property one
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 1 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa2">
                                Attorney for Property two
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 2 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa3">
                                Joint - Attorney for Property two
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 3 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>


                <Row>

                    <InputGroup>
                        <Col sm={3}>
                            <Form.Label> Restrictions on Property </Form.Label>
                        </Col>
                        <Col sm={9}>
                            <Form.Control onSelect={() => { setCurrentRecepient(4, null) }} as="textarea" aria-label="With textarea" id="poa4" />
                        </Col>

                    </InputGroup>


                </Row>
                <br>
                </br>
                <br>
                </br>


                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa5">
                                Attorney for Health one
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 5 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa6">
                                Joint - Attorney for Health one
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 6 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa7">
                                Attorney for Health two
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 7 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Row>
                    <Col sm={12}>
                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle style={{ width: "100%" }} variant="outline-dark" caret id="poa8">
                                Joint - Attorney for Health two
                            </DropdownToggle>
                            <DropdownMenu style={{ width: "100%" }}>
                                {identifiers_names.map(size => (
                                    <DropdownItem style={{ width: "100%" }} eventKey={JSON.stringify({ name: size, index: 8 })}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>

                    </Col>
                </Row>
                <br>
                </br>
                <br>
                </br>
                <Form>
                    <Row>
                        <Col sm={6}>
                            <Form.Check
                                type="checkbox"
                                id="checkbox1"
                                name="organ"
                                label="Organ Donation"
                                checked={checkboxes.organ}
                                onChange={handleCheckboxChange}
                            />


                        </Col>
                        <Col sm={6}>
                            <Form.Check
                                type="checkbox"
                                id="checkbox2"
                                name="dnr"
                                label="DNR (Do Not Resucitate)"
                                checked={checkboxes.dnr}
                                onChange={handleCheckboxChange}
                            />


                        </Col>
                    </Row>
                </Form>
            </Container >




        </>
    );

}