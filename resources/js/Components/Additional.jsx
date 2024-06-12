
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
import OrganDonation from '@/Components/AdditionalComponents/OrganDonation';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
var selected_value = "";
var objSelector = [];
export function getAdditionalInformation() {
    return objSelector;
}
var firstRender = 0;
function Additional({ datas }) {
    console.log(OrganDonation);
    var [dataPointer2, setDataPointer2] = useState(1);
    const [updatePointerSelector, setUpdatePointerSelector] = useState({});

    const callFunction = (obj) => {
        setUpdatePointerSelector(obj);
        var objExport = {
            "Master": dataPointer2,
            ...obj
        }
        objSelector.push(objExport);
        console.log(dataPointer2);
        // setDataPointer2(null)
        console.log(objSelector);
    }

    const handleSwitch = (pointer) => {

        if (firstRender == 1) {
            dataPointer2 = 1;
            setDataPointer2(pointer);

        }


        console.log(dataPointer2 + "-*refreshrate*-" + pointer);

    }
    if (firstRender == 0) {
        firstRender == 1;
    }
    console.log(dataPointer2);



    return (
        <><>

            {dataPointer2 == 0 ?
                <OrganDonation callFunction={callFunction} />
                :
                null
            }
        </><>

                {dataPointer2 != null ?
                    null




                    :

                    <Container>

                        <Row>
                            <Col xs={6} md={4}>
                                <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={donorIcon} rounded />
                            </Col>
                            <Col xs={6} md={4}>
                                <Form>
                                    <Form.Check onClick={ handleSwitch(0)}

                                        type="switch"
                                        id="custom-switch"
                                        label="Standard Clause" />

                                </Form>


                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={4}>
                                <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={customIcon} rounded />
                            </Col>
                            <Col xs={6} md={4}>
                                <Form>
                                    <Form.Check // prettier-ignore

                                        type="switch"
                                        id="custom-switch2"
                                        label="Custom Clause" />

                                </Form>


                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={4}>
                                <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={blendedFamily} rounded />
                            </Col>
                            <Col xs={6} md={4}>
                                <Form>
                                    <Form.Check // prettier-ignore

                                        type="switch"
                                        id="custom-switch3"
                                        label="Blended Family" />

                                </Form>


                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={4}>
                                <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={dualHanded} rounded />
                            </Col>
                            <Col xs={6} md={4}>
                                <Form>
                                    <Form.Check // prettier-ignore

                                        type="switch"
                                        id="custom-switch4"
                                        label="Other Wishes" />

                                </Form>


                            </Col>
                        </Row>
                    </Container>}





            </></>



    );
}
export default Additional;