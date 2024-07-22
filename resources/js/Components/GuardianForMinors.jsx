
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { useState, useEffect } from 'react'

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

export default function GuardianForMinors({ datas, errors }) {
    const [firstRender, setFirstRender] = useState(true);
    var [selected, setSelected] = useState(null);
    var [priority, setPriority] = useState(0);
    var [tableData, setTableData] = useState([]);
    var [validationErrors, setValidationErrors] = useState(errors)

    useEffect(() => {
        setValidationErrors(errors)
    }, [errors])

    const handleSelectBeneficiary = (key, eventKey) => {
        setValidationErrors({})
        setSelected(key);

    }
    const handleSelectPriority = (key) => {
        setValidationErrors({})
        setPriority(key);

    }
    const AddGuardianButton = () => {
        setValidationErrors({})
        var objtopush = {
            "id": bequestindex,
            "guardian": selected,
            "position": parseInt(priority),

        }


        let newErrors = {};
        if (selected === null || priority === 0) {
            if (selected === null) {
                newErrors.selected = 'A relative selection is required';
            }
            if (priority === 0) {
                newErrors.priority = 'A priority selection is required';
            }
            setValidationErrors(newErrors);
            return null;
        }


        backupBeneficiaryData.push(objtopush);
        setTableData({ ...tableData, [objtopush.id]: objtopush });
        setPriority(0)
        setSelected(null)
        bequestindex += 1;

    }
    const handleDelete = (itemId) => {
        backupBeneficiaryData = backupBeneficiaryData.filter((obj) => obj.id !== itemId);
        const updatedTableData = { ...tableData };
        delete updatedTableData[itemId];
        setTableData(updatedTableData);

    }

    all_data = datas;

    if (all_data != null && firstRender) {


        const married = all_data[2].married;
        const kids = all_data[4].kids;
        const relatives = all_data[5].relatives;
        const kidsq = all_data[3].kidsq?.selection;


        var dataobj = {}
        dataobj = {
            married, kids, relatives
        }

        var married_names = married?.firstName + " " + married?.lastName;
        if (kidsq == "true") {
            var kids_names = kids?.firstName + " " + kids?.lastName;
            for (let child in kids) {
                const names = kids[child]?.firstName + " " + kids[child]?.lastName;
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

    const filteredIdentifiersNames = identifiers_names.filter(
        (name) => !backupBeneficiaryData.some((item) => item.guardian === name)
    );

    const filteredPriorityInformation = priorityInformation.filter(
        (priority) => !backupBeneficiaryData.some((item) => parseInt(item.position) === priority)
    );


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
                                    {selected !== null ? selected : 'Select Relative'}
                                </Dropdown.Toggle>
                                {validationErrors.selected && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.selected}</p>}
                                <Dropdown.Menu>
                                    {filteredIdentifiersNames.map((option, index) => (
                                        <Dropdown.Item key={index} eventKey={option} style={{ width: '100%' }}>
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
                                    {priority !== 0 ? `Selected Priority: ${priority}` : 'Select Priority'}
                                </Dropdown.Toggle>
                                {validationErrors.priority && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.priority}</p>}

                                <Dropdown.Menu>
                                    {filteredPriorityInformation.map((option, index) => (
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
                {validationErrors.guardians && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.guardians}</p>}
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