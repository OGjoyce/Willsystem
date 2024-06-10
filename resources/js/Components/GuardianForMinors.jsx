
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
import { Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';
import { InputGroup } from 'react-bootstrap';

var identifiers_names = [];
var priorityInformation = [1, 2, 3, 4, 5]
var bequestindex = 0;
var backupBeneficiaryData = [];
var all_data;

export function getGuardiansForMinors(){
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

            <Form>
                <p>Select the guardian for your childs</p>
                <Form.Group className="mb-3">
                    <DropdownButton
                        size="lg"
                        variant="outline-dark"
                        id="guardianSelector"
                        title={selected != null ? selected : 'Select the Guardian'}
                        onSelect={handleSelectBeneficiary}
                    >
                        {identifiers_names.map((option, index) => (
                            <Dropdown.Item key={index} eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Form.Group>

                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <DropdownButton
                        size="lg"
                        variant="outline-dark"
                        id="prioritySelector"
                        title={'Select priority'}
                        onSelect={handleSelectPriority}
                    >
                        {priorityInformation.map((option, index) => (
                            <Dropdown.Item key={index} eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton>
                </Form.Group>
                <Button variant="outline-success" onClick={() => AddGuardianButton()} >Add Guardian</Button>
            </Form>

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

                    {
                        backupBeneficiaryData.length == 0 ?
                            <p>No information added yet, press <b>"Add Guardian Button"</b> to add</p>
                            :
                            backupBeneficiaryData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.id}</td>
                                    <td>{item.guardian}</td>
                                    <td>{item.position}</td>
                                    <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                                </tr>
                            ))
                    }


                </tbody>
            </Table>
        </>
    );
}