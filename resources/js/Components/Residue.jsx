import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

var identifiers_names = [];
var all_data;
var obj = {};
var backupBeneficiaryData = [];
var bequestindex = 1;

export function getOptObject() {
  var userSelection = obj.selectedOption;
  var returnobject = {};
  if (userSelection === "Specific Beneficiaries") {
    returnobject = {
      "selected": userSelection,
      "beneficiary": backupBeneficiaryData
    };
  } else if (userSelection === "Custom Clause") {
    returnobject = {
      "selected": userSelection,
      "clause": obj.customClause
    };
  } else if (userSelection === null || undefined) {
    returnobject = {};
  }

  else {
    returnobject = {
      "selected": userSelection
    };
  }
  return returnobject;
}

function Residue({ id, datas, errors }) {
  const marriedStatus = datas[1].marriedq?.selection === "true";
  const sosoStatus = datas[1].marriedq?.selection === "soso";
  const hasKids = datas[3].kidsq?.selection === "true";

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [bloodlineOptions, setBloodlineOptions] = useState([]);
  const [custom, setCustom] = useState(false);
  const [specific, setSpecific] = useState(false);
  const [clauseValue, setClauseValue] = useState("");
  const [firstRender, setFirstRender] = useState(true);
  const [table_dataBequest, setTable_dataBequest] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selected, setSelected] = useState(obj);
  const [validationErrors, setValidationErrors] = useState(errors)
  const [availableShares, setAvailableShares] = useState(100)


  useEffect(() => {
    setValidationErrors(errors)
  }, [errors])

  useEffect(() => {
    let newBloodlineOptions = [
      'Have the residue go to parents then siblings per stirpes',
      'Have the residue go to siblings per stirpes',
    ];

    if (marriedStatus || sosoStatus) {
      newBloodlineOptions.unshift(`NO SPOUSAL WILL: Have the residue go to spouse ${hasKids ? 'first then children per stirpes' : ''}`);
    }

    if (hasKids) {
      newBloodlineOptions.unshift(
        'Have the residue go to children per stirpes',
        'Have the residue go to children per capita'
      );
    }

    setBloodlineOptions(newBloodlineOptions);
    if (selectedCategory === 'Bloodline Selection' || !selectedCategory) {
      setOptions(newBloodlineOptions);
    }
  }, [marriedStatus, hasKids, sosoStatus, selectedCategory]);

  useEffect(() => {
    if (firstRender && all_data != null) {
      const married = all_data[2].married;
      const kids = all_data[4].kids;
      const relatives = all_data[5].relatives;
      const kidsq = all_data[3].kidsq?.selection;

      var married_names = married?.firstName + " " + married?.lastName;
      identifiers_names.push(married_names);

      if (kidsq === "true") {
        for (let child in kids) {
          const names = kids[child]?.firstName + " " + kids[child]?.lastName;
          identifiers_names.push(names);
        }
      }

      for (let key in relatives) {
        const names = relatives[key].firstName + " " + relatives[key].lastName;
        identifiers_names.push(names);
      }

      setFirstRender(false);
    }
  }, [firstRender, all_data]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setValidationErrors({})
    if (category === 'Custom Selection') {
      setOptions(['Custom Clause', 'Specific Beneficiaries']);
    } else {
      setOptions(bloodlineOptions);
    }
    setCustom(false);
    setSpecific(false);
    obj = { ...obj, selectedOption: null };
    setSelected(obj);
  };

  const handleOptionSelect = (option) => {
    if (option === 'Custom Clause') {
      setCustom(true);
      setSpecific(false);
      obj = { ...obj, customClause: clauseValue };
    } else if (option === 'Specific Beneficiaries') {
      setSpecific(true);
      setCustom(false);
    } else {
      setCustom(false);
      setSpecific(false);
    }
    obj = { ...obj, selectedOption: option };
    setSelected(obj);
    setValidationErrors({})
  };

  const handleSelectBeneficiary = (key) => {
    obj = { ...obj, selectedBeneficiary: key };
    setSelected(obj);
  };

  const handleSelectBackup = (key) => {
    obj = { ...obj, selectedBackup: key };
    setSelected(obj);
  };

  const handleDelete = (itemId) => {
    backupBeneficiaryData = backupBeneficiaryData.filter(obj => obj.id !== itemId);
    setTable_dataBequest([...backupBeneficiaryData]);
    bequestindex -= 1;
    var totalShares = backupBeneficiaryData.length > 0
      ? 100 - backupBeneficiaryData?.map(backup => backup.shares).reduce((a, b) => a + b)
      : 100
    setAvailableShares(totalShares)
  };

  const AddBackupButton = () => {
    setValidationErrors({})
    var shares = document.getElementById('basic-url').value;
    shares = Number(shares);
    var totalShares = backupBeneficiaryData.length > 0
      ? shares + backupBeneficiaryData?.map(backup => backup.shares).reduce((a, b) => a + b)
      : shares

    var beneficiary = selected.selectedBeneficiary || null;
    var backup = selected.selectedBackup || null;
    var selectedType = selectedOption === 'A' ? "Per Stirpes" : null || selectedOption === 'B' ? "Per Capita" : null;

    if (beneficiary === null || backup === null) {
      setValidationErrors({ identifiers: 'Beneficiary and backup are required' })
      return null
    }

    if (beneficiary === backup) {
      setValidationErrors({ identifiers: "Beneficiary and backup can't be the same person" })
      return null
    }

    if (selectedType === null) {
      setValidationErrors({ backupType: 'Backup type is required' })
      return null
    }

    if (shares === 0) {
      setValidationErrors({ shares: 'Shares for backup must be a valid percent' })
      return null
    }

    if (!Number(shares)) {
      setValidationErrors({ shares: 'Shares for backup must be a Number' })
      return null
    }

    if (shares > 100 || totalShares > 100) {
      setValidationErrors({ shares: 'Shares for backup must be equal to 100%' })
      return null
    }


    var objtopush = {
      "id": bequestindex,
      "beneficiary": beneficiary,
      "backup": backup,
      "type": selectedType,
      "shares": shares
    };

    backupBeneficiaryData.push(objtopush);
    setTable_dataBequest([...backupBeneficiaryData]);
    bequestindex++;
    setAvailableShares(100 - totalShares)
    obj = { ...obj, selectedBeneficiary: null };
    obj = { ...obj, selectedBackup: null };
    setSelected(obj);
    document.getElementById('basic-url').value = '';

  };

  all_data = datas;

  return (
    <Container>
      <Form>

        <Row>
          <Col sm={12}>
            <Dropdown onSelect={handleCategorySelect} style={{ width: "100%" }}>
              <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="category-dropdown">
                {selectedCategory !== null ? selectedCategory : 'Select Residue'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="Bloodline Selection">Bloodline Selection</Dropdown.Item>
                <Dropdown.Item eventKey="Custom Selection">Custom Selection</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </Col>
        </Row>
        {selectedCategory && (
          <Row>
            <Col sm={12}>
              <Dropdown onSelect={handleOptionSelect} style={{ width: "100%" }}>
                <Dropdown.Toggle style={{ width: "100%" }} variant="outline-dark" id="category-dropdown">
                  {obj.selectedOption !== null ? obj.selectedOption : 'Select an Option'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {options.map((option, index) => (
                    <Dropdown.Item key={index} eventKey={option}>
                      {option}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        )}

        {specific && (
          <>
            <Row>
              <Col sm={12}>
                <p>Please select a beneficiary for the residue following with a backup beneficiary</p>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Form.Group className="mb-3">
                  <ButtonGroup style={{ width: '100%' }}>
                    <DropdownButton
                      style={{ width: '100%' }}
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
                  </ButtonGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Form.Group className="mb-3">
                  <ButtonGroup style={{ width: '100%' }}>
                    <DropdownButton
                      style={{ width: '100%' }}
                      size="lg"
                      variant="outline-dark"
                      id="dropdown-basic-button"
                      title={selected.selectedBackup != null ? selected.selectedBackup : 'Select the backup beneficiary'}
                      onSelect={handleSelectBackup}
                    >
                      {identifiers_names.map((option, index) => (
                        <Dropdown.Item key={index} eventKey={option}>
                          {option}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </ButtonGroup>
                </Form.Group>
                {validationErrors.identifiers && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.identifiers}</p>}
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Form>
                  <Form.Check
                    type="radio"
                    label="per stirpes backup"
                    name="options"
                    value="A"
                    checked={selectedOption === 'A'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    id="optionA"
                  />
                  <Form.Check
                    type="radio"
                    label="per capita backup"
                    name="options"
                    value="B"
                    checked={selectedOption === 'B'}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    id="optionB"
                  />
                  {validationErrors.backupType && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.backupType}</p>}
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon3" >
                      Shares for Backup  ( Available: {availableShares}% )
                    </InputGroup.Text>
                    <Form.Control id="basic-url" aria-describedby="basic-addon3" />
                  </InputGroup>
                </Form>
                {validationErrors.shares && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.shares}</p>}
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Button style={{ width: '100%' }} variant="outline-success" onClick={AddBackupButton}>Add Beneficiary Backup</Button>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
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
                    {backupBeneficiaryData.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <p>No information added yet, press <b>"Add Beneficiary Backup Button"</b> to add</p>
                        </td>
                      </tr>
                    ) : (
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
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </>
        )}

        {custom && (
          <Row>
            <Col sm={12}>
              <Form>
                <Form.Group className="mb-3" controlId="customTextArea">
                  <Form.Label>Custom Clause</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    value={clauseValue}
                    onChange={(e) => {
                      setClauseValue(e.target.value);
                      obj = { ...obj, customClause: e.target.value };
                      setSelected(obj);
                    }}
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        )}
        {validationErrors.residue && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.residue}</p>}
      </Form>
    </Container >

  );
}

export default Residue;
