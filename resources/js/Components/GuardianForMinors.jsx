
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { useState } from 'react'

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import Modal from 'react-bootstrap/Modal';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import DropdownButton from 'react-bootstrap/DropdownButton';
import { Container, Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';
import { InputGroup } from 'react-bootstrap';


var identifiers_names = [];
var priorityInformation = [1, 2, 3, 4, 5]
var bequestindex = 1;
var backupBeneficiaryData = [];
var all_data;

export function getGuardiansForMinors() {
    return backupBeneficiaryData;
}

export default function GuardianForMinors({ datas }) {
    const [firstRender, setFirstRender] = useState(true);
    var [selected, setSelected] = useState(null);
    var [priority, setPriority] = useState(0);
    var [tableData, setTableData] = useState([]);




    const handleSelectBeneficiary = (key, eventKey) => {

        setSelected(key);

    }
    const handleSelectPriority = (key) => {
        setPriority(key);

    }
    const AddGuardianButton = () => {
        var objtopush = {
            "id": bequestindex,
            "guardian": selected,
            "position": priority,

        }
        backupBeneficiaryData.push(objtopush);
        setTableData(objtopush);
        bequestindex += 1;

    }
    const handleDelete = (itemId) => {
        backupBeneficiaryData = backupBeneficiaryData.filter(obj => obj.id !== itemId);

        var obj = backupBeneficiaryData;
        setTableData(obj);

        bequestindex -= 1;
    }

    all_data = datas;

    if (all_data != null && firstRender) {


        const married = all_data[2].married;
        const kids = all_data[4].kids;
        const relatives = all_data[5].relatives;
        const kidsq = all_data[3].kidsq.selection;


        var dataobj = {}
        dataobj = {
            married, kids, relatives
        }

        var married_names = married.firstName + " " + married.lastName;
        if (kidsq == "true") {
            var kids_names = kids.firstName + " " + kids.lastName;
            for (let child in kids) {
                const names = kids[child].firstName + " " + kids[child].lastName;
                // identifiers_names.push(names);
            }


        }
        else {


        }
        identifiers_names.push(married_names);



        for (let key in relatives) {
            const names = relatives[key].firstName + " " + relatives[key].lastName;
            identifiers_names.push(names);
        }

        setFirstRender(false);


    }
    return (
        <>
            <Container>
                <Form>
                    <Row>
                        <Col sm={12}>
                            <p>Select the guardian for your childs</p>
                        </Col>
                    </Row>
                    <br>
                    </br>
                    <br></br>
                    <Row>
                        <Col sm={12}>
                            <Dropdown onSelect={handleSelectBeneficiary} style={{ width: "100%" }}>
                                <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="dropdown-basic">
                                    Select Relative
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {identifiers_names.map((option, index) => (
                                        <Dropdown.Item key={index} eventKey={option} style={{ width: "100%" }}>
                                            {option}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>

                        </Col>
                    </Row>

                    <br>
                    </br>
                    <br></br>
                    <Row>
                        <Col sm={12}>
                            <Dropdown onSelect={handleSelectPriority} style={{ width: "100%" }}>
                                <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="dropdown-basic">
                                    Select Priority
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {priorityInformation.map((option, index) => (
                                        <Dropdown.Item key={index} eventKey={option}>
                                            {option}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>


                        </Col>
                    </Row>
                    <br>
                    </br>
                    <br></br>
                    <Row>
                        <Col sm={12}>
                            <Button style={{ width: "100%" }} variant="outline-success" onClick={() => AddGuardianButton()} >Add Guardian</Button>
                        </Col>
                    </Row>
                    <br>
                    </br>
                    <br></br>



                </Form>
            </Container>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>id</th>
                        <th>Guardian</th>
                        <th>Position</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {backupBeneficiaryData.length === 0 ? (
                        <tr>
                            <td colSpan="4">
                                No information added yet, press <b>"Add Guardian Button"</b> to add.
                            </td>
                        </tr>
                    ) : (
                        backupBeneficiaryData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.id}</td>
                                <td>{item.guardian}</td>
                                <td>{item.position}</td>
                                <td>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </>
    );
}