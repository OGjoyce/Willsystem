
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
export function getMarriedData() {
    return selected_value;

}

function AddHuman({ married, childrens, human }) {



    return (
        <>
            <h1>Add the key persons for your will!</h1>
            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" placeholder="Your couple's name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control type="text" placeholder="Your couple's middlename" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Your couple's lastname" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                    <Form.Label>Relative</Form.Label>
                    {
                        married?
                        <Form.Control readOnly defaultValue="Spouse" />
                        :
                        <Form.Control  type="text" placeholder="Relative type" />

                    }
                   
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput4">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="text" placeholder="+1(XXX)XXX-XXXX" />
                </Form.Group>
            </Form>


        </>




    );
}
export default AddHuman;