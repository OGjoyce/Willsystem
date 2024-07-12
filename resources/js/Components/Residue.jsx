
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
import { Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';
import { InputGroup } from 'react-bootstrap';



var identifiers_names = [];

var all_data;
var obj = {};
var backupBeneficiaryData = [];

var bequestindex = 1;

export function getOptObject() {
  var userSelection = obj.selectedOption;
  var returnobject = {};
  if (userSelection == "Specific Beneficiaries") {
    returnobject = {
      "selected": userSelection,
      "beneficiary": backupBeneficiaryData
    }

  }
  else if (userSelection == "CUSTOM CLAUSE (will override every other option)") {
    returnobject = {
      "selected": userSelection,
      "clause": obj.customClause
    }

  }
  else {
    returnobject = {
      "selected": userSelection
    }

  }
  return returnobject;
}


function Residue({ id, datas }) {
  const marriedStatus = datas[1].marriedq.selection === "true";
  const sosoStatus = datas[1].marriedq.selection === "soso";
  const hasKids = datas[3].kidsq.selection === "true";
  console.log('maried : ', marriedStatus)
  console.log('kids : ', hasKids)
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let newOptions = [
      'Have the residue go to parents then siblings per stirpes',
      'Have the residue go to siblings per stirpes',
      'Specific Beneficiaries',
      'CUSTOM CLAUSE (will override every other option)'
    ];

    if (marriedStatus || sosoStatus) {
      newOptions.unshift(`NO SPOUSAL WILL: Have the residue go to spouse ${hasKids ? 'first then children per stirpes' : ''}`);
    }

    if (hasKids) {
      newOptions.unshift(
        'Have the residue go to children per stirpes',
        'Have the residue go to children per capita'
      );
    }

    setOptions(newOptions);
  }, [marriedStatus, hasKids]);

  var [custom, setCustom] = useState(false);
  var [clauseValue, setClauseValue] = useState("this is  a custom clause");
  var [specific, setSpecific] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  var [table_dataBequest, setTable_dataBequest] = useState([]);


  if (firstRender) {
    obj = {
      options: options, // Your array of string values
      selectedOption: null,
      selectedBeneficiary: null,
      selectedBackup: null,
      customClause: null
    };
  }


  var [selected, setSelected] = useState(obj);




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
        identifiers_names.push(names);
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


  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };









  const handleDelete = (itemId) => {
    backupBeneficiaryData = backupBeneficiaryData.filter(obj => obj.id !== itemId);

    var obj = backupBeneficiaryData;
    setTable_dataBequest(backupBeneficiaryData);

    bequestindex -= 1;
  }



  const handleSelect = (key, eventKey) => {

    obj = { ...obj, selectedOption: key }


    if (key == "Specific Beneficiaries") {
      setSpecific(true);
      setCustom(false);

    }
    else if (key == "CUSTOM CLAUSE (will override every other option)") {

      setSpecific(false);
      setCustom(true);
      obj = { ...obj, customClause: clauseValue };
    }
    else {
      setSpecific(false);
      setCustom(false);
    }
    setSelected(obj);
  }

  const handleSelectBeneficiary = (key, eventKey) => {
    obj = { ...obj, selectedBeneficiary: key }
    setSelected(obj);

  }

  const handleSelectBackup = (key, eventKey) => {
    obj = { ...obj, selectedBackup: key }
    setSelected(obj);
  }
  const AddBackupButton = () => {
    var selectedOption = selected.selectedOption;
    var shares = document.getElementById('basic-url').value;
    shares = Number(shares);
    var beneficiary = selected.selectedBeneficiary;
    var backup = selected.selectedBackup;
    if (selectedOption == "A") {
      selectedOption = "Per Stirpes"

    }
    else {
      selectedOption = "Per Capita"
    }

    if (beneficiary != null && backup != null) {
      var objtopush =
      {
        "id": bequestindex,
        "beneficiary": beneficiary,
        "backup": backup,
        "type": selectedOption,
        "shares": shares
      }

    }
    else {
      alert("Please select beneficiary and backup")
    }

    //add to table ... set a hook
    backupBeneficiaryData.push(objtopush);
    setTable_dataBequest(objtopush);
    bequestindex++;


  }
  return (
    <>
      <Form.Group className="mb-3">
        <DropdownButton
          size="lg"
          variant="outline-dark"
          id="dropdown-basic-button"
          title={selected.selectedOption ? selected.selectedOption : 'Select an option'}
          onSelect={handleSelect}
        >
          {options.map((option, index) => (
            <Dropdown.Item key={index} eventKey={option}>
              {option}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </Form.Group>
      {
        specific ?
          <><p>Please select a benefeciary for the residue following with a backup beneficiary</p>
            <Form.Group className="mb-3">
              <DropdownButton
                size="lg"
                variant="outline-dark"
                id="dropdown-basic-button"
                title={selected.selectedBeneficiary != null ? selected.selectedBeneficiary : 'Select the beneficiary'}
                onSelect={handleSelectBeneficiary}
              >
                {identifiers_names.map((option, index) => (
                  <Dropdown.Item key={index} eventKey={option}>
                    {option}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>
            <Form.Group className="mb-3">
              <DropdownButton
                size="lg"
                variant="outline-dark"
                id="dropdown-basic-button"
                title={selected.selectedBackup != null ? selected.selectedBackup : 'Select the backup beneficiary'}
                onSelect={handleSelectBackup}
              >
                {identifiers_names.map((option, index) => (
                  <Dropdown.Item style={{ width: "100%" }} key={index} eventKey={option}>
                    {option}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>
            <Form>
              <Form.Check
                type="radio"
                label="per stirpes backup"
                name="options"
                value="A"
                checked={selectedOption === 'A'}
                onChange={handleOptionChange}
                id="optionA"
              />
              <Form.Check
                type="radio"
                label="per capita backup"
                name="options"
                value="B"
                checked={selectedOption === 'B'}
                onChange={handleOptionChange}
                id="optionB"
              />


              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon3">
                  Shares for backup
                </InputGroup.Text>
                <Form.Control id="basic-url" aria-describedby="basic-addon3" />
              </InputGroup>
            </Form>
            <Button variant="outline-success" onClick={() => AddBackupButton()} >Add Beneficiary Backup</Button>
            {/*  {
           "id": bequestindex,
           "beneficiary": beneficiary,
           "backup": backup,
           "type": selectedOption,
           "shares": shares
          } */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>id</th>
                  <th>beneficiary</th>
                  <th>backup</th>
                  <th>type</th>
                  <th>shares</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>

                {
                  backupBeneficiaryData.length == 0 ?
                    <p>No information added yet, press <b>"Add Beneficiary Backup Button"</b> to add</p>
                    :
                    backupBeneficiaryData.map((item, index) => (
                      <tr key={index}>
                        <td>{item.id}</td>
                        <td>{item.beneficiary}</td>
                        <td>{item.backup}</td>
                        <td>{item.type}</td>
                        <td>{item.shares}</td>
                        <td><Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button></td>
                      </tr>
                    ))
                }


              </tbody>
            </Table>



          </>
          :
          null
      }
      {
        custom ?
          <Form>
            <Form.Group className="mb-3" controlId="customTextArea">
              <Form.Label>Custom Clause</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={clauseValue}
                onChange={(e) => setClauseValue(e.target.value)}
              />
            </Form.Group>
          </Form>
          :
          null
      }






    </>




  );
}
export default Residue;
