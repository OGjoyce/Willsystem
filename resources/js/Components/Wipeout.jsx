
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



export function getBequestArrObj() {
    return bequestArrObj;
}
var bequestindex = 0;
var identifiers_names = [];
function Wipeout({ id, datas }) {
    var [selected, setSelected] = useState(obj);
    var [custom, setCustom] = useState(false);
    var [specific, setSpecific] = useState(false);
    var [selectedRecepient, setSelectedRecepient] = useState("Select a recepient to continue...");
    var [firstRender, setFirstRender] = useState(false);
    const [open, setOpen] = useState(false);
    var [table_dataBequest, setTable_dataBequest] = useState([]);
    let all_data = datas;
    if (!firstRender) {
        setFirstRender(true);
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


        var options = ['Have the residue go to parents and siblings per stirpes',
            '50% to parents and siblings and 50% to parents and siblings of spouse',
            '50% to siblings and 50% to siblings of spouse',
            'Wipeout Beneficiary'

        ]
        var obj = {
            options: options, // Your array of string values
            selectedOption: null,
        };
        
        setSelected(obj);
        console.log(selected);
    }




    const [selectedOption, setSelectedOption] = useState('');

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };





    const handleDelete = (itemId) =>
        {
            table_dataBequest = table_dataBequest.filter(obj => obj.id !== itemId);
    
            var obj = table_dataBequest;
            setTable_dataBequest(obj);
            
            bequestindex -= 1;
        }
        
    const handleAddItem = () =>
        {
           
            setOpen(true);

            var beneficiary = selectedRecepient;
            var backup = selectedOption;
            var shares = document.getElementById('shares').value;
            var obj = 
            {
             "id": bequestindex,
             "names": beneficiary,
             "shares": shares,
             "backup": backup
            }
            table_dataBequest.push(obj);
            debugger;

        }

    const handleSelect = (key, eventKey) => {

        setSelected({ ...selected, selectedOption: key });
        if (key == "Wipeout Beneficiary") {
            setCustom(true);
        }
        else {
            setCustom(false);
        }

    }
    const setCurrentRecepient = (eventKey) => {
        setSelectedRecepient(eventKey);
    };


    return (
        <>
            {
                firstRender ?
                    <><DropdownButton
                        id="dropdown-basic-button"
                        title={'select an option'}
                        onSelect={handleSelect}
                    >
                        {selected.options.map((option, index) => (
                            <Dropdown.Item key={index} eventKey={option}>
                                {option}
                            </Dropdown.Item>
                        ))}
                    </DropdownButton><p style={{ color: "gray" }}> If you don't add a backup, then inheritance is per stirpes (if a person is deceased, their children will get their share equally. If one of their children is deceased and has children of their own, their children (testator's grandchildren) will get their share equally)</p></>

                    :
                    null

            }

            {
                custom ?

                    <><Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <DropdownToggle variants="success" caret id="size-dropdown">
                            Select Beneficiary
                        </DropdownToggle>
                        <DropdownMenu>
                            {identifiers_names.map(size => (
                                <DropdownItem eventKey={size}>{size}</DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                        <Form>
                            <Form.Group className="mb-3" controlId="organization">
                                <Form.Label>Or Organization</Form.Label>
                                <Form.Control type="text"  />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="shares">
                                <Form.Label>Shares %</Form.Label>
                                <Form.Control type="number"  />
                            </Form.Group>

                            <Form.Check
                                type="radio"
                                label="Per Stirpes"
                                name="checkboxOptions"
                                value="Per Stirpes"
                                checked={selectedOption === 'Per Stirpes'}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                label="Per Capita"
                                name="checkboxOptions"
                                value="Per Capita"
                                checked={selectedOption === 'Per Capita'}
                                onChange={handleOptionChange}
                            />
                            <Button  variant="success" size="sm" onClick={() => handleAddItem()}> Add Beneficiary</Button>
                        </Form></>


                    :
                    null
            }
            <Collapse in={open}>
                <div id="example-collapse-text">
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Names</th>
                                <th>backup</th>
                                <th>Shares</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                table_dataBequest.length == 0 ?
                                    <p>No information added yet, press "Add Recepient Button" to add.</p>
                                    :
                                    table_dataBequest.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.id}</td>
                                            <td>{item.names}</td>
                                            <td>{item.backup}</td>
                                            <td>{item.shares}</td>
                                            <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                                        </tr>
                                    ))
                            }


                        </tbody>
                    </Table>
                </div>
            </Collapse>






        </>




    );
}
export default Wipeout;