import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import { Dropdown, OverlayTrigger, Tooltip, ButtonGroup, DropdownButton } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';


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
  } else {
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
  const [validationErrors, setValidationErrors] = useState(errors);
  const [availableShares, setAvailableShares] = useState(100);
  const [editingRow, setEditingRow] = useState(null);
  const [tempEditData, setTempEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [residueToDelete, setResidueToDelete] = useState(null);


  useEffect(() => {
    setValidationErrors(errors);
  }, [errors]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formValues')) || {};

    setSelectedCategory(savedData.residue?.selectedCategory || null);
    setSelectedOption(savedData.residue?.selectedOption || null);
    setClauseValue(savedData.residue?.clauseValue || '');
    setCustom(savedData.residue?.custom || false);
    setSpecific(savedData.residue?.specific || false);
    setTable_dataBequest(savedData.residue?.table_dataBequest || []);
    setAvailableShares(savedData.residue?.availableShares || 100);

    if (savedData.residue?.obj) {
      obj = savedData.residue.obj;
      obj.selectedBeneficiary = null;
      obj.selectedBackup = null;
      setSelected(obj);
    }

    if (savedData.residue?.backupBeneficiaryData) {
      backupBeneficiaryData = savedData.residue.backupBeneficiaryData;
      bequestindex = savedData.residue.bequestindex || 1;
    }

    if (savedData.residue?.selectedCategory === 'Custom Selection') {
      setOptions(['Custom Clause', 'Specific Beneficiaries']);
    } else if (savedData.residue?.selectedCategory === 'Bloodline Selection') {
      setOptions(bloodlineOptions);
    }
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Custom Selection') {
      setOptions(['Custom Clause', 'Specific Beneficiaries']);
    } else if (selectedCategory === 'Bloodline Selection') {
      setOptions(bloodlineOptions);
    }
  }, [selectedCategory, bloodlineOptions]);

  useEffect(() => {
    const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
    formValues.residue = {
      selectedCategory,
      selectedOption: obj.selectedOption,
      clauseValue,
      custom,
      specific,
      table_dataBequest,
      availableShares,
      obj,
      backupBeneficiaryData,
      bequestindex
    };
    localStorage.setItem('formValues', JSON.stringify(formValues));
  }, [selectedCategory, obj, clauseValue, custom, specific, table_dataBequest, availableShares]);

  useEffect(() => {
    let newBloodlineOptions = [
      'Have the residue go to parents then siblings per stirpes',
      'Have the residue go to siblings per stirpes',
    ];

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
      identifiers_names = [];
      const married = all_data[2].married;
      const kids = all_data[4].kids;
      const relatives = all_data[5].relatives;
      const kidsq = all_data[3].kidsq?.selection;

      var married_names = married?.firstName && married?.lastName ? married?.firstName + " " + married?.lastName : null;
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
    setValidationErrors({});
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

  const handleCheckboxChange = (option) => {
    if (option === 'Custom Clause') {
      setCustom(!custom);
      setSpecific(false);
      obj = { ...obj, customClause: clauseValue };
    } else if (option === 'Specific Beneficiaries') {
      setSpecific(!specific);
      setCustom(false);
    } else {
      setCustom(false);
      setSpecific(false);
    }
    obj = { ...obj, selectedOption: option };
    setSelected(obj);
    setValidationErrors({});
  };

  const handleSelectBeneficiary = (key) => {
    obj = { ...obj, selectedBeneficiary: key };
    setSelected(obj);
  };

  const handleSelectBackup = (key) => {
    obj = { ...obj, selectedBackup: key };
    setSelected(obj);
  };


  const AddBackupButton = () => {
    setValidationErrors({});
    var shares = document.getElementById('basic-url').value;
    shares = Number(shares);
    var totalShares = backupBeneficiaryData.length > 0
      ? shares + backupBeneficiaryData?.map(backup => backup.shares).reduce((a, b) => a + b)
      : shares;

    var beneficiary = selected.selectedBeneficiary || null;
    var backup = selected.selectedBackup || null;
    var selectedType = selectedOption === 'A' ? 'per stirpes' : (selectedOption === 'B' ? 'per capita' : null);

    let newErrors = {};

    if (beneficiary === backup) {
      newErrors.identifiers = "Beneficiary and backup can't be the same person";
    }

    if (beneficiary === null || backup === null) {
      newErrors.identifiers = 'Beneficiary and backup are required';
    }

    if (selectedType === null) {
      newErrors.backupType = 'Backup type is required';
    }

    if (shares === 0) {
      newErrors.shares = 'Shares for backup must be a valid percent';
    }

    if (!Number(shares)) {
      newErrors.shares = 'Shares for backup must be a Number';
    }

    if (shares > 100 || totalShares > 100) {
      newErrors.shares = 'Shares for backup must be equal to 100%';
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return null;
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
    setAvailableShares(100 - totalShares);
    obj = { ...obj, selectedBeneficiary: null, selectedBackup: null };
    setSelected(obj);
    document.getElementById('basic-url').value = '';
    // Show toast notification
    setToastMessage('Beneficiary added successfully');
    setShowToast(true);
  };

  all_data = datas;

  const handleEdit = (index) => {
    setEditingRow(index);
    setTempEditData({ ...backupBeneficiaryData[index] });
  };

  const handleSave = (index) => {
    const updatedBackupBeneficiaryData = [...backupBeneficiaryData];
    updatedBackupBeneficiaryData[index] = tempEditData;
    setTable_dataBequest(updatedBackupBeneficiaryData);
    backupBeneficiaryData = updatedBackupBeneficiaryData;

    // Update localStorage
    const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
    formValues.residue = {
      ...formValues.residue,
      table_dataBequest: updatedBackupBeneficiaryData,
      backupBeneficiaryData: updatedBackupBeneficiaryData
    };
    localStorage.setItem('formValues', JSON.stringify(formValues));

    setToastMessage('Residue updated successfully');
    setShowToast(true);
    setEditingRow(null);
    setTempEditData(null);
  };


  const handleCancel = () => {
    setEditingRow(null);
    setTempEditData(null);
  }

  const handleDelete = (itemId) => {
    setResidueToDelete(itemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (residueToDelete !== null) {
      const updatedBackupBeneficiaryData = backupBeneficiaryData.filter(obj => obj.id !== residueToDelete);
      setTable_dataBequest(updatedBackupBeneficiaryData);
      backupBeneficiaryData = updatedBackupBeneficiaryData;
      bequestindex -= 1;

      const totalShares = updatedBackupBeneficiaryData.length > 0
        ? 100 - updatedBackupBeneficiaryData.reduce((sum, backup) => sum + backup.shares, 0)
        : 100;
      setAvailableShares(totalShares);

      // Actualizar localStorage
      const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
      formValues.residue = {
        ...formValues.residue,
        table_dataBequest: updatedBackupBeneficiaryData,
        backupBeneficiaryData: updatedBackupBeneficiaryData,
        bequestindex,
        availableShares: totalShares
      };
      localStorage.setItem('formValues', JSON.stringify(formValues));

      setToastMessage('Residue removed successfully');
      setTimeout(() => {
        setToastMessage('');
      }, 4000);
      setShowToast(true);
      setResidueToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleDropdownSelect = (index, key, value) => {
    if (editingRow === index) {
      setTempEditData({ ...tempEditData, [key]: value });
    } else {
      const updatedBackupBeneficiaryData = [...backupBeneficiaryData];
      updatedBackupBeneficiaryData[index][key] = value;
      setTable_dataBequest(updatedBackupBeneficiaryData);
      backupBeneficiaryData = updatedBackupBeneficiaryData;
    }
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.type === 'per capita' ? 'Distribute shares equally among all beneficiaries.' : 'Distribute shares according to the number of descendants per line.'}
    </Tooltip>
  );


  return (
    <Container>
      <Form>
        <Row>
          <Col sm={12}>
            <Dropdown onSelect={handleCategorySelect} style={{ width: "100%" }}>
              <Dropdown.Toggle style={{ width: "100%" }} variant={selectedCategory !== null ? "outline-success" : "outline-dark"} id="category-dropdown">
                {selectedCategory !== null ? selectedCategory : 'Select Residue'}
              </Dropdown.Toggle>
              <Dropdown.Menu className={'text-center'} style={{ width: "100%" }}>
                <Dropdown.Item eventKey="Bloodline Selection">Bloodline Selection</Dropdown.Item>
                <Dropdown.Item eventKey="Custom Selection">Custom Selection</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        {selectedCategory && (
          <Row className='mt-12'>
            <Col sm={12}>
              <Form>
                {options.map((option, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    label={option}
                    checked={obj.selectedOption === option}
                    onChange={() => handleCheckboxChange(option)}
                    id={`checkbox-${index}`}
                  />
                ))}
              </Form>
            </Col>
          </Row>
        )}
        {specific && (
          <>
            <Row className='mt-12 text-center'>
              <Col sm={12}>
                <p>Please select a beneficiary for the residue following with a backup beneficiary</p>
              </Col>
            </Row>
            <Row >
              <Col sm={12}>
                <Dropdown onSelect={handleSelectBeneficiary} style={{ width: '100%' }}>
                  <Dropdown.Toggle style={{ width: '100%' }} variant="outline-dark" id="dropdown-basic-button">
                    {
                      selected.selectedBeneficiary != null
                        ? <><strong>Selected Beneficiary:</strong> {selected.selectedBeneficiary}</>
                        : 'Select beneficiary'
                    }
                  </Dropdown.Toggle>
                  <Dropdown.Menu className={'text-center'} style={{ width: '100%' }}>
                    {identifiers_names.map((option, index) => (
                      <Dropdown.Item key={index} eventKey={option}>
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col sm={12}>

                <Dropdown onSelect={handleSelectBackup} style={{ width: '100%' }}>
                  <Dropdown.Toggle style={{ width: '100%' }} variant="outline-dark" id="dropdown-basic-button">
                    {
                      selected.selectedBackup != null
                        ? <><strong>Selected Backup:</strong> {selected.selectedBackup}</>
                        : 'Select backup'
                    }
                  </Dropdown.Toggle>
                  <Dropdown.Menu className={'text-center'} style={{ width: '100%' }}>
                    {identifiers_names.map((option, index) => (
                      <Dropdown.Item key={index} eventKey={option}>
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>

                {validationErrors.identifiers && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.identifiers}</p>}
              </Col>

            </Row>
            <Row>
              <Col sm={12}>
                <Form>
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip({ type: 'per stirpes' })}
                  >
                    <div style={{ width: "174px" }}>
                      <Form.Check
                        type="radio"
                        label="per stirpes backup"
                        name="options"
                        value="A"
                        checked={selectedOption === 'A'}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        id="optionA"
                      />
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip({ type: 'per capita' })}
                  >
                    <div style={{ width: "174px" }}>
                      <Form.Check
                        type="radio"
                        label="per capita backup"
                        name="options"
                        value="B"
                        checked={selectedOption === 'B'}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        id="optionB"
                      />
                    </div>
                  </OverlayTrigger>
                  {validationErrors.backupType && <p className="mt-2 text-sm text-red-600">{validationErrors.backupType}</p>}
                  <InputGroup className="mt-3 mb-3">
                    <InputGroup.Text id="basic-addon3">
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
                <Table striped bordered hover responsive style={{ margin: "auto auto 148px auto" }}>
                  <thead>
                    <tr>
                      <th>id</th>
                      <th>beneficiary</th>
                      <th>backup</th>
                      <th>type</th>
                      <th>shares</th>
                      <th>Options</th>
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
                          <td>
                            {editingRow === index ? (
                              <Dropdown onSelect={(eventKey) => handleDropdownSelect(index, 'beneficiary', eventKey)}>
                                <Dropdown.Toggle variant="outline-dark" id={`dropdown-beneficiary-${index}`}>
                                  {tempEditData.beneficiary || 'Select Beneficiary'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {identifiers_names.map((name, idx) => (
                                    <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            ) : (
                              item.beneficiary
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
                              <Dropdown onSelect={(eventKey) => handleDropdownSelect(index, 'backup', eventKey)}>
                                <Dropdown.Toggle variant="outline-dark" id={`dropdown-backup-${index}`}>
                                  {tempEditData.backup || 'Select Backup'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {identifiers_names.map((name, idx) => (
                                    <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                            ) : (
                              item.backup
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
                              <Form.Select
                                value={tempEditData.type}
                                onChange={(e) => handleDropdownSelect(index, 'type', e.target.value)}
                              >
                                <option value="per stirpes">per stirpes</option>
                                <option value="per capita">per capita</option>
                              </Form.Select>
                            ) : (
                              item.type
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
                              <Form.Control
                                type="number"
                                value={tempEditData.shares}
                                onChange={(e) => handleDropdownSelect(index, 'shares', Number(e.target.value))}
                              />
                            ) : (
                              item.shares
                            )}
                          </td>
                          <td>
                            <div className='d-flex justify-content-around gap-3'>
                              {editingRow === index ? (
                                <>
                                  <Button className="w-[50%]" variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                  <Button className="w-[50%]" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button className="w-[50%]" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                  <Button className="w-[50%]" variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                                </>
                              )}
                            </div>
                          </td>
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
          <Row className='mt-3'>
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
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this residue?"
      />
      <CustomToast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
      />
    </Container>
  );
}

export default Residue


