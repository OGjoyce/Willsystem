import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
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

var returndata;
export function getWipeoutData() {
    return returndata;
}

var bequestindex = 0;

function Wipeout({ id, datas, errors }) {
    const [selected, setSelected] = useState({ options: [], selectedOption: null });
    const [selectedBeneficiary, setSelectedBeneficiary] = useState("Select a beneficiary");
    const [custom, setCustom] = useState(false);
    const [selectedRecepient, setSelectedRecepient] = useState("Select a recipient to continue...");
    const [open, setOpen] = useState(false);
    const [table_dataBequest, setTable_dataBequest] = useState([]);
    const [identifiers_names, setIdentifiersNames] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [fullWipeoutSelected, setFullWipeoutSelected] = useState(false);
    const [beneficiarySelected, setBeneficiarySelected] = useState(false);
    const [validationErrors, setValidationErrors] = useState(errors);


    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        const savedData = formValues.wipeout || [];
        if (savedData.length > 0) {
            setTable_dataBequest(savedData);
            bequestindex = savedData.length;
        }
    }, []);

    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.wipeout = table_dataBequest;
        localStorage.setItem('formValues', JSON.stringify(formValues));
        returndata = { wipeout: formValues.wipeout, timestamp: Date.now() };
    }, [table_dataBequest]);

    useEffect(() => {
        console.log("datas:", datas);
        console.log("kids:", datas[4].kids);
        console.log("relatives:", datas[5].relatives);

        const married = datas[2].married;
        const marriedStatus = datas[1].marriedq?.selection === "true";
        const sosoStatus = datas[1].marriedq?.selection === "soso";
        const kids = datas[4].kids;
        const relatives = datas[5].relatives;
        const kidsq = datas[3].kidsq?.selection;

        let names = [];
        const married_names = married?.firstName && married?.lastName ? `${married?.firstName} ${married?.lastName}` : null;
        names.push(married_names);

        if (kidsq === "true" && kids) {
            if (Array.isArray(kids)) {
                for (let child of kids) {
                    const childName = `${child?.firstName} ${child?.lastName}`;
                    names.push(childName);
                }
            } else if (typeof kids === 'object') {
                for (let key in kids) {
                    if (kids.hasOwnProperty(key)) {
                        const child = kids[key];
                        const childName = `${child?.firstName} ${child?.lastName}`;
                        names.push(childName);
                    }
                }
            }
        }

        if (relatives) {
            if (Array.isArray(relatives)) {
                for (let relative of relatives) {
                    const relativeName = `${relative?.firstName} ${relative?.lastName}`;
                    names.push(relativeName);
                }
            } else if (typeof relatives === 'object') {
                for (let key in relatives) {
                    if (relatives.hasOwnProperty(key)) {
                        const relative = relatives[key];
                        const relativeName = `${relative?.firstName} ${relative?.lastName}`;
                        names.push(relativeName);
                    }
                }
            }
        }

        setIdentifiersNames(names);

        var options = [
            `${marriedStatus || sosoStatus ? "50% to parents and siblings and 50% to parents and siblings of spouse" : "100% to parents and siblings"}`,
            `${marriedStatus || sosoStatus ? "50% to siblings and 50% to siblings of spouse" : "100% to siblings"}`,
            'Specific Wipeout Beneficiary'
        ];

        setSelected({ options, selectedOption: null });

        // Retrieve and set saved wipeout option from localStorage
        const savedOption = JSON.parse(localStorage.getItem('formValues')) || {};
        console.log('selected', savedOption.selectedWipeoutOption)
        if (savedOption.selectedWipeoutOption) {
            setSelectedOption(savedOption.selectedWipeoutOption);
            if (options.includes(savedOption.selectedWipeoutOption)) {
                handleSelect(savedOption.selectedWipeoutOption);
            }
        }
    }, [datas]);

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const calculateTotalShares = () => {
        return table_dataBequest.reduce((total, item) => total + parseFloat(item.shares), 0);
    };

    const handleDelete = (itemId) => {
        const updatedData = table_dataBequest.filter(obj => obj.id !== itemId);
        setTable_dataBequest(updatedData);
        returndata = { wipeout: updatedData, timestamp: Date.now() };
        bequestindex--;

        // Actualizar formValues en localStorage
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.wipeout = updatedData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleAddItem = () => {
        if (fullWipeoutSelected) {
            alert("Cannot add specific beneficiaries when a 100% wipeout option is selected.");
            return;
        }

        const organization = document.getElementById("organization").value;
        setOpen(true);

        let beneficiary;
        if (beneficiarySelected) {
            beneficiary = selectedBeneficiary;
        } else if (organization !== "") {
            beneficiary = organization;
        } else {
            setValidationErrors({ name: "Please select a beneficiary or enter an organization name." });
            return;
        }

        const backup = selectedOption;
        const shares = parseFloat(document.getElementById('shares').value);

        if (isNaN(shares) || shares <= 0) {
            setValidationErrors({ shares: "Please enter a valid positive number for shares percentage." });
            return;
        }

        const currentTotal = calculateTotalShares();
        if (currentTotal + shares > 100) {
            setValidationErrors({ shares: `Cannot add ${shares}%. Current total is ${currentTotal}%. The sum cannot exceed 100%.` });
            return;
        }

        if (selectedOption === '') {
            setValidationErrors({ type: 'Backup type is required' });
            return null;
        }
        const newItem = {
            "id": bequestindex,
            "names": beneficiary,
            "shares": shares,
            "backup": backup,
        };

        const updatedData = [...table_dataBequest, newItem];
        setTable_dataBequest(updatedData);
        returndata = { wipeout: updatedData, timestamp: Date.now() };
        bequestindex++;

        // Actualizar formValues en localStorage
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.wipeout = updatedData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
        // Reset form
        setSelectedBeneficiary("Select a beneficiary");
        setSelectedRecepient("Select a recipient to continue...");
        document.getElementById("organization").value = "";
        document.getElementById("shares").value = "";
        setSelectedOption('');
        setBeneficiarySelected(false);
        setValidationErrors({});
    };

    const setCurrentRecepient = (eventKey) => {
        setSelectedBeneficiary(eventKey);
        setSelectedRecepient(eventKey);
        setBeneficiarySelected(true);
        document.getElementById("organization").value = "";
        setValidationErrors({});
    };

    const handleOrganizationChange = (event) => {
        if (event.target.value !== "") {
            setSelectedBeneficiary("Select a beneficiary");
            setSelectedRecepient("Select a recipient to continue...");
            setBeneficiarySelected(false);
            setValidationErrors({});
        }
    };

    const handleSelect = (key) => {
        setValidationErrors({});
        setSelected(prev => ({ ...prev, selectedOption: key }));
        if (key === "Specific Wipeout Beneficiary") {
            setCustom(true);
            setFullWipeoutSelected(false);
        } else {
            setCustom(false);
            setFullWipeoutSelected(true);
            setTable_dataBequest([]);
            bequestindex = 0;
            returndata = { wipeout: key, timestamp: Date.now() };
        }

        if (key !== "Specific Wipeout Beneficiary") {
            setTable_dataBequest([]);
            bequestindex = 0;
            returndata = { wipeout: key, timestamp: Date.now() };

            // Actualizar formValues en localStorage
            const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
            formValues.wipeout = key;
            localStorage.setItem('formValues', JSON.stringify(formValues));
        }

        // Save selected wipeout option to localStorage
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.selectedWipeoutOption = key;
        localStorage.setItem('formValues', JSON.stringify(formValues));


    };

    return (
        <>
            <DropdownButton
                size="md"
                variant="outline-info"
                id="dropdown-basic-button"
                title={'select an option for wipeout'}
                onSelect={handleSelect}
            >
                {selected.options.map((option, index) => (
                    <Dropdown.Item key={index} eventKey={option}>
                        {option}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
            <p style={{ color: "gray" }}> If you don't add a backup, then inheritance is per stirpes (if a person is deceased, their children will get their share equally. If one of their children is deceased and has children of their own, their children (testator's grandchildren) will get their share equally)</p>

            {custom && !fullWipeoutSelected && (
                <>
                    <Dropdown style={{ width: "100%" }} onSelect={setCurrentRecepient}>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            {selectedBeneficiary}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {identifiers_names.map((name, index) => (
                                <Dropdown.Item key={index} eventKey={name}>{name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    <Form>
                        <Form.Group className="mb-3" controlId="organization">
                            <Form.Label>Or Organization</Form.Label>
                            <Form.Control type="text"
                                disabled={beneficiarySelected}
                                onChange={handleOrganizationChange}
                            />
                            {validationErrors.name && <p className="mt-2 text-sm text-red-600">{validationErrors.name}</p>}
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="shares">
                            <Form.Label>Shares %</Form.Label>
                            <Form.Control type="number" />
                            {validationErrors.shares && <p className="mt-2 text-sm text-red-600">{validationErrors.shares}</p>}
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
                        {validationErrors.type && <p className="mt-2 text-sm text-red-600">{validationErrors.type}</p>}
                        <Button variant="outline-success" size="lg" onClick={handleAddItem}> Add Beneficiary</Button>
                    </Form>
                </>
            )}
            <Button
                onClick={() => setOpen(!open)}
                aria-controls="example-collapse-text"
                aria-expanded={open}
                style={{ width: "80%", margin: "5%" }}
                variant="outline-dark"
            >
                See information
            </Button>
            {validationErrors.wipeout && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.wipeout}</p>}
            <Collapse in={open}>
                <div id="example-collapse-text">
                    {fullWipeoutSelected ? (
                        <p>Selected option: {selected.selectedOption}</p>
                    ) : (
                        <>
                            <div>
                                <strong>Total Shares: {calculateTotalShares()}%</strong>
                                {calculateTotalShares() < 100 && (
                                    <span style={{ color: 'red' }}> (Remaining: {100 - calculateTotalShares()}%)</span>
                                )}
                                {calculateTotalShares() === 100 && (
                                    <span style={{ color: 'green' }}> (Complete)</span>
                                )}
                            </div>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Names</th>
                                        <th>Backup</th>
                                        <th>Shares</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {table_dataBequest.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">
                                                No information added yet, press "Add Recipient Button" to add.
                                            </td>
                                        </tr>
                                    ) : (
                                        table_dataBequest.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.id + 1}</td>
                                                <td>{item.names}</td>
                                                <td>{item.backup}</td>
                                                <td>{item.shares}</td>
                                                <td>
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </>
                    )}
                </div>
            </Collapse>
        </>
    );
}

export default Wipeout;
