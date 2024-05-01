
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
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
import { DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';



var all_data;
var identifiers_names = [];

function Bequest({ id, datas }) {
   

    all_data = datas;

    if(all_data != null){
        //get marrieds get kids and relatives firsnames + lastname then save the names in a listt
        /*
        you should add to the object a bequest keyname and add the names there  for example
        obj.bequests = [{
            "text": "bequest",
            "identifiers": [
                {
                    id: x,
                    shares: z,
                },
            {
                id:y
                shares: z
            }
            ]


        }]
        */
       const married = all_data[2].married;
       const kids = all_data[4].kids;
       const relatives = all_data[5].relatives;
       debugger;

        var dataobj ={}
        dataobj = {
            married, kids, relatives
        }

        var married_names = married.firstName + " " + married.lastName;
        var kids_names = kids.firstName + " " + kids.lastName;
        identifiers_names.push(married_names, kids_names);


        for (let key in relatives) {
            const names = relatives[key].firstName + " " + relatives[key].lastName;
            identifiers_names.push(names);
        }
        
        console.log(identifiers_names);


    }









    return (
        <>


            <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Bequest</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>



                <Dropdown style={{width:"100%"}} >
                    <DropdownToggle  variants="success" caret id="size-dropdown">
                        Select Recepient
                    </DropdownToggle>
                    <DropdownMenu>
                        {identifiers_names.map(size => (
                            <DropdownItem>{size}</DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>

                <Form.Group className="mb-3" controlId="sharesID">
                    <Form.Label>Shares</Form.Label>
                    <Form.Control type="number" placeholder="100%" />
                </Form.Group>

                <Button variant="outline-dark">Add Recepient</Button>
                <Button variant="outline-info">Add Another Relative</Button>

            </Form>







        </>




    );
}
export default Bequest;