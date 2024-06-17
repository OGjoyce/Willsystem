
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import organIcon from '../../../organdonationicon2.png'
import bodyIcon from '../../../bodycremationicon.png'
import buriedIcon from '../../../buriedicon.png'
import 'bootstrap-icons/font/bootstrap-icons.css';
import InputGroup from 'react-bootstrap/InputGroup';
import Image from 'react-bootstrap/Image';




function OrganDonation({ callFunction }) {

    const [checkedState, setCheckedState] = useState({
        organdonation: false,
        cremation: false,
        buried: false
    });

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState({
            ...checkedState,
            [name]: checked
        });
    };
    function handleSwitch(param) {
        if (param == 0) {
            callFunction(false);

        }
        if (param == 1) {

            var obj = {
                "Slave": checkedState
            }
           
            callFunction(obj);
 

        }



    }


    return (
        <>
            <Container>
                <Form>

                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={organIcon} rounded />
                        </Col>
                        <Col sm={4}>

                            {/* <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(0) }} style={{ width: "100%", position: "relative", top: "40%" }} >Organ Donation </Button> */}
                            <Form.Check
                                type="checkbox"
                                id="organdonation"
                                name="organdonation"
                                label="Organ Donation"
                                checked={checkedState.option1}
                                onChange={handleCheckboxChange}
                            />


                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={bodyIcon} rounded />
                        </Col>
                        <Col sm={4}>
                            {/* <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(1) }} style={{ width: "100%", position: "relative", top: "40%" }} >Body Cremation</Button> */}
                            <Form.Check
                                type="checkbox"
                                id="cremation"
                                name="cremation"
                                label="Body Cremation"
                                checked={checkedState.option2}
                                onChange={handleCheckboxChange}
                            />


                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={buriedIcon} rounded />
                        </Col>
                        <Col sm={4}>
                            {/* <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(2) }} style={{ width: "100%", position: "relative", top: "40%" }} >Buried</Button> */}
                            <Form.Check
                                type="checkbox"
                                id="buried"
                                name="buried"
                                label="Buried"
                                checked={checkedState.option3}
                                onChange={handleCheckboxChange}
                            />


                        </Col>

                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Button variant="outline-warning" type="submit" onClick={() => { handleSwitch(0) }} style={{ width: "100%", position: "relative" }} ><i className="bi bi-arrow-90deg-left"></i>Back </Button>
                        </Col>
                        <Col sm={8}>
                            <Button variant="outline-info" type="submit" onClick={() => { handleSwitch(1) }} style={{ width: "100%", position: "relative" }} ><i class="bi bi-check2-all"></i>Finish Selection </Button>
                        </Col>
                    </Row>
                </Form>

            </Container>
        </>




    );
}
export default OrganDonation;