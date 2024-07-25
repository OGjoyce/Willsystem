import React, { useState, useEffect } from 'react';
import ObjStatusForm from '@/Components/ObjStatusForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Image from 'react-bootstrap/Image';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, Head, router } from '@inertiajs/react';
import axios from 'axios';

import PDFEditor from '@/Components/PDF/PDFEditor';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import WillContent from '@/Components/PDF/Content/WillContent'
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';

import Modal from 'react-bootstrap/Modal';


var ArrObj = [];
let selectedData;
let allDataFetched;
let currIdSelected = 0
var finalSelection = [];
const View = () => {
    const [objStatuses, setObjStatuses] = useState([]);
    const [packageValue, setPackageValue] = useState('');
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);
    const [docSelected, setDocSelected] = useState("");
    const [idSelected, setIdSelected] = useState("");
    const handleClose = () => {

        setShow(false);

    }
    function searchById(file) {

        console.log(file);
        var selectedInformation = {};
        console.log(allDataFetched);

        allDataFetched.forEach(function (arrayItem) {
            if (arrayItem.id == idSelected) {
                selectedInformation = arrayItem.information;
            }
        });
        console.log("Selected information");
        console.log(selectedInformation);
        finalSelection = selectedInformation;
        setDocSelected(file);


    }

    const handleShow = (id) => {
        setIdSelected(id);
        currIdSelected = id;
        setShow(true);
    }

    const showDoms = (id) => {
        return true;
    }
    const saveData = (idItem) => {
        const dataFetchedLarge = allDataFetched.length;
        var obj = [];
        for (let i = 0; i < dataFetchedLarge; i++) {
            if (allDataFetched[i].id == idItem) {
                obj = allDataFetched[i].information;
            }
        }

        localStorage.setItem('fullData', JSON.stringify(obj));
        localStorage.setItem('currentPointer', obj.length.toString());
        localStorage.setItem('currIdObjDB', idItem);

        window.location.href = '/personal';


    }
    const handleSearch = async () => {
        const response = await axios.get('/api/files/search', {
            params: { owner: packageValue }
        });
        console.log(response.data);
        allDataFetched = response.data;
        const length = response.data.length;
        for (const element of response.data) {
            let backendData = element;
            let createdat = backendData.created_at;
            let updatedat = backendData.updated_at;
            let owner = backendData.information[0].owner;
            let id = backendData.id;
            let name = backendData.information[0].personal.fullName;
         
            var obj = {
                "id": id,
                "created": createdat,
                "updated": updatedat,
                "email": owner,
                "name": name,
                "leng": element.information.length
            }
            ArrObj.push(obj);
        }


        setResults(obj);

    };
    useEffect(() => {
        axios.get('/api/obj-statuses')
            .then(response => {
                setObjStatuses(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    return (


        <><AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"View Files"}</h2>}
        >
            <Head title={"Welcome, Admin"} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>
                        {
                            docSelected != "" ?
                                <PDFEditor
                                    ContentComponent={
                                        docSelected === 'Will' ? WillContent :
                                            docSelected === 'POA1' ? POA1Content :
                                                POA2Content
                                    }
                                    datas={finalSelection}
                                />
                                :
                                <><Container style={{ padding: "10px" }}>
                                    <Form>
                                        <Row>
                                            <Col sm={8}>
                                                <Form.Group className="mb-3" controlId="emailid">
                                                    <Form.Control onChange={(e) => setPackageValue(e.target.value)} type="email" placeholder="the owner of the will..." />
                                                </Form.Group>


                                            </Col>
                                            <Col sm={4}>
                                                <Button onClick={handleSearch} type='button' className='outline-dark'>Search</Button>

                                            </Col>
                                        </Row>
                                    </Form>
                                    <br></br>
                                    <br></br>
                                    <p>Please, search by email of the owner of the will, then search it on the table</p>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>File id</th>
                                                <th>Email</th>
                                                <th>Name</th>
                                                <th>Created</th>
                                                <th>Last Modification</th>
                                                <th>Step</th>
                                                <th>Edit Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ArrObj.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.id}</td>
                                                    <td>{item.email}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.created}</td>
                                                    <td>{item.updated}</td>
                                                    <td>{item.leng}/16</td>
                                                    <td>
                                                        {
                                                            item.leng > 15 ?
                                                                <Button variant="outline-warning" size="sm" onClick={() => handleShow(item.id)}><i class="bi bi-eye"></i>View Documents</Button>

                                                                :
                                                                <Button variant="outline-info" size="sm" onClick={() => saveData(item.id)}><i class="bi bi-eye"></i>Continue Editing</Button>


                                                        }



                                                    </td>
                                                    <td>


                                                    </td>
                                                </tr>
                                            ))}




                                        </tbody>
                                    </Table>
                                </Container><Modal show={show} onHide={handleClose}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Select the document you want to see then click Go</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Row className="mt-3">
                                                <Col>
                                                    <Button onClick={() => searchById('Will', show)} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-file-text"></i> Will</Button>
                                                </Col>
                                                <Col>
                                                    <Button onClick={() => searchById('POA1', show)} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-house"></i> POA1 Property</Button>
                                                </Col>
                                                <Col>
                                                    <Button onClick={() => searchById('POA2', show)} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-hospital"></i> POA2 Health</Button>
                                                </Col>
                                            </Row>



                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button variant="secondary" onClick={handleClose}>
                                                Close
                                            </Button>
                                            <Button variant="primary" onClick={handleClose}>
                                                Go
                                            </Button>
                                        </Modal.Footer>
                                    </Modal></>


                        }



                    </div></div></div>




        </AuthenticatedLayout></>

    );
};

export default View;