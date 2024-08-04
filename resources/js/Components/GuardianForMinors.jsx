import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container, Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

var identifiers_names = [];
var priorityInformation = [1, 2, 3, 4, 5];
var bequestindex = 1;

export function getFullData() {
    // Recuperar datos de localStorage
    const savedData = localStorage.getItem('fullData');
    return savedData ? JSON.parse(savedData) : {};
}

export function getGuardiansForMinors() {
    // Recuperar datos de localStorage
    const savedData = localStorage.getItem('formValues');
    return savedData ? JSON.parse(savedData).guardians || [] : [];
}

export default function GuardianForMinors({ errors }) {
    const [firstRender, setFirstRender] = useState(true);
    const [selected, setSelected] = useState(null);
    const [priority, setPriority] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [validationErrors, setValidationErrors] = useState(errors);

    // Recuperar datos iniciales
    useEffect(() => {
        const savedData = getGuardiansForMinors();
        setTableData(savedData.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {}));
    }, []);

    // Guardar datos en localStorage
    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.guardians = Object.values(tableData);
        localStorage.setItem('formValues', JSON.stringify(formValues));
    }, [tableData]);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    const handleSelectBeneficiary = (key) => {
        setValidationErrors({});
        setSelected(key);
    };

    const handleSelectPriority = (key) => {
        setValidationErrors({});
        setPriority(key);
    };

    const AddGuardianButton = () => {
        setValidationErrors({});
        if (selected === null || priority === 0) {
            const newErrors = {};
            if (selected === null) {
                newErrors.selected = 'A relative selection is required';
            }
            if (priority === 0) {
                newErrors.priority = 'A priority selection is required';
            }
            setValidationErrors(newErrors);
            return;
        }

        const newGuardian = {
            id: bequestindex,
            guardian: selected,
            position: parseInt(priority),
        };

        const updatedTableData = { ...tableData, [newGuardian.id]: newGuardian };
        setTableData(updatedTableData);
        setPriority(0);
        setSelected(null);
        bequestindex += 1;
    };

    const handleDelete = (itemId) => {
        const updatedTableData = { ...tableData };
        delete updatedTableData[itemId];
        setTableData(updatedTableData);
    };

    // Inicialización y llenado de identificadores
    useEffect(() => {
        if (firstRender) {
            identifiers_names = []
            const fullData = getFullData();
            const married = fullData[2]?.married || {};
            const kids = fullData[4]?.kids || [];
            const relatives = fullData[5]?.relatives || [];
            const kidsq = fullData[3]?.kidsq?.selection;

            const married_names = married.firstName + " " + married.lastName;
            if (kidsq === "true") {
                for (const child of kids) {
                    const names = child?.firstName + " " + child?.lastName;
                    identifiers_names.push(names);
                }
            }

            identifiers_names.push(married_names);
            for (const key in relatives) {
                const names = relatives[key]?.firstName + " " + relatives[key]?.lastName;
                identifiers_names.push(names);
            }

            setFirstRender(false);
        }
    }, [firstRender]);

    const filteredIdentifiersNames = identifiers_names.filter(
        (name) => !Object.values(tableData).some((item) => item.guardian === name)
    );

    const filteredPriorityInformation = priorityInformation.filter(
        (priority) => !Object.values(tableData).some((item) => parseInt(item.position) === priority)
    );

    return (
        <>
            <Container>
                <Form>
                    <Row>
                        <Col sm={12}>
                            <p>Select the guardian for your children</p>
                        </Col>
                    </Row>
                    <br />
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
                    <br />
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
                    <br />
                    <Row>
                        <Col sm={12}>
                            <Button style={{ width: "100%" }} variant="outline-success" onClick={AddGuardianButton}>Add Guardian</Button>
                        </Col>
                    </Row>
                    <br />
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
                    {Object.values(tableData).length === 0 ? (
                        <tr>
                            <td colSpan="4">
                                No information added yet, press <b>"Add Guardian Button"</b> to add.
                            </td>
                        </tr>
                    ) : (
                        Object.values(tableData).map((item) => (
                            <tr key={item.id}>
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
