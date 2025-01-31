import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container, Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import CustomToast from './AdditionalComponents/CustomToast';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import AddPersonDropdown from './AddPersonDropdown';  // <-- Añadido el import
import { extractData } from '@/utils/objectStatusUtils';
var identifiers_names = [];
var priorityInformation = [1, 2, 3, 4, 5];
var bequestindex = 1;

let guardiansInfo = []
export function getGuardiansForMinors() {

    return guardiansInfo;
}

export default function GuardianForMinors({ errors, datas, onAddPersonFromDropdown }) {
    const [firstRender, setFirstRender] = useState(true);
    const [selected, setSelected] = useState(null);
    const [priority, setPriority] = useState(0);
    const [tableData, setTableData] = useState({});
    const [tempTableData, setTempTableData] = useState({});
    const [validationErrors, setValidationErrors] = useState(errors);
    const [editingRow, setEditingRow] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        // Extraer los datos de `guardians` utilizando `extractData`
        const rawGuardians = extractData(datas, 'guardians', null, {});
        const guardiansArray = Object.keys(rawGuardians)
            .filter(key => key !== 'timestamp') // Filtrar para excluir el timestamp
            .reduce((acc, key) => {
                acc[key] = rawGuardians[key];
                return acc;
            }, {});

        setTableData(guardiansArray);
        guardiansInfo = guardiansArray
    }, [datas]);




    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    // Lógica similar a Bequest para poblar los dropdowns
    useEffect(() => {
        if (firstRender) {
            identifiers_names = [];
            const fullData = datas
            const married = fullData[2]?.married || {};
            const kids = fullData[4]?.kids || [];
            const relatives = fullData[5]?.relatives || [];
            const kidsq = fullData[3]?.kidsq?.selection;

            // Obtener nombres de esposa, hijos y parientes
            const married_names = married?.firstName || married?.lastName ? married.firstName + " " + married.lastName : null;
            if (kidsq === "true") {
                for (const child of kids) {
                    const names = child?.firstName + " " + child?.lastName;
                    identifiers_names.push(names);
                }
            }

            if (married_names) {
                identifiers_names.push(married_names);
            }

            for (const key in relatives) {
                const names = relatives[key]?.firstName + " " + relatives[key]?.lastName;
                identifiers_names.push(names);
            }

            setFirstRender(false);
        }
    }, [firstRender]);

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
            id: Object.values(tableData).length + 1,
            guardian: selected,
            position: parseInt(priority),
        };

        const updatedTableData = { ...tableData, [newGuardian.id]: newGuardian };
        guardiansInfo = updatedTableData
        setTableData(updatedTableData);
        setPriority(0);
        setSelected(null);
        bequestindex += 1;
    };

    const handleDelete = (itemId) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            const updatedTableData = { ...tableData };
            delete updatedTableData[itemToDelete];
            setTableData(updatedTableData);
            guardiansInfo = updatedTableData
            setToastMessage('Guardian removed successfully');
            setShowToast(true);
            setItemToDelete(null);
            setShowDeleteModal(false);
        }
    };

    const handleEdit = (itemId) => {
        setEditingRow(itemId);
        setTempTableData({ ...tableData });
    };

    const handleSave = (itemId) => {
        const updatedData = { ...tableData, [itemId]: tempTableData[itemId] };
        setTableData(updatedData);
        setToastMessage('Guardian updated successfully');
        setShowToast(true);
        setEditingRow(null);
    };

    const handleCancel = () => {
        setEditingRow(null);
    };

    const handleChange = (itemId, field, value) => {
        setTempTableData(prevData => ({
            ...prevData,
            [itemId]: {
                ...prevData[itemId],
                [field]: value
            }
        }));
    };

    const handleAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;


        identifiers_names = [...identifiers_names, name]
        // Verifica si 'relatives' existe; si no, lo inicializa como un objeto vacío
        if (!datas[5].relatives) {
            datas[5].relatives = [];
        }

        let len = Object.keys(datas[5].relatives).length;
        datas[5].relatives[len] = newPerson;
        onAddPersonFromDropdown([newPerson])
    };

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
                            <AddPersonDropdown  // <-- Añadido el AddPersonDropdown aquí
                                options={identifiers_names}
                                label="Select Relative"
                                selected={selected}
                                onSelect={handleSelectBeneficiary}
                                onAddPerson={handleAddPerson}
                                validationErrors={validationErrors}
                                setValidationErrors={setValidationErrors}
                            />
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
                                <Dropdown.Menu className='w-[100%] text-center'>
                                    {priorityInformation.map((option, index) => (
                                        <Dropdown.Item className="w-[100%] text-center" key={index} eventKey={option}>
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
                        <th>Actions</th>
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
                                <td>
                                    {editingRow === item.id ? (
                                        <Dropdown onSelect={(eventKey) => handleChange(item.id, 'guardian', eventKey)}>
                                            <Dropdown.Toggle variant="outline-dark" id={`dropdown-guardian-${item.id}`}>
                                                {tempTableData[item.id]?.guardian || 'Select Guardian'}
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                {identifiers_names.map((name, idx) => (
                                                    <Dropdown.Item key={idx} eventKey={name}>{name}</Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    ) : (
                                        item.guardian
                                    )}
                                </td>
                                <td>
                                    {editingRow === item.id ? (
                                        <>
                                            <Form.Control
                                                type="number"
                                                value={tempTableData[item.id]?.position}
                                                onChange={(e) => handleChange(item.id, 'position', e.target.value)}
                                                min={1}
                                                max={5}
                                            />
                                            {validationErrors.position && <p className="text-danger">{validationErrors.position}</p>}
                                        </>
                                    ) : (
                                        item.position
                                    )}
                                </td>
                                <td>
                                    <div className='d-flex justify-content-around gap-3'>
                                        {editingRow === item.id ? (
                                            <>
                                                <Button className="w-[50%]" variant="outline-success" size="sm" onClick={() => handleSave(item.id)}>Save</Button>
                                                <Button className="w-[50%]" variant="outline-secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button className="w-[50%]" variant="outline-danger" size="sm" onClick={() => handleDelete(item.id)}>Delete</Button>
                                                <Button className="w-[50%]" variant="outline-warning" size="sm" onClick={() => handleEdit(item.id)}>Edit</Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this guardian?"
            />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </>
    );
}
