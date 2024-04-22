
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
var ids = 0;
var selected_executor = "";

function HumanTable({ id, datas }) {

    // var table_data = [];
    var table_spoon = [];
    const [table_data, setDataTable] = useState([]);
    const [data, setData] = useState([]);
    const [arrItem, setArrItem] = useState('');
    const [itemToAdd, setItemToAdd] = useState([]);
    const [modalSelector, setModalSelector] = useState(0);


    const [srNo, setSrNo] = useState(1);
    const addToArrFunction = () => {
        setItemToAdd([...itemToAdd, { id: srNo, value: arrItem }]);
        setArrItem('');
        setSrNo(srNo + 1);
    };
    const addToTable = (x) => {
        // setData([...data, ...x]); 
    };

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

    const handleClose = () => {
        setShow(false);
        const modalData = getHumanData();
        var obj = {
            "id": ids,
            "firstName": modalData.firstName,
            "lastName": modalData.lastName,
            "relative": modalData.relative
        }
        table_data.push(obj);
        //  setDataTable(table_spoon);
        ids++;

    }
    const handleShow = () => {
        setShow(true);

    }

    const addExecutor = () =>{
        
    }
    const handleCloseNosave = () =>{
        setShow(false);
    }

    const handleCloseNosaveE = () =>{
        setShowExecutor(false);
    }
    const handleCloseE = () => {
        setShowExecutor(false);
    }

    const handleShowE = (exe) => {

        setShowExecutor(true);
        const names = exe.firstName + " " + exe.lastName + " -> " + exe.relative;
        selected_executor = names;
       
     
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
                                <td><Button variant="secondary" size="sm" onClick={()=> handleShowE(item)}>Select Executor</Button></td>
                            </tr>
                        ))}


                </tbody>
            </Table>
            <div className="d-grid gap-2">
                <Button variant="primary" size="lg" onClick={handleShow}>
                    Add more relatives
                </Button>
            </div>



            <Modal show={show} onHide={handleCloseNosave}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Person</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    
                    <AddHuman human={true} />


                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary"  size="sm" onClick={handleCloseNosave}>
                        Close
                    </Button>
                    <Button variant="primary"  size="sm" onClick={handleClose}>
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
                    <Button variant="secondary"  size="sm" onClick={handleCloseE}>
                        Close
                    </Button>
                    <Button variant="primary"  size="sm" onClick={handleCloseE}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>




        </>




    );
}
export default HumanTable;