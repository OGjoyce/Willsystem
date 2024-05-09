
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
import { Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';



var all_data;
var identifiers_names = [];
var bequestArrObj = [];
var bequestindex = 0;
var globalCounter = 0;

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas }) {

    const [show, setShow] = useState(false);
    const [showExecutor, setShowExecutor] = useState(false);
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    var [table_dataBequest, setTable_dataBequest] = useState([]);
    var [selectedRecepient, setSelectedRecepient] = useState("Select a recepient to continue...");
    const [readOnly, setReadOnly] = useState(false);

    const reviewBequestSum = (index) =>
    {
        var counter = 0;
        var obj = table_dataBequest[index];


    }
    const addRecepient = () =>
    {
        var bequest, selected, shares;
        bequest = document.getElementById('bequestTextArea').value;
        selected = selectedRecepient;
        shares = document.getElementById('sharesID').value;
        if (bequest != "" && selected != "false" && (shares != "") && (shares > 0 && shares <= 100)) 
        {
           //add to table ... set a hook
           
           var obj = 
           {
            "id": bequestindex,
            "names": selected,
            "shares": shares,
            "bequest": bequest
           }
           

           document.getElementById('sharesID').value = "";
           setSelectedRecepient("Select other Recepient...");
           var globalSemaphore = 0;
           globalSemaphore = globalCounter;
           globalCounter += Number(shares);
           const sum = reviewBequestSum(bequestindex);
          console.log(globalCounter);
           if(globalCounter > 100){
            console.log("Amount of shares should be less or equal than 100");
            globalCounter = globalSemaphore;

           }
           else if(globalCounter < 100){
            setReadOnly(true);
            if(!open){
                setOpen(true);
            }
            
            table_dataBequest.push(obj);
           bequestArrObj.push(obj);
               
           }
           else if(globalCounter == 100){
            table_dataBequest.push(obj);
            bequestArrObj.push(obj);
            console.log("100");
            setReadOnly(false);
            globalCounter = 0;
            bequestindex +=1;
            document.getElementById('bequestTextArea').value = "";
           }
           

          


        
        }





    }
    function addAnotherRelative() {
        const newrelative = getHumanData();
        const names = newrelative.firstName + " " + newrelative.lastName;
        identifiers_names.push(names);
        
        let len = Object.keys(datas[5].relatives).length;
        datas[5].relatives[len] = newrelative;
        console.log(datas);


    }
    function finishBequest() {
       
        var flag = false;
        //sum by id
        var sum = sumValuesBySameIds(table_dataBequest);
        let len = Object.keys(sum).length;
        for (let index = 0; index <len; index++) {
            if(sum[index] != 100){
                alert("Please fix the bequest with id: "+index);
                flag = true;

            }
            
        }
        if(!flag){
            bequestArrObj = table_dataBequest;

        }
        else{

        }



    }
   
    function sumValuesBySameIds(containerObject) {
        let sums = {};
        // Loop through each object in the containerObject
        containerObject.forEach(obj => {
            // If the id already exists in sums, add the value to the sum
            if (sums.hasOwnProperty(obj.id)) {
                sums[obj.id] += parseFloat(obj.shares);
            } 
            // Otherwise, initialize the sum for this id
            else {
                sums[obj.id] = parseFloat(obj.shares);
            }
        });
    
        return sums;
    }
    const setCurrentRecepient = (eventKey) => {
        setSelectedRecepient(eventKey);
    };

    //saves data for relatives table 
    const handleClose = () => {
        setShow(false);
        addAnotherRelative();

    }

    const handleCloseNosave = () => {
        setShow(false);
    }

    const handleShow = () => {
        console.log("nice");
        setShow(true);

    }
    const handleDelete = (itemId) =>
    {
        table_dataBequest = table_dataBequest.filter(obj => obj.id !== itemId);

        var obj = table_dataBequest;
        setTable_dataBequest(obj);
        
        bequestindex -= 1;
    }


    all_data = datas;

    if (all_data != null && firstRender) {
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

        var dataobj = {}
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

        setFirstRender(false);


    }









    return (
        <>


            <Form>
                <Form.Group className="mb-3" controlId="bequestTextArea">
                    <Form.Label>Bequest</Form.Label>
                    <Form.Control as="textarea" rows={3} placeholder="(i.e... Gold chain...)" readOnly={readOnly} />
                </Form.Group>


                <Row >
                    <Col md="auto">

                        <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient} >
                            <DropdownToggle variants="success" caret id="size-dropdown">
                                Select Recepient
                            </DropdownToggle>
                            <DropdownMenu>
                                {identifiers_names.map(size => (
                                    <DropdownItem eventKey={size}>{size}</DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                    <Col md="auto" style={{ border: "1px solid black" }}>
                        {
                            selectedRecepient == "false" ?
                                null
                                :
                                <p>Selected Recepient:<b> {selectedRecepient} </b></p>
                        }
                    </Col>

                </Row>


                <Form.Group className="mb-3" controlId="sharesID">
                    <Form.Label>The total shares should be equal to 100% </Form.Label>
                    <Form.Control type="number" placeholder="100%" />
                </Form.Group>

                <Button variant="outline-success" onClick={() => addRecepient()} >Add Recepient</Button>
                <Button variant="outline-info" onClick={() => handleShow()}>Add Another Relative</Button>
                <Button variant="outline-warning"  onClick={() => finishBequest()}>Finish Bequest</Button>

            </Form>
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                style={{ width: "80%", margin: "5%" }}
                variant="outline-dark"
            >
                See Bequest information
            </Button>
            <Collapse in={open}>
                <div id="example-collapse-text">
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Names</th>
                                <th>Bequest</th>
                                <th>Shares</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                table_dataBequest.length == 0?
                                <p>No information added yet, press "Add Recepient Button" to add.</p>
                                :
                                table_dataBequest.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.id}</td>
                                        <td>{item.names}</td>
                                        <td>{item.bequest}</td>
                                        <td>{item.shares}</td>
                                        <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                                    </tr>
                                ))
                            }


                        </tbody>
                    </Table>
                </div>
            </Collapse>



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



        </>




    );
}
export default Bequest;
