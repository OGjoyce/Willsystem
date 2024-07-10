
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

var selected_value = "";
var render = 0;
var ids = 1;
var idtable = 1;
var guardianDataStack = [];

export function getPetInfo() {
    return guardianDataStack
}

function Pets({ datas }) {
    const [selectedOptionGuardian, setSelectedOptionGuardian] = useState('');
    const [selectedOptionBackup, setSelectedOptionBackup] = useState('');
    var [petGuardianData, setPetGuardianData] = useState([]);
    const handleSubmit = (e) => {
        var amountid = document.getElementById('amountId').value;
        if (amountid != "" || amountid != null) {
            amountid = parseFloat(amountid);
        }
        var obj = {
            "id": idtable,
            "guardian": selectedOptionGuardian,
            "backup": selectedOptionBackup,
            "amount": amountid
        }
        if (guardianDataStack.length == 0) {
            guardianDataStack.push(obj);
            setPetGuardianData(guardianDataStack);
            idtable++;

        }


    };
    const handleDelete = (id) => {

        guardianDataStack = guardianDataStack.filter(obj => obj.id !== id);
        var obj = guardianDataStack;
        setPetGuardianData(obj);

        idtable -= 1;



    }
    var table_spoon = [];
    var [table_data, setDataTable] = useState([]);
    const [data, setData] = useState([]);


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
                if (element.married.relative != "NA") {

                    table_data.push(obj);
                    const exactObj = table_data;
                    setDataTable(exactObj);
                    render++;
                    ids++;
                }





            }


        }

        if (datas[3].kidsq.selection == "true") {
            var largo = Object.keys(datas[4].kids).length;

            for (let index = 0; index < largo; index++) {
                const child = datas[4].kids[index];
                var obj = {
                    "id": ids,
                    "firstName": child.firstName,
                    "lastName": child.lastName,
                    "relative": child.relative
                }
                table_data.push(obj);
                const exactObj = table_data;
                setDataTable(exactObj);
                render++;
                ids++;
            }
        }


    }


    return (
        <>
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="6">
                        <Form >
                            <Form.Group controlId="formGuardian">
                                <Form.Label>Select Primary Guardian </Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedOptionGuardian}
                                    onChange={(e) => setSelectedOptionGuardian(e.target.value)}
                                    size="lg"
                                >
                                    <option value="">Choose...</option>
                                    {table_data.map((name, index) => (
                                        <option key={index} value={`${name.firstName} ${name.lastName}`}>
                                            {name.firstName + ' ' + name.lastName}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="formBackup">
                                <Form.Label>Select Backup </Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedOptionBackup}
                                    onChange={(e) => setSelectedOptionBackup(e.target.value)}

                                >
                                    <option disabled="true" value="" >Choose...</option>
                                    {table_data.map((name, index) => (
                                        <option key={index} value={`${name.firstName} ${name.lastName}`}>
                                            {name.firstName + ' ' + name.lastName}
                                        </option>
                                    ))}
                                </Form.Control>

                            </Form.Group>
                            <br></br>
                            <Form.Group controlId="formAmount">
                                <FloatingLabel controlId="floatingNumber" label="Enter the Amount in $">
                                    <Form.Control size="sm" type="number" placeholder="0.00" id="amountId" />
                                </FloatingLabel>
                            </Form.Group>
                            <br></br>
                            <Button size="lg" variant="outline-primary" style={{ width: "100%" }} onClick={handleSubmit}>
                                Add
                            </Button>
                        </Form>
                    </Col>
                </Row>
                <br></br>
                {

                    petGuardianData.length > 0 ?
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <td>Id</td>
                                    <th>Guardian</th>
                                    <th>Backup</th>
                                    <th>Amount</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody>

                                {

                                    guardianDataStack.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id}</td>
                                            <td>{item.guardian}</td>
                                            <td>{item.backup}</td>
                                            <td>{item.amount}</td>
                                            <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                                        </tr>
                                    ))}


                            </tbody>
                        </Table>

                        :
                        <p>Add guardian to see information...</p>
                }


            </Container>
        </>

    );
}
export default Pets;