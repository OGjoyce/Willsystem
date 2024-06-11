
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Image from 'react-bootstrap/Image';
import donorIcon from '../../organdonation.png'
import customIcon from '../../customicon.png'
import blendedFamily from '../../blendedfamily.png'
import dualHanded from '../../dualhands.png'

import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
var selected_value = "";


function Additional({ datas }) {



    return (
        <Container>
            <Row>
                <Col xs={6} md={4}>
                    <Image style={{position: "relative", left:"30%", width:"100px", height:"110px"}} src={donorIcon} rounded />
                </Col>
                <Col xs={6} md={4}>
                    <Form>
                        <Form.Check // prettier-ignore
                            type="switch"
                            id="custom-switch"
                            label="Standard Clause"
                        />
                       
                    </Form>


                </Col>
            </Row>
            <Row>
                <Col xs={6} md={4}>
                    <Image style={{position: "relative", left:"30%", width:"100px", height:"110px"}} src={customIcon} rounded />
                </Col>
                <Col xs={6} md={4}>
                    <Form>
                        <Form.Check // prettier-ignore
                            type="switch"
                            id="custom-switch"
                            label="Custom Clause"
                        />
                       
                    </Form>


                </Col>
            </Row>
            <Row>
                <Col xs={6} md={4}>
                    <Image style={{position: "relative", left:"30%", width:"100px", height:"110px"}} src={blendedFamily} rounded />
                </Col>
                <Col xs={6} md={4}>
                    <Form>
                        <Form.Check // prettier-ignore
                            type="switch"
                            id="custom-switch"
                            label="Blended Family"
                        />
                       
                    </Form>


                </Col>
            </Row>
            <Row>
                <Col xs={6} md={4}>
                    <Image style={{position: "relative", left:"30%", width:"100px", height:"110px"}} src={dualHanded} rounded />
                </Col>
                <Col xs={6} md={4}>
                    <Form>
                        <Form.Check // prettier-ignore
                            type="switch"
                            id="custom-switch"
                            label="Other Wishes "
                        />
                       
                    </Form>


                </Col>
            </Row>
        </Container>





    );
}
export default Additional;