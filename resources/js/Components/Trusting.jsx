
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Form from 'react-bootstrap/Form';

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

var selected_value = "";

var tableData = [];
var pointer = 1;
var sharescounter = 0;
export function getTableData() {
    return tableData;
}
function Trusting({ datas }) {

    const [open, setOpen] = useState(false);
    var [objStats, setObjStats] = useState({});
    const handleAdd = () => {

        const age = document.getElementById('age').value;
        const shares = document.getElementById('shares').value;
        var floatshares = parseFloat(shares);
        var flag = false;
        if (floatshares > 100) {

        }
        else if (floatshares == 100) {
            if (sharescounter == 0) {
                sharescounter += floatshares;
            }
        }
        else if (floatshares <= 100) {
            if ((sharescounter + floatshares) <= 100) {
                sharescounter += floatshares;
            }
            else {
                flag = true;
            }

        }
        tableData = tableData.filter(obj => obj.age !== age);
        var obj = {
            "id": pointer,
            "age": age,
            "shares": shares
        }
        if (!flag) {
            tableData.push(obj);
            setObjStats(obj);
            pointer++;
        }


    }

    const handleDelete = (itemid) => {
        tableData = tableData.filter(obj => obj.id !== itemid);
        var sumador = 0;
        for (const key in tableData) {
            const value = parseFloat(tableData[key].shares);
            sumador += value;
        }

        sharescounter = sumador;
        var obj = tableData;
        setObjStats(obj);


        pointer--;

    }
    return (
        <><h1>Testamentary Trust</h1><p> Designate amounts recived by minors and ages</p><p>! Remember that the sum of the shares should be equal to 100%, see table below</p>
            <Form>
                <Form.Group controlId="age">
                    <Form.Label>Age</Form.Label>
                    <Form.Control type="number" />
                </Form.Group>
                <Form.Group controlId="shares">
                    <Form.Label>Shares %</Form.Label>
                    <Form.Control type="number" />
                </Form.Group>

            </Form>
            <Button variant="success" size="sm" onClick={handleAdd}>Add new Share</Button>
            <div id="example-collapse-text">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>Age</th>
                            <th>Percentage</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan="4">
                                    No information added yet, press "Add New Share" to add.
                                </td>
                            </tr>
                        ) : (
                            tableData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.id}</td>
                                    <td>{item.age}</td>
                                    <td>{item.shares}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            <div>
                <p><b><u>Total: {sharescounter} </u></b></p>
            </div>
        </>







    );
}
export default Trusting;