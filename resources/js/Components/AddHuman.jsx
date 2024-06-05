
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Form from 'react-bootstrap/Form';

var selected_value = "";
export function getHumanData(params) {


    if (params != false) {

        var firstName = document.getElementById('firstNameId').value;
        var middleName = document.getElementById('middleNameId').value;
        var lastName = document.getElementById('lastNameId').value;
        var relative = document.getElementById('relativeId').value;

        if (params == "childrens") {
            var obj = {
                "firstName": firstName,
                "middleName": middleName,
                "lastName": lastName,
                "relative": relative,
                "email": "NA",
                "phone": "NA"
            }


        }
        else {

            var control = 0;

            try {
                var email1 = document.getElementById('emailId0').value;

            } catch (error) {
                control = 1;
                var email2 = document.getElementById('emailId1').value;

            }



            var phone = document.getElementById('phoneId').value;
            var obj = {
                "firstName": firstName,
                "middleName": middleName,
                "lastName": lastName,
                "relative": relative,
                "email": control == 0 ? email1 : email2,
                "phone": phone
            }

        }







        return obj;

    }
    else {
        var obj = {
            "firstName": "NA",
            "middleName": "NA",
            "lastName": "NA",
            "relative": "NA",
            "email": "NA",
            "phone": "NA"
        }
        return obj;

    }
}

function AddHuman({ married, childrens, human }) {



    return (
        <>
            <h1>Information details</h1>
            <Form>
                <Form.Group className="mb-3" controlId="firstNameId">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" placeholder="First Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="middleNameId">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control type="text" placeholder="Middle Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastNameId">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Last Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="relativeId">
                    <Form.Label>Relative</Form.Label>
                    {
                        married ?
                            <><Form.Control readOnly defaultValue="Spouse" />
                                <Form.Group className="mb-3" controlId="emailId0">
                                    <Form.Label>Email for notifications:</Form.Label>
                                    <Form.Control type="email" placeholder="example@dot.com" />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="phoneId">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" placeholder="+1(XXX)XXX-XXXX" />
                                </Form.Group>
                            </>
                            :
                            null


                    }
                    {
                        childrens ?
                            <><Form.Control readOnly defaultValue="Children" /><Form.Group className="mb-3" controlId="emailId1">
                            </Form.Group></>
                            :
                            null
                    }
                    {
                        human ?
                            <><><Form.Control type="text" placeholder="Relative" />
                                <Form.Group className="mb-3" controlId="emailId1">
                                    <Form.Label>Email for notifications:</Form.Label>
                                    <Form.Control type="email" placeholder="example@dot.com" />
                                </Form.Group></><Form.Group className="mb-3" controlId="phoneId">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control type="text" placeholder="+1(XXX)XXX-XXXX" />
                                </Form.Group></>
                            :
                            null
                    }


                </Form.Group>

            </Form>


        </>




    );
}
export default AddHuman;