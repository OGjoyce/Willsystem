import React, { useState, useEffect } from 'react';
import {
  Container, Dropdown, Row, Col, Form, Button, Table, InputGroup, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import AddPersonDropdown from './AddPersonDropdown';
import { validate } from './Validations';

// Function to generate the options object based on user selection
export function getOptObject(selectedOption, backupBeneficiaryData, customClause) {
  let returnObject = {};
  if (selectedOption === "Specific Beneficiaries") {
    returnObject = {
      "selected": selectedOption,
      "beneficiary": backupBeneficiaryData
    };
  } else if (selectedOption === "Custom Clause") {
    returnObject = {
      "selected": selectedOption,
      "clause": customClause
    };
  } else if (selectedOption === null || selectedOption === undefined) {
    returnObject = {};
  } else {
    returnObject = {
      "selected": selectedOption
    };
  }
  return returnObject;
}

function Residue({ id, datas, errors }) {
  // Determine statuses based on 'datas'
  const marriedStatus = datas[1].marriedq?.selection === "true";
  const sosoStatus = datas[1].marriedq?.selection === "soso";
  const hasKids = datas[3].kidsq?.selection === "true";

  // State variables
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [bloodlineOptions, setBloodlineOptions] = useState([]);
  const [custom, setCustom] = useState(false);
  const [specific, setSpecific] = useState(false);
  const [clauseValue, setClauseValue] = useState("");
  const [firstRender, setFirstRender] = useState(true);
  const [tableDataBequest, setTableDataBequest] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selected, setSelected] = useState({});
  const [validationErrors, setValidationErrors] = useState(errors);
  const [availableShares, setAvailableShares] = useState(100);
  const [editingRow, setEditingRow] = useState(null);
  const [tempEditData, setTempEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [residueToDelete, setResidueToDelete] = useState(null);
  const [identifiersNames, setIdentifiersNames] = useState([]);
  const [bequestIndex, setBequestIndex] = useState(1);
  const [relatives, setRelatives] = useState(datas[5].relatives || {});

  // Load data from localStorage when component mounts
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formValues')) || {};

    setSelectedCategory(savedData.residue?.selectedCategory || null);
    setSelectedOption(savedData.residue?.selectedOption || null);
    setClauseValue(savedData.residue?.clauseValue || '');
    setCustom(savedData.residue?.custom || false);
    setSpecific(savedData.residue?.specific || false);
    setTableDataBequest(savedData.residue?.tableDataBequest || []);
    setAvailableShares(savedData.residue?.availableShares || 100);
    setBequestIndex(savedData.residue?.bequestIndex || 1);
    setIdentifiersNames(savedData.residue?.identifiersNames || []);
    setRelatives(savedData.residue?.relatives || datas[5].relatives || {});

    if (savedData.residue?.selectedCategory === 'Custom Selection') {
      setOptions(['Custom Clause', 'Specific Beneficiaries']);
    } else if (savedData.residue?.selectedCategory === 'Bloodline Selection') {
      setOptions(bloodlineOptions);
    }
  }, [bloodlineOptions, datas]);

  // Save relevant state to localStorage whenever dependencies change
  useEffect(() => {
    const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
    formValues.residue = {
      selectedCategory,
      selectedOption,
      clauseValue,
      custom,
      specific,
      tableDataBequest,
      availableShares,
      bequestIndex,
      identifiersNames,
      relatives
    };
    localStorage.setItem('formValues', JSON.stringify(formValues));
  }, [
    selectedCategory,
    selectedOption,
    clauseValue,
    custom,
    specific,
    tableDataBequest,
    availableShares,
    bequestIndex,
    identifiersNames,
    relatives
  ]);

  // Update bloodline options based on marital and familial status
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

  // Calculate availableShares whenever tableDataBequest changes
  useEffect(() => {
    const totalShares = tableDataBequest.reduce((sum, item) => sum + Number(item.shares), 0);
    setAvailableShares(100 - totalShares);
  }, [tableDataBequest]);

  // Initialize identifiersNames on first render
  useEffect(() => {
    if (firstRender && datas != null) {
      let names = [];
      const married = datas[2]?.married;
      const kids = datas[4]?.kids;
      const relativesObj = relatives;
      const kidsq = datas[3].kidsq?.selection;

      // Add spouse's name if married
      const marriedName = married?.firstName && married?.lastName ? `${married.firstName} ${married.lastName}` : null;
      if (marriedName) names.push(marriedName);

      // Add children's names if applicable
      if (kidsq === "true") {
        Object.values(kids).forEach(child => {
          const childName = `${child?.firstName} ${child?.lastName}`;
          names.push(childName);
        });
      }

      // Add relatives' names
      Object.values(relativesObj).forEach(relative => {
        const relativeName = `${relative?.firstName} ${relative?.lastName}`;
        names.push(relativeName);
      });

      setIdentifiersNames(names);
      setFirstRender(false);
    }
  }, [firstRender, datas, relatives]);

  // Handle category selection from dropdown
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
    setSelected({});
    setSelectedOption(null);
  };

  // Handle checkbox changes for options
  const handleCheckboxChange = (option) => {
    if (option === 'Custom Clause') {
      setCustom(prev => !prev);
      setSpecific(false);
    } else if (option === 'Specific Beneficiaries') {
      setSpecific(prev => !prev);
      setCustom(false);
    } else {
      setCustom(false);
      setSpecific(false);
    }
    setSelectedOption(option);
    setValidationErrors({});
  };

  // Handle beneficiary selection
  const handleSelectBeneficiary = (value) => {
    setSelected(prev => ({ ...prev, selectedBeneficiary: value }));
    setValidationErrors(prevErrors => ({ ...prevErrors, identifiers: '' }));
  };

  // Handle backup selection
  const handleSelectBackup = (value) => {
    setSelected(prev => ({ ...prev, selectedBackup: value }));
    setValidationErrors(prevErrors => ({ ...prevErrors, identifiers: '' }));
  };

  // Handle adding a new person to relatives
  const handleAddPerson = (newPerson) => {
    const name = `${newPerson.firstName} ${newPerson.lastName}`;
    setIdentifiersNames(prevNames => [...prevNames, name]);

    // Update the relatives object
    const newRelatives = { ...relatives };
    const newKey = Object.keys(newRelatives).length;
    newRelatives[newKey] = newPerson;
    setRelatives(newRelatives);
  };

  // Handle adding a new backup beneficiary
  const handleAddBackup = () => {
    setValidationErrors({});
    const sharesInput = document.getElementById('shares-input');
    let shares = Number(sharesInput.value);
    let totalShares = tableDataBequest.reduce((sum, backup) => sum + Number(backup.shares), 0) + shares;

    const beneficiary = selected.selectedBeneficiary || null;
    const backup = selected.selectedBackup || null;
    const selectedType = selectedOption === 'A' ? 'per stirpes' : (selectedOption === 'B' ? 'per capita' : null);

    let newErrors = {};

    // Validation checks
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

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    const newBackup = {
      "id": bequestIndex,
      "beneficiary": beneficiary,
      "backup": backup || "NA",
      "type": selectedType,
      "shares": shares
    };

    setTableDataBequest(prevData => [...prevData, newBackup]);
    setBequestIndex(prevIndex => prevIndex + 1);
    setAvailableShares(prevAvailable => prevAvailable - shares);
    setSelected({ selectedBeneficiary: null, selectedBackup: null });
    sharesInput.value = '';

    // Show toast notification
    setToastMessage('Beneficiary added successfully');
    setShowToast(true);
  };

  // Function to calculate maximum shares allowed when editing
  const getMaxShares = (index) => {
    const totalOtherShares = tableDataBequest.reduce((sum, item, idx) => {
      if (idx !== index) return sum + Number(item.shares);
      return sum;
    }, 0);
    return 100 - totalOtherShares;
  };

  // Handle editing a row
  const handleEdit = (index) => {
    setEditingRow(index);
    setTempEditData({ ...tableDataBequest[index] });
    setValidationErrors({});
  };

  // Handle saving an edited row
  const handleSave = (index) => {
    const updatedBackupBeneficiaryData = [...tableDataBequest];
    const originalShares = updatedBackupBeneficiaryData[index].shares;
    const newShares = tempEditData.shares;

    // Validate shares
    if (!Number(newShares) || newShares <= 0) {
      setValidationErrors({ shares: 'Shares must be a valid percent' });
      return;
    }

    const totalShares = tableDataBequest.reduce((sum, item, idx) => {
      if (idx === index) return sum + Number(newShares);
      return sum + Number(item.shares);
    }, 0);

    if (totalShares > 100) {
      setValidationErrors({ shares: `Total shares must be 100%. Currently, it's ${totalShares}%.` });
      return;
    }

    updatedBackupBeneficiaryData[index] = tempEditData;
    setTableDataBequest(updatedBackupBeneficiaryData);
    setEditingRow(null);
    setTempEditData(null);
    setValidationErrors({});

    // Show toast notification
    setToastMessage('Residue updated successfully');
    setShowToast(true);
  };

  // Handle cancelling the edit
  const handleCancel = () => {
    setEditingRow(null);
    setTempEditData(null);
    setValidationErrors({});
  };

  // Handle deleting a row
  const handleDelete = (itemId) => {
    setResidueToDelete(itemId);
    setShowDeleteModal(true);
  };

  // Confirm deletion of a row
  const confirmDelete = () => {
    if (residueToDelete !== null) {
      const updatedBackupBeneficiaryData = tableDataBequest.filter(obj => obj.id !== residueToDelete);
      setTableDataBequest(updatedBackupBeneficiaryData);
      setBequestIndex(prevIndex => prevIndex - 1);

      const totalShares = updatedBackupBeneficiaryData.length > 0
        ? 100 - updatedBackupBeneficiaryData.reduce((sum, backup) => sum + backup.shares, 0)
        : 100;
      setAvailableShares(totalShares);

      // Show toast notification
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

    if (editingRow === index) {
      setTempEditData(prevData => ({ ...prevData, [key]: value }));
    }
  };

  // Render tooltips based on type
  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.type === 'per capita' ? 'Distribute shares equally among all beneficiaries.' : 'Distribute shares based on the number of descendants per line.'}
    </Tooltip>
  );

  return (
    <Container>
      <Form>
        {/* Category Selection Dropdown */}
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

        {/* Options based on selected category */}
        {selectedCategory && (
          <Row className='mt-3'>
            <Col sm={12}>
              <Form>
                {options.map((option, index) => (
                  <Form.Check
                    key={index}
                    type="checkbox"
                    label={option}
                    checked={selectedOption === option}
                    onChange={() => handleCheckboxChange(option)}
                    id={`checkbox-${index}`}
                  />
                ))}
              </Form>
            </Col>
          </Row>
        )}

        {/* Specific Beneficiaries Section */}
        {specific && (
          <>
            {/* Instructions */}
            <Row className='mt-3 text-center'>
              <Col sm={12}>
                <p>Please select a beneficiary for the residue along with a backup beneficiary.</p>
              </Col>
            </Row>

            {/* Beneficiary Selection */}
            <Row>
              <Col sm={12}>
                <AddPersonDropdown
                  options={identifiersNames}
                  label="Select beneficiary"
                  selected={selected.selectedBeneficiary}
                  onSelect={handleSelectBeneficiary}
                  onAddPerson={handleAddPerson}
                  validationErrors={validationErrors}
                  setValidationErrors={setValidationErrors}
                />
              </Col>
            </Row>

            {/* Backup Selection */}
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

            {/* Backup Type Selection and Shares Input */}
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
                  <InputGroup className="mt-3 mb-3">
                    <InputGroup.Text id="shares-addon">
                      Shares for Backup (Available: {availableShares}%)
                    </InputGroup.Text>
                    <Form.Control
                      id="shares-input"
                      aria-describedby="shares-addon"
                      type="number"
                      min="1"
                      max={availableShares}
                      placeholder="Enter shares"
                    />
                  </InputGroup>
                </Form>
                {validationErrors.shares && <p className="mt-2 text-sm text-center text-danger">{validationErrors.shares}</p>}
              </Col>
            </Row>

            {/* Submit Button */}
            <Row>
              <Col sm={12}>
                <Button style={{ width: '100%' }} variant="outline-success" onClick={handleAddBackup}>Submit</Button>
              </Col>
            </Row>

            {/* Beneficiaries Table */}
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
                    {tableDataBequest.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <p>No information added yet. Press <b>"Submit"</b> to add.</p>
                        </td>
                      </tr>
                    ) : (
                      tableDataBequest.map((item, index) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>
                            {editingRow === index ? (
                              <AddPersonDropdown
                                options={identifiersNames}
                                label="Select beneficiary"
                                selected={tempEditData.beneficiary}
                                onSelect={(value) => handleDropdownSelect(index, 'beneficiary', value)}
                                onAddPerson={handleAddPerson}
                                validationErrors={validationErrors}
                                setValidationErrors={setValidationErrors}
                              />
                            ) : (
                              item.beneficiary
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
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
                            )}
                          </td>
                          <td>
                            {editingRow === index ? (
                              <Form.Select
                                value={tempEditData.type}
                                onChange={(e) => handleDropdownSelect(index, 'type', e.target.value)}
                              >
                                <option value="per stirpes">Per Stirpes</option>
                                <option value="per capita">Per Capita</option>
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

        {/* Custom Clause Section */}
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
                      setSelected(prev => ({ ...prev, customClause: e.target.value }));
                    }}
                    placeholder="Enter custom clause here..."
                  />
                </Form.Group>
              </Form>
            </Col>
          </Row>
        )}

        {/* Residue Validation Error */}
        {validationErrors.residue && <p className="mt-2 text-sm text-center text-danger">{validationErrors.residue}</p>}
      </Form>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this residue?"
      />

      {/* Custom Toast Notification */}
      <CustomToast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
      />
    </Container>
  );
}

export default Residue;
