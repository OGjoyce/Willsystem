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


import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';

var ArrObj = [];
const View = () => {
    const [objStatuses, setObjStatuses] = useState([]);
    const [packageValue, setPackageValue] = useState('');
    const [results, setResults] = useState([]);

    const showDoms = (id) => {
        return true;
    }
    const handleSearch = async () => {
        const response = await axios.get('/api/files/search', {
            params: { owner: packageValue }
        });
        console.log(response.data);
        const length = response.data.length;
        for (const element of response.data) {
            debugger;
            let backendData =element;
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
                        <Container style={{ padding: "10px" }}>
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
                                        <th>Watch Files</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        ArrObj.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.id}</td>
                                                <td>{item.email}</td>
                                                <td>{item.name}</td>
                                                <td>{item.created}</td>
                                                <td>{item.updated}</td>
                                                <td>
                                                    <Button variant="outline-warning" size="sm" onClick={() => showDoms(item.id)}><i class="bi bi-eye"></i>View Documents</Button>
                                                </td>
                                            </tr>
                                        ))
                                    }




                                </tbody>
                            </Table>
                        </Container>

                        <div>
                            {/* <input
                                type="text"
                                value={packageValue}
                                onChange={(e) => setPackageValue(e.target.value)}
                                placeholder="Search by package" />
                            <button onClick={handleSearch}>Search</button> */}
                            <ul>
                                {/* {results.map(file => (
                                    <li key={file.id}>{file.details.packages}</li>
                                ))} */}
                            </ul>
                        </div>
                    </div></div></div>


        </AuthenticatedLayout></>

    );
};

export default View;