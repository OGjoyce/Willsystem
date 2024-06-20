
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
var pickup = false;

export function getFinalDetails() {
    var textArea = document.getElementById('textArea').value;
    var obj = {
        "specialInstructions": textArea,
        "pickup": pickup
    };
    return obj;
}
export default function FinalDetails({ datas }) {
    const [checkboxes, setCheckboxes] = useState({
        officePick: false,
       
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckboxes({
            ...checkboxes,
            [name]: checked,
        });
        pickup = checkboxes.officePick;
       
    };


    var initialTimeStamp = datas[0].personal.timestamp;
    var finalTimeStamp = datas[13].poa.timestamp;

    const actualTimeStamp = finalTimeStamp - initialTimeStamp;
    const totalMinutes = Math.floor(actualTimeStamp / 1000 / 60);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    console.log(`Time passed: ${hours} hour(s) and ${minutes} minute(s)`);

    return (
        <>
            <Container>
                <Form>
                    <Row>
                        <Col sm={12}>
                        <p>Elapsed time:  Hours {hours} , minutes {minutes}</p>
                        </Col>
                    </Row>
                    <Row>

                        <InputGroup>
                            <Col sm={3}>
                                <Form.Label> Special Request for lawyer </Form.Label>
                            </Col>
                            <Col sm={9}>
                                <Form.Control as="textarea" aria-label="With textarea" id="textArea" />
                            </Col>

                        </InputGroup>


                    </Row>
                    <Row>
                        <Col sm={12}>
                        <Form.Check
                                type="checkbox"
                                id="checkbox1"
                                name="officePick"
                                label="Client Wants To Pick Up Wills & POAs at Office"
                                checked={checkboxes.organ}
                                onChange={handleCheckboxChange}
                            />
                            </Col>
                    </Row>
                </Form>



            </Container >




        </>
    );

}