
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
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap-icons/font/bootstrap-icons.css';

import Image from 'react-bootstrap/Image';



function ClauseArea({ callFunction, clause }) {
    const [checkedState, setCheckedState] = useState({
        organdonation: false,
        cremation: false,
        buried: false
    });
   




    function handleSwitch(param) {
        if (param == 0) {
            callFunction(false);

        }
        if (param == 1) {

            var textAreaCustomClause = document.getElementById("textAreaCustomClause").value;
            var obj = {
                "customClause": textAreaCustomClause
            }

            callFunction(obj);


        }



    }



    return (
        <>

            <Container>
                <Row>
                    <Col sm={4}>
                    {
                        clause != "other"?
                        <p>Custom Clause: </p>
                        :
                        <p>Other Wishes: </p>

                    }
                        
                    </Col>
                    <Col sm={8}>
                        <InputGroup>

                            <Form.Control as="textarea" aria-label="With textarea" id="textAreaCustomClause" />
                        </InputGroup>
                    </Col>
                </Row>
                <br></br>
                <br></br>
                <Row>
                    <Col sm={4}>
                        <Button variant="outline-warning" type="submit" onClick={() => { handleSwitch(0) }} style={{ width: "100%", position: "relative" }} ><i className="bi bi-arrow-90deg-left"></i>Back </Button>
                    </Col>
                    <Col sm={8}>
                        <Button variant="outline-info" type="submit" onClick={() => { handleSwitch(1) }} style={{ width: "100%", position: "relative" }} ><i class="bi bi-check2-all"></i>Finish Custom Clause </Button>
                    </Col>
                </Row>


            </Container>

        </>




    );
}
export default ClauseArea;