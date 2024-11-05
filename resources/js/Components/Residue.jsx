import React, { useState, useEffect } from 'react';
import {
  Container, Dropdown, Row, Col, Form, Button, Table, InputGroup, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

// Define obj globally to be accessible by getOptObject
let obj = {};

// Define identifiers_names and all_data globally if needed
let identifiers_names = [];
let all_data;

// Define backupBeneficiaryData and bequestindex globally
let backupBeneficiaryData = [];
let bequestindex = 1;

// Function to retrieve the current state of obj
export function getOptObject() {
  const userSelection = obj.selectedOption;
  let returnobject = {};
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
  } else if (userSelection === null || userSelection === undefined) {
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
  const hasKids = datas[3]?.kidsq?.selection === "true";

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
  const [identifiersNames, setIdentifiersNames] = useState([]);
  const [isOrganization, setIsOrganization] = useState(false); // New state for organization

  // Synchronize backupBeneficiaryData with state
  useEffect(() => {
    backupBeneficiaryData = table_dataBequest;
    bequestindex = table_dataBequest.length > 0 ? Math.max(...table_dataBequest.map(item => item.id)) + 1 : 1;
  }, [table_dataBequest]);

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
    setIsOrganization(savedData.residue?.isOrganization || false); // Restore organization state

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
  }, [selectedCategory])

  // Update availableShares based on table_dataBequest
  useEffect(() => {
    let totalShares = table_dataBequest.reduce((sum, item) => sum + Number(item.shares), 0);
    setAvailableShares(100 - totalShares);
  }, [table_dataBequest]);


  useEffect(() => {
    // Escanea el estado de objectStatus en busca de la clave residue
    const savedResidue = datas[8].residue;
    console.log('saved', datas[8])
    if (savedResidue) {
      // Configura la categoría de selección según la propiedad "selected"
      setSelectedCategory(savedResidue.selected || null);

      if (savedResidue.selected === "Custom Clause") {
        setSelectedCategory("Custom Selection");

        setSelectedOption(savedResidue.selected);
        // Caso: Custom Clause
        setCustom(true);
        setSpecific(false);
        setClauseValue(savedResidue.clause || "");
        setTable_dataBequest([]); // Aseguramos que no haya datos de beneficiarios
      }
      else if (savedResidue.selected === "Specific Beneficiaries") {
        setSelectedCategory("Custom Selection");
        // Caso: Specific Beneficiaries
        setSelectedOption(savedResidue.selected);

        setSpecific(true);
        setCustom(false);
        setTable_dataBequest(savedResidue.beneficiary || []);
        setAvailableShares(
          100 - (savedResidue.beneficiary?.reduce((sum, item) => sum + item.shares, 0) || 0)
        );

        // Configura el estado de organización si es necesario
        const isOrg = savedResidue.beneficiary?.some(b => b.isOrganization) || false;
        setIsOrganization(isOrg);
      }
      else if (savedResidue.selected?.startsWith("Have the residue go to")) {
        setSelectedCategory("Bloodline Selection");
        // Caso: Bloodline Selection
        setSelectedOption(savedResidue.selected);

        setCustom(false);
        setSpecific(false);
        setTable_dataBequest([]);
      }
      console.log(savedResidue)
      obj = { selectedOption: savedResidue.selected };
      setSelected(obj)

    }
  }, []);


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
    if (firstRender && datas != null) {
      let names = [];
      const married = datas[2]?.married;
      const kids = datas[4]?.kids;
      const relatives = datas[5]?.relatives;
      const kidsq = datas[3]?.kidsq?.selection;

      const married_names = married?.firstName || married?.lastName ? married?.firstName + " " + married?.lastName : null;
      if (married_names) names.push(married_names);

      if (kidsq === "true") {
        for (let child in kids) {
          const childName = kids[child]?.firstName + " " + kids[child]?.lastName;
          names.push(childName);
        }
      }

      for (let key in relatives) {
        const relativeName = relatives[key]?.firstName + " " + relatives[key]?.lastName;
        names.push(relativeName);
      }

      setIdentifiersNames(names);
      setFirstRender(false);
    }
  }, [firstRender, datas]);

  // Handle category selection
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
    setIsOrganization(false);
  };

  // Handle checkbox changes
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

  // Handle beneficiary selection
  const handleSelectBeneficiary = (value) => {
    obj = { ...obj, selectedBeneficiary: value };
    setSelected(obj);
    setValidationErrors(prevErrors => ({ ...prevErrors, identifiers: '' }));
  };

  // Handle backup selection
  const handleSelectBackup = (value) => {
    obj = { ...obj, selectedBackup: value };
    setSelected(obj);
    setValidationErrors(prevErrors => ({ ...prevErrors, identifiers: '' }));
  };

  // Handle adding a new person
  const handleAddPerson = (newPerson) => {
    const name = `${newPerson.firstName} ${newPerson.lastName}`;
    setIdentifiersNames(prevNames => [...prevNames, name]);

    if (!datas[5].relatives) {
      datas[5].relatives = [];
    }

    let len = Object.keys(datas[5].relatives).length;
    datas[5].relatives[len] = newPerson;
  };

  // Handle organization checkbox
  const handleOrganizationChange = (e) => {
    setIsOrganization(e.target.checked);
    if (e.target.checked) {
      obj = { ...obj, isOrganization: true, selectedBackup: null };
      setSelected(obj);
    } else {
      obj = { ...obj, isOrganization: false };
      setSelected(obj);
    }
    setValidationErrors({});
  };

  // Handle adding a backup beneficiary or organization
  const AddBackupButton = () => {
    setValidationErrors({});
    let shares = Number(document.getElementById('shares-input').value);
    let totalShares = shares + table_dataBequest.reduce((sum, backup) => sum + backup.shares, 0);

    const beneficiary = selected.isOrganization ? selected.beneficiary : selected.selectedBeneficiary || null;
    const backup = selected.isOrganization ? "N/A" : selected.selectedBackup || null;
    const selectedType = selectedOption === 'A' ? 'per stirpes' : (selectedOption === 'B' ? 'per capita' : null);

    let newErrors = {};

    if (selected.isOrganization) {
      // When it's an organization, only beneficiary and shares are required
      if (!beneficiary) {
        newErrors.beneficiary = 'Organization name is required';
      }

      if (!Number(shares) || shares <= 0) {
        newErrors.shares = 'Shares must be a valid percent';
      }

      if (shares > 100 || totalShares > 100) {
        newErrors.shares = 'Total shares must not exceed 100%';
      }
    } else {
      // Existing validation for personal beneficiaries
      if (beneficiary === backup) {
        newErrors.identifiers = "Beneficiary and backup can't be the same person";
      }

      if (beneficiary === null) {
        newErrors.identifiers = 'Beneficiary is required';
      }

      if (selectedType === null) {
        newErrors.backupType = 'Backup type is required';
      }

      if (!Number(shares) || shares <= 0) {
        newErrors.shares = 'Shares for backup must be a valid percent';
      }

      if (shares > 100 || totalShares > 100) {
        newErrors.shares = 'Total shares must not exceed 100%';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    const objToPush = {
      "id": bequestindex,
      "beneficiary": beneficiary,
      "backup": selected.isOrganization ? "N/A" : backup || "NA",
      "type": selected.isOrganization ? "N/A" : selectedType,
      "shares": shares,
      "isOrganization": selected.isOrganization // Store organization status
    };

    setTable_dataBequest([...backupBeneficiaryData, objToPush]);
    setAvailableShares(100 - (backupBeneficiaryData.reduce((sum, backup) => sum + backup.shares, 0) + shares));
    setSelected(prev => ({ ...prev, selectedBeneficiary: null, selectedBackup: null, isOrganization: false }));
    setIsOrganization(false);
    document.getElementById('shares-input').value = '';
    // Show toast notification
    setToastMessage('Beneficiary added successfully');
    setShowToast(true);
  };

  // Function to calculate the maximum shares allowed when editing a row
  const getMaxShares = (index) => {
    const totalOtherShares = table_dataBequest.reduce((sum, item, idx) => {
      if (idx !== index) return sum + Number(item.shares);
      return sum;
    }, 0);
    return 100 - totalOtherShares;
  };

  // Handle editing a row
  const handleEdit = (index) => {
    setEditingRow(index);
    setTempEditData({ ...table_dataBequest[index] });
    setValidationErrors({});
  };

  // Handle saving changes to an edited row
  const handleSave = (index) => {
    const originalShares = table_dataBequest[index].shares;
    const newShares = tempEditData.shares;

    // Calculate the difference
    const shareDifference = newShares - originalShares;

    // Validate shares
    const totalShares = table_dataBequest.reduce((sum, item, idx) => {
      if (idx === index) return sum + Number(newShares);
      return sum + Number(item.shares);
    }, 0);

    if (totalShares > 100) {
      setValidationErrors({ shares: `The total shares must not exceed 100%. Currently, it is ${totalShares}%.` });
      return;
    }

    // Update the shares in table_dataBequest
    const updatedBackupBeneficiaryData = [...table_dataBequest];
    updatedBackupBeneficiaryData[index] = tempEditData;
    setTable_dataBequest(updatedBackupBeneficiaryData);

    // Adjust availableShares by the difference
    setAvailableShares(prevAvailable => prevAvailable - shareDifference);

    // Update obj and localStorage
    obj = { ...updatedBackupBeneficiaryData[index] };
    setSelected(obj);

    const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
    formValues.residue = {
      ...formValues.residue,
      table_dataBequest: updatedBackupBeneficiaryData,
      availableShares: 100 - updatedBackupBeneficiaryData.reduce((sum, backup) => sum + backup.shares, 0)
    };
    localStorage.setItem('formValues', JSON.stringify(formValues));

    setToastMessage('Residue updated successfully');
    setShowToast(true);
    setEditingRow(null);
    setTempEditData(null);
    setValidationErrors({});
  };

  // Handle canceling the edit
  const handleCancel = () => {
    setEditingRow(null);
    setTempEditData(null);
    setValidationErrors({});
  }

  // Handle deleting a row
  const handleDelete = (itemId) => {
    setResidueToDelete(itemId);
    setShowDeleteModal(true);
  };

  // Confirm the deletion of a row
  const confirmDelete = () => {
    if (residueToDelete !== null) {
      const itemToDelete = table_dataBequest.find(obj => obj.id === residueToDelete);
      const updatedBackupBeneficiaryData = table_dataBequest.filter(obj => obj.id !== residueToDelete);
      setTable_dataBequest(updatedBackupBeneficiaryData);

      // Adjust availableShares by adding back the shares of the deleted item
      if (itemToDelete) {
        setAvailableShares(prevAvailable => prevAvailable + Number(itemToDelete.shares));
      }

      // Update obj
      obj = {};

      // Update localStorage
      const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
      formValues.residue = {
        ...formValues.residue,
        table_dataBequest: updatedBackupBeneficiaryData,
        backupBeneficiaryData: updatedBackupBeneficiaryData,
        bequestindex: bequestindex - 1,
        availableShares: 100 - updatedBackupBeneficiaryData.reduce((sum, backup) => sum + backup.shares, 0)
      };
      localStorage.setItem('formValues', JSON.stringify(formValues));

      setToastMessage('Residue deleted successfully');
      setShowToast(true);
      setResidueToDelete(null);
      setShowDeleteModal(false);
    }
  };

  // Handle changes in dropdowns and inputs during editing
  const handleDropdownSelect = (index, key, value) => {
    if (key === 'shares') {
      const maxShares = getMaxShares(index);
      if (value > maxShares) {
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          shares: `Shares cannot exceed ${maxShares}%`
        }));
        return;
      } else {
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          shares: ''
        }));
      }
    }
    if (value == '') {
      value = "N/A"
    }
    if (editingRow === index) {
      setTempEditData({ ...tempEditData, [key]: value });
    } else {
      const updatedBackupBeneficiaryData = [...table_dataBequest];
      updatedBackupBeneficiaryData[index][key] = value;
      setTable_dataBequest(updatedBackupBeneficiaryData);
      obj = { ...updatedBackupBeneficiaryData[index] };
      setSelected(obj);
    }
  };

  // Render tooltips
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.type === 'per capita'
        ? 'Distributes the shares equally among all beneficiaries.'
        : 'Distributes the shares according to the number of descendants per line.'}
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
          <Row className='mt-3'>
            <Col sm={12}>
              <Form>
                {options.map((option, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    label={option}
                    checked={selected.selectedOption == option}
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
            <Row className='mt-3 text-center'>
              <Col sm={12}>
                <p>Please select a beneficiary for the residue.</p>
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col sm={12}>
                <Form.Check
                  type="checkbox"
                  id="organization-checkbox"
                  label="Organization"
                  checked={isOrganization}
                  onChange={handleOrganizationChange}
                />
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                {isOrganization ? (
                  <Form.Group controlId="organizationName">
                    <Form.Label>Organization Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter organization name"
                      value={selected.beneficiary || ''}
                      onChange={(e) => {
                        setSelected(prev => ({ ...prev, beneficiary: e.target.value }));
                        obj = { ...obj, beneficiary: e.target.value };
                      }}
                    />
                    {validationErrors.beneficiary && <p className="mt-2 text-sm text-center text-danger">{validationErrors.beneficiary}</p>}
                  </Form.Group>
                ) : (
                  <AddPersonDropdown
                    options={identifiersNames}
                    label="Select beneficiary"
                    selected={selected.selectedBeneficiary}
                    onSelect={handleSelectBeneficiary}
                    onAddPerson={handleAddPerson}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                  />
                )}
              </Col>
            </Row>
            {!isOrganization && (
              <Row className='mt-3'>
                <Col sm={12}>
                  <AddPersonDropdown
                    options={identifiersNames}
                    label="Select backup"
                    selected={selected.selectedBackup}
                    onSelect={handleSelectBackup}
                    onAddPerson={handleAddPerson}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                  />
                  {validationErrors.identifiers && <p className="mt-2 text-sm text-center text-danger">{validationErrors.identifiers}</p>}
                </Col>
              </Row>
            )}
            <Row>
              <Col sm={12}>
                {!isOrganization && (
                  <>
                    <OverlayTrigger
                      placement="right"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip({ type: 'per stirpes' })}
                    >
                      <div style={{ width: "174px" }}>
                        <Form.Check
                          type="radio"
                          label="Per Stirpes Backup"
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
                          label="Per Capita Backup"
                          name="options"
                          value="B"
                          checked={selectedOption === 'B'}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          id="optionB"
                        />
                      </div>
                    </OverlayTrigger>
                    {validationErrors.backupType && <p className="mt-2 text-sm text-danger">{validationErrors.backupType}</p>}
                  </>
                )}
                <InputGroup className="mt-3 mb-3">
                  <InputGroup.Text id="shares-addon">
                    Shares {isOrganization ? "(Available: " : "for Backup (Available: "} {availableShares}%{isOrganization ? ")" : ")"}
                  </InputGroup.Text>
                  <Form.Control
                    id="shares-input"
                    aria-describedby="shares-addon"
                    type="number"
                    min="1"
                    max={availableShares}
                  />
                </InputGroup>
                {validationErrors.shares && <p className="mt-2 text-sm text-center text-danger">{validationErrors.shares}</p>}
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Button style={{ width: '100%' }} variant="outline-success" onClick={AddBackupButton}>Submit</Button>
              </Col>
            </Row>
            <Row>
              <Col sm={12}>
                <Table striped bordered hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Beneficiary</th>
                      <th>Backup</th>
                      <th>Type</th>
                      <th>Shares</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupBeneficiaryData.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <p>No information added yet. Press <b>"Submit"</b> to add.</p>
                        </td>
                      </tr>
                    ) : (
                      backupBeneficiaryData.map((item, index) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            {editingRow === index ? (
                              item.isOrganization ? (
                                <Form.Control
                                  type="text"
                                  value={tempEditData.beneficiary}
                                  onChange={(e) => {
                                    handleDropdownSelect(index, 'beneficiary', e.target.value);
                                  }}
                                  placeholder="Enter organization name"
                                />
                              ) : (
                                <AddPersonDropdown
                                  options={identifiersNames}
                                  label="Select beneficiary"
                                  selected={tempEditData.beneficiary}
                                  onSelect={(value) => handleDropdownSelect(index, 'beneficiary', value)}
                                  onAddPerson={handleAddPerson}
                                  validationErrors={validationErrors}
                                  setValidationErrors={setValidationErrors}
                                />
                              )
                            ) : (
                              item.beneficiary
                            )}
                          </td>
                          <td>
                            {item.isOrganization ? (
                              "N/A"
                            ) : (
                              editingRow === index ? (
                                <AddPersonDropdown
                                  options={identifiersNames}
                                  label="Select backup"
                                  selected={tempEditData.backup}
                                  onSelect={(value) => handleDropdownSelect(index, 'backup', value)}
                                  onAddPerson={handleAddPerson}
                                  validationErrors={validationErrors}
                                  setValidationErrors={setValidationErrors}
                                />
                              ) : (
                                item.backup
                              )
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
                              item.isOrganization ? (
                                "N/A"
                              ) : (
                                <Form.Select
                                  value={tempEditData.type}
                                  onChange={(e) => handleDropdownSelect(index, 'type', e.target.value)}
                                >
                                  <option value="per stirpes">Per Stirpes</option>
                                  <option value="per capita">Per Capita</option>
                                </Form.Select>
                              )
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
                                max={getMaxShares(index)}
                                min="1"
                              />
                            ) : (
                              `${item.shares}%`
                            )}
                          </td>
                          <td>
                            <div className='d-flex justify-content-around gap-3'>
                              {editingRow === index ? (
                                <>
                                  <Button className="w-50" variant="outline-success" size="sm" onClick={() => handleSave(index)}>Save</Button>
                                  <Button className="w-50" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button className="w-50" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                  <Button className="w-50" variant="outline-warning" size="sm" onClick={() => handleEdit(index)}>Edit</Button>
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
        {validationErrors.residue && <p className="mt-2 text-sm text-center text-danger">{validationErrors.residue}</p>}
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

export default Residue;
