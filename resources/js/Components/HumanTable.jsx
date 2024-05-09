
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

var relativesObj = [];
var executorsObj = [];

export function getRelatives() {
    return relativesObj;

}
export function getExecutors(){
    return executorsObj;

}
function HumanTable({ id, datas }) {

    // var table_data = [];
    var table_spoon = [];
    var [table_data, setDataTable] = useState([]);
    var [table_dataExecutor, setDataTableExecutor] = useState([]);
    const [data, setData] = useState([]);
    const [dataExecutor, setDataExecutor] = useState(0);

    const [modalSelector, setModalSelector] = useState(0);


    if (datas != null && render == 0) {
        const len = datas.length;
        for (let index = 0; index < len; index++) {

            const element = datas[index];
            //Agregar un objeto json que cada posicion sea un elemento array
            if (element.married) {



                var obj = {
                    "id": ids,
                    "firstName": element.married.firstName,
                    "lastName": element.married.lastName,
                    "relative": element.married.relative
                }

                //setDataTable(obj);
                table_data.push(obj);
                render++;
                ids++;




            }

        }

    }



    const [show, setShow] = useState(false);
    const [showExecutor, setShowExecutor] = useState(false);


       //saves data for relatives table 
    const handleClose = () => {
        setShow(false);
        const modalData = getHumanData();
        const idpointer = ids;
        var obj = {
            "id": idpointer,
            "firstName": modalData.firstName,
            "lastName": modalData.lastName,
            "relative": modalData.relative
        }
        table_data.push(obj);
        //  setDataTable(table_spoon);
        relativesObj.push(modalData);
        ids +=1;

    }
    const handleShow = () => {
        setShow(true);

    }

    const addExecutor = () => {

    }
    const handleCloseNosave = () => {
        setShow(false);
    }

    const handleCloseNosaveE = () => {
        setShowExecutor(false);
    }
    const handleCloseE = () => {
        setShowExecutor(false);
    }

    const handleShowE = (exe) => {


        selectedExecutor = exe;
        setShowExecutor(true);

        const names = exe.firstName + " " + exe.lastName + " -> " + exe.relative;
        selected_executor = names;


    }

    //function to get data from executor and place it in a table

    const handleCloseExecutor = () => {

        setShowExecutor(false);
        const pointer = executorPriority;

        var obj = {
            "id": pointer,
            "firstName": selectedExecutor.firstName,
            "lastName": selectedExecutor.lastName,
            "relative": selectedExecutor.relative
        }
        
        table_dataExecutor.push(obj);
        executorsObj = table_dataExecutor;
        //setDataTableExecutor(selectedExecutor)
        executorPriority += 1;
      
        setDataExecutor(1)


    }


    const handleDelete = (id) => {
        //functiono should pop from table_dataExecutor and render again
       
        table_dataExecutor = table_dataExecutor.filter(obj => obj.id !== id);

        var obj = table_dataExecutor;
        setDataTableExecutor(obj);
        
        executorPriority -= 1;

       
    }







    return (
        <>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Relative</th>
                        <th>Select</th>
                    </tr>
                </thead>
                <tbody>

                    {

                        table_data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.firstName}</td>
                                <td>{item.lastName}</td>
                                <td>{item.relative}</td>
                                <td><Button variant="info" size="sm" onClick={() => handleShowE(item)}>Select Executor</Button></td>
                            </tr>
                        ))}


                </tbody>
            </Table>
            <div className="d-grid gap-2">
                <Button variant="success" size="lg" onClick={handleShow}>
                    Add more relatives
                </Button>
            </div>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Relative</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>

                    {

                        table_dataExecutor.map((item, index) => (
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




            <Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Person</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <AddHuman human={true} />


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleCloseNosave}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleClose}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showExecutor} onHide={handleCloseE}>
                <Modal.Header closeButton>
                    <Modal.Title>Selecting Executor</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <p>are you sure do you want to add the following executor?</p>
                    <p>{selected_executor} </p>


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleCloseE}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleCloseExecutor}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>




        </>




    );
}
export default HumanTable;