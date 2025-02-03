import React, { useState, useEffect, useRef } from 'react';
import {
    Form,
    Button,
    Table,
    Collapse,
    Container,
    Row,
    Col,
} from 'react-bootstrap';
import AddPersonDropdown from './AddPersonDropdown';
import ConfirmationModal from './AdditionalComponents/ConfirmationModal';
import CustomToast from './AdditionalComponents/CustomToast';
import { validate } from './Validations';
import { extractData } from '@/utils/objectStatusUtils';

// Variable global para mantener el arreglo de bequests (para uso externo)
let bequestArrObj = [];

export function getBequestArrObj() {
    return bequestArrObj;
}

function Bequest({ id, datas, errors, onAddPersonFromDropdown }) {
    // Estados locales
    const [open, setOpen] = useState(false);
    const [firstRender, setFirstRender] = useState(true);
    const [table_dataBequest, setTableDataBequest] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [identifiersNames, setIdentifiersNames] = useState([]);
    const [isMarried, setIsMarried] = useState(false);
    const [isCustomBequest, setIsCustomBequest] = useState(false);
    const [pendingShares, setPendingShares] = useState(100);
    const [validationErrors, setValidationErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [bequestToDelete, setBequestToDelete] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [nextSharedUuid, setNextSharedUuid] = useState(1);
    const [tempData, setTempData] = useState({});
    const [bequestText, setBequestText] = useState('');
    const [sharesInput, setSharesInput] = useState('');

    // useRef para generar IDs únicos sin depender de la longitud del arreglo
    const bequestIdRef = useRef(0);

    // Flag computado para determinar si el campo de bequest debe ser readOnly
    const bequestInputReadOnly = !isCustomBequest && pendingShares < 100;

    // Actualiza la cantidad de shares pendientes cuando se modifica el bequest o la tabla
    useEffect(() => {
        if (!isCustomBequest && bequestText.trim() !== "") {
            const allocated = table_dataBequest
                .filter(item =>
                    item.bequest.trim().toLowerCase() === bequestText.trim().toLowerCase() &&
                    item.shared_uuid !== 0
                )
                .reduce((acc, item) => acc + Number(item.shares), 0);
            setPendingShares(100 - allocated);
        } else {
            setPendingShares(100);
        }
    }, [bequestText, table_dataBequest, isCustomBequest]);

    // Inicializa los datos desde las validaciones y el localStorage
    useEffect(() => {
        setValidationErrors(errors || {});
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedValues.bequests) {
            setTableDataBequest(storedValues.bequests);
            bequestArrObj = storedValues.bequests;
            // Actualiza el bequestIdRef al máximo id encontrado
            const maxId = storedValues.bequests.length > 0 ? Math.max(...storedValues.bequests.map(b => b.id)) : 0;
            bequestIdRef.current = maxId;
        }
    }, [errors]);

    // Actualiza el estado marital en función de los datos recibidos
    useEffect(() => {
        setIsMarried(!!(datas[2]?.married?.firstName || datas[2]?.married?.lastName));
    }, [datas]);

    // Maneja el cambio en el textarea del bequest
    const handleTextAreaChange = (event) => {
        setBequestText(event.target.value);
    };

    // Función para agregar un bequest (ya sea custom o compartido)
    const addRecepient = () => {
        setValidationErrors({});
        const bequest = bequestText.trim();
        // Para bequests no custom se toman los datos de los dropdowns
        const selected = isCustomBequest ? 'NA' : selectedRecipient;
        const backup = isCustomBequest ? 'NA' : selectedBackup;
        // Para bequests custom o cuando el beneficiario es "Spouse First" se asigna 100 shares
        const shares = isCustomBequest || selected === "Spouse First" ? 100 : sharesInput;

        // Verificación de duplicados en bequests que ya se han asignado totalmente
        if (Number(shares) >= 100) {
            const isDuplicateBequest = table_dataBequest.some(
                item => item.bequest.trim().toLowerCase() === bequest.toLowerCase()
            );
            if (isDuplicateBequest) {
                setValidationErrors(prevErrors => ({
                    ...prevErrors,
                    bequestItem: "All shares for this bequest have already been fully allocated"
                }));
                return;
            }
        }

        // Validaciones básicas de campos obligatorios y rangos
        if (
            bequest === "" ||
            selected === null ||
            backup === null ||
            shares === "" ||
            Number(shares) > 100 ||
            Number(shares) <= 0 ||
            (selected !== "Spouse First" && selected === backup)
        ) {
            let newErrors = {};
            if (selected === null) {
                newErrors.beneficiary = "Beneficiary selection is required";
            }
            if (bequest === "") {
                newErrors.bequestItem = "Please add a bequest in the section above";
            }
            if (!isCustomBequest && selected !== null && backup !== null && selected === backup) {
                newErrors.backupSameAsBeneficiary = "Beneficiary and Backup can't be the same person";
            }
            if (shares === "") {
                newErrors.shares = "Please enter a value for shares";
            }
            if (Number(shares) > 100 || Number(shares) <= 0) {
                newErrors.shares = "Shares must be a value between 1 and 100";
            }
            setValidationErrors(newErrors);
            return;
        }

        // Preparar el nuevo objeto bequest con un ID único
        bequestIdRef.current += 1;
        const newBequest = {
            id: bequestIdRef.current,
            names: selected,
            backup: backup || "NA",
            shares: shares,
            bequest: bequest,
            isCustom: isCustomBequest,
            shared_uuid: 0
        };

        // Para bequests compartidos se agrupan las asignaciones según el nombre del bequest
        if (!isCustomBequest) {
            const bequestName = bequest;
            const existingGroupItems = table_dataBequest.filter(
                item =>
                    item.bequest.trim().toLowerCase() === bequestName.toLowerCase() &&
                    item.shared_uuid !== 0
            );
            let groupSharedUuid;
            let available = 100;
            if (existingGroupItems.length > 0) {
                groupSharedUuid = existingGroupItems[0].shared_uuid;
                const allocated = existingGroupItems.reduce((acc, item) => acc + Number(item.shares), 0);
                available = 100 - allocated;
            } else {
                groupSharedUuid = nextSharedUuid;
                setNextSharedUuid(prev => prev + 1);
            }
            if (available === 0) {
                setValidationErrors({ shares: "This bequest item has been fully allocated" });
                return;
            }
            if (Number(shares) > available) {
                setValidationErrors({ shares: "Only " + available + " shares are available for current bequest item" });
                return;
            }
            newBequest.shared_uuid = groupSharedUuid;
            const newAvailable = available - Number(shares);
            setPendingShares(newAvailable);
            let newErrors = {};
            if (newAvailable > 0) {
                newErrors.shares = "Pending shares for current bequest item: " + newAvailable;
            } else if (newAvailable === 0) {
                newErrors.shares = "This bequest item has been fully allocated";
                // Se limpian los campos de entrada cuando se completa la asignación
                setBequestText('');
                setSharesInput('');
            }
            setValidationErrors(newErrors);
        }

        // Se agrega el nuevo bequest al arreglo y se actualiza el estado, la variable global y el localStorage
        const updatedBequests = [...table_dataBequest, newBequest];
        setTableDataBequest(updatedBequests);
        bequestArrObj = updatedBequests;
        setToastMessage(isCustomBequest ? 'Custom bequest added successfully' : 'Bequest added successfully');
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = updatedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));
    };

    // Maneja la solicitud de eliminación de un bequest
    const handleDelete = (itemId) => {
        setBequestToDelete(itemId);
        setShowDeleteModal(true);
    };

    // Confirma la eliminación y actualiza el estado y el almacenamiento local
    const confirmDelete = () => {
        setToastMessage('Bequest removed successfully');
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);
        if (bequestToDelete !== null) {
            setShowDeleteModal(false);
            const updatedBequests = table_dataBequest.filter(obj => obj.id !== bequestToDelete);
            setTableDataBequest(updatedBequests);
            bequestArrObj = updatedBequests;
            // Nota: No se decrementa bequestIdRef para mantener la unicidad de los IDs
            const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
            storedValues.bequests = updatedBequests;
            localStorage.setItem('formValues', JSON.stringify(storedValues));
            setBequestToDelete(null);
        }
    };

    // Inicia la edición de una fila del bequest
    const handleEdit = (index) => {
        setTempData({ ...table_dataBequest[index] });
        setEditingRow(index);
    };

    // Guarda los cambios realizados en una fila editada
    const handleSave = (index) => {
        const updatedBequests = [...table_dataBequest];
        setTableDataBequest(updatedBequests);
        bequestArrObj = updatedBequests;
        const storedValues = JSON.parse(localStorage.getItem('formValues')) || {};
        storedValues.bequests = updatedBequests;
        localStorage.setItem('formValues', JSON.stringify(storedValues));
        setToastMessage('Bequest updated successfully');
        setShowToast(true);
        setTimeout(() => {
            setToastMessage('');
            setShowToast(false);
        }, 4000);
        setEditingRow(null);
        setTempData({});
    };

    // Actualiza los datos en modo edición a partir de un dropdown o un input
    const handleDropdownSelect = (index, key, value) => {
        if (editingRow === index) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[index] = { ...updatedBequests[index], [key]: value };
            setTableDataBequest(updatedBequests);
        }
    };

    // Cancela la edición y revierte los cambios
    const handleCancel = () => {
        if (editingRow !== null) {
            const updatedBequests = [...table_dataBequest];
            updatedBequests[editingRow] = tempData;
            setTableDataBequest(updatedBequests);
        }
        setEditingRow(null);
        setTempData({});
    };

    const handleRecepientSelect = (eventKey) => {
        setSelectedRecipient(eventKey);
    };

    const handleBackupSelect = (eventKey) => {
        setSelectedBackup(eventKey);
    };

    // Agrega una nueva persona (por ejemplo, desde el dropdown)
    const onAddPerson = (newPerson) => {
        const name = `${newPerson.firstName} ${newPerson.lastName}`;
        setIdentifiersNames(prevNames => [...prevNames, name]);
        // Actualiza de forma segura los datos en datas para relatives
        const updatedDatas = { ...datas };
        if (!updatedDatas[5]) {
            updatedDatas[5] = { relatives: [] };
        }
        const relatives = updatedDatas[5].relatives || [];
        relatives.push(newPerson);
        updatedDatas[5].relatives = relatives;
        // Se notifica al componente padre mediante callback
        onAddPersonFromDropdown([newPerson]);
        setValidationErrors({});
    };

    // Carga los bequests desde datas (si existen) y actualiza el estado
    useEffect(() => {
        if (datas) {
            const rawBequests = extractData(datas, 'bequests', null, []);
            const bequestsArray = Object.keys(rawBequests)
                .filter(key => !isNaN(key))
                .map(key => rawBequests[key]);
            setTableDataBequest(bequestsArray);
            bequestArrObj = bequestsArray;
            const maxId = bequestsArray.length > 0 ? Math.max(...bequestsArray.map(b => b.id)) : 0;
            bequestIdRef.current = maxId;
            if (bequestArrObj.length > 0) {
                setOpen(true);
            }
        }
    }, [datas]);

    // Inicializa la lista de nombres (identifiers) a partir de datas en el primer render
    useEffect(() => {
        if (datas && firstRender) {
            let names = [];
            const married = datas[2]?.married;
            const kids = datas[4]?.kids;
            const relatives = datas[5]?.relatives || [];
            const kidsq = datas[3]?.kidsq?.selection;
            const married_names = (married?.firstName || married?.lastName)
                ? `${married.firstName || ''} ${married.lastName || ''}`.trim()
                : null;
            if (married_names) {
                setIsMarried(true);
            }
            if (kidsq === "true" && kids) {
                kids.forEach(child => {
                    const childName = `${child.firstName} ${child.lastName}`;
                    names.push(childName);
                });
            }
            if (married_names) {
                names.push(married_names);
            }
            relatives.forEach(relative => {
                const relName = `${relative.firstName} ${relative.lastName}`;
                names.push(relName);
            });
            setIdentifiersNames(names);
            setFirstRender(false);
        }
    }, [datas, firstRender]);

    return (
        <Container className="py-4">
            <Form>
                <Row>
                    <Col>
                        <Form.Group className="mb-3" controlId="bequestTextArea">
                            <Form.Label className="font-weight-bold">Bequest:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder={isCustomBequest ? "(e.g., Charitable Donation)" : "(e.g., Gold Chain)"}
                                value={bequestText}
                                onChange={handleTextAreaChange}
                                readOnly={bequestInputReadOnly}
                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {validationErrors.bequestItem && (
                                <Form.Text className="text-danger">
                                    {validationErrors.bequestItem}
                                </Form.Text>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                {/* Checkbox para "Custom Bequest" (actualmente oculto) */}
                <Row className="mt-3 d-none">
                    <Col>
                        <Form.Check
                            type="checkbox"
                            id="custom-bequest-checkbox"
                            label="Custom Bequest"
                            checked={isCustomBequest}
                            onChange={(e) => setIsCustomBequest(e.target.checked)}
                            disabled={!isCustomBequest && pendingShares < 100}
                            className="text-lg"
                        />
                    </Col>
                </Row>

                {isCustomBequest ? (
                    <>
                        <Row className="mt-4">
                            <Col>
                                <Button
                                    style={{ width: "80%", margin: "5%" }}
                                    variant="outline-success"
                                    onClick={addRecepient}
                                >
                                    Add Custom Bequest
                                </Button>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col>
                                <Button
                                    onClick={() => setOpen(!open)}
                                    aria-controls="bequest-info"
                                    aria-expanded={open}
                                    style={{ width: "80%", margin: "5%" }}
                                    variant="outline-dark"
                                >
                                    {open ? 'Hide Bequest Information' : 'See Bequest Information'}
                                </Button>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <>
                        <Row className="mt-4">
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiersNames}
                                    extraOptions={isMarried ? ['Spouse First'] : []}
                                    label="Select Beneficiary"
                                    selected={selectedRecipient}
                                    onSelect={handleRecepientSelect}
                                    onAddPerson={onAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                    variant={selectedRecipient === "Spouse First" ? "outline-success" : "outline-dark"}
                                />
                                {validationErrors.beneficiary && (
                                    <Form.Text className="text-danger">
                                        {validationErrors.beneficiary}
                                    </Form.Text>
                                )}
                            </Col>
                            <Col md={6}>
                                <AddPersonDropdown
                                    options={identifiersNames}
                                    label="Select Bequest Backup"
                                    selected={selectedBackup}
                                    onSelect={handleBackupSelect}
                                    onAddPerson={onAddPerson}
                                    validationErrors={validationErrors}
                                    setValidationErrors={setValidationErrors}
                                />
                                {validationErrors.backupSameAsBeneficiary && (
                                    <Form.Text className="text-danger">
                                        {validationErrors.backupSameAsBeneficiary}
                                    </Form.Text>
                                )}
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col md={6}>
                                <Form.Group controlId="sharesID">
                                    <Form.Label>Number of Shares</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="100"
                                        value={sharesInput}
                                        onChange={(e) => setSharesInput(e.target.value)}
                                        readOnly={selectedRecipient === "Spouse First"}
                                        className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                    />
                                    {validationErrors.shares && (
                                        <Form.Text className="text-danger">
                                            {validationErrors.shares}
                                        </Form.Text>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Text className="text-muted">
                                    The bequest item will be divided based on total shares and distributed among all recipients.
                                </Form.Text>
                            </Col>
                        </Row>

                        <Row className="mt-4">
                            <Col className="d-flex justify-content-between">
                                <Button variant="outline-success" onClick={addRecepient}>
                                    Save
                                </Button>
                                <Button
                                    variant="outline-dark"
                                    onClick={() => setOpen(!open)}
                                    aria-controls="bequest-info"
                                    aria-expanded={open}
                                >
                                    {open ? 'Hide Bequest Information' : 'See Bequest Information'}
                                </Button>
                            </Col>
                        </Row>
                    </>
                )}

                {validationErrors.bequest && (
                    <Row className="mt-3">
                        <Col>
                            <Form.Text className="text-danger">
                                {validationErrors.bequest}
                            </Form.Text>
                        </Col>
                    </Row>
                )}

                <Row className="mt-4">
                    <Col>
                        <Collapse in={open}>
                            <div id="bequest-info">
                                <Table striped bordered hover responsive className="mt-3">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Beneficiary</th>
                                            <th>Backup</th>
                                            <th>Bequest</th>
                                            <th>Shares</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table_dataBequest.length === 0 ? (
                                            <tr>
                                                <td className='text-center' colSpan="7">
                                                    No information added yet. Press "Add Recipient" to add.
                                                </td>
                                            </tr>
                                        ) : (
                                            table_dataBequest.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <AddPersonDropdown
                                                                options={identifiersNames}
                                                                label="Select Beneficiary"
                                                                selected={item.names}
                                                                onSelect={(value) => handleDropdownSelect(index, 'names', value)}
                                                                onAddPerson={onAddPerson}
                                                                validationErrors={validationErrors}
                                                                setValidationErrors={setValidationErrors}
                                                            />
                                                        ) : (
                                                            item.names
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <AddPersonDropdown
                                                                options={identifiersNames}
                                                                label="Select Backup"
                                                                selected={item.backup}
                                                                onSelect={(value) => handleDropdownSelect(index, 'backup', value)}
                                                                onAddPerson={onAddPerson}
                                                                validationErrors={validationErrors}
                                                                setValidationErrors={setValidationErrors}
                                                            />
                                                        ) : (
                                                            item.backup
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={1}
                                                                value={item.bequest}
                                                                onChange={(e) => handleDropdownSelect(index, 'bequest', e.target.value)}
                                                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            item.bequest
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRow === index ? (
                                                            <Form.Control
                                                                type="number"
                                                                value={item.shares}
                                                                onChange={(e) => handleDropdownSelect(index, 'shares', e.target.value)}
                                                                className="border-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            item.shares
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            {editingRow === index ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline-success"
                                                                        onClick={() => handleSave(index)}
                                                                    >
                                                                        Save
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-secondary"
                                                                        onClick={handleCancel}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        onClick={() => handleDelete(item.id)}
                                                                    >
                                                                        <i className="bi bi-trash3"></i> Delete
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-warning"
                                                                        onClick={() => handleEdit(index)}
                                                                    >
                                                                        <i className="bi bi-pencil"></i> Edit
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Collapse>
                    </Col>
                </Row>
            </Form>

            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message="Are you sure you want to delete this bequest?"
            />
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />
        </Container>
    );
}

export default Bequest;
