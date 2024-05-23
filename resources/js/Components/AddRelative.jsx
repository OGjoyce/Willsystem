
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





var render = 0;
var ids = 1;
var selected_executor = "";
var executorPriority = 1;
var selectedExecutor = [];

var childRelatives = [];
var executorsObj = [];

var relativeGlobal = "";
export function getChildRelatives(){
    return childRelatives;
}

function AddRelative({ relative, datas }) {
    const [show, setShow] = useState(false);
    var [table_data, setDataTable] = useState([]);


    const handleCloseNosave = () => {
        setShow(false);
    }
    const handleShow = () => {
        setShow(true);

    }
    const handleClose = () => {
        setShow(false);

        const modalData = getHumanData("childrens");
        const idpointer = ids;
        var obj = {
            "id": idpointer,
            "firstName": modalData.firstName,
            "lastName": modalData.lastName,
            "relative": modalData.relative
        }
        table_data.push(obj);
        //  setDataTable(table_spoon);
        childRelatives = table_data;

        ids += 1;

    }
    const handleDelete = (id) => {
        //functiono should pop from table_dataExecutor and render again

        table_data = table_data.filter(obj => obj.id !== id);

        var obj = table_data;
        setDataTable(obj);
        childRelatives = table_data;

        executorPriority -= 1;


    }


    if (render == 0) {
        relativeGlobal = relative;
        render++;
    }
    return (

        <><div className="d-grid gap-2">
            <Button variant="outline-info" size="lg" onClick={handleShow}>
                Add more childs
            </Button>


            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Relative</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>


                    { childRelatives.length == 0?
                    <p>No records found, please add new child using above button...</p>
                    :

                        table_data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item.relative}</td>
                                <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                            </tr>
                        ))}


                </tbody>
            </Table>


        </div><Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Child</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <AddHuman childrens={true} />


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleCloseNosave}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal></>
    );






}
export default AddRelative;