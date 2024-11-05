import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

// Función para recuperar los datos de `additional` desde localStorage
export function getAdditionalInformation() {
    const savedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
    return savedFormValues.additional || {
        customClauseText: '',
        otherWishes: [],
        checkboxes: {
            organdonation: false,
            cremation: false,
            buried: false,
        },
    };
}

function Additional({ datas, errors }) {
    // State management para los campos del formulario
    const [additional, setAdditional] = useState({
        customClauseText: '',
        otherWishes: [],
        checkboxes: {
            organdonation: false,
            cremation: false,
            buried: false,
        },
    });

    const [newWish, setNewWish] = useState(''); // State para el nuevo deseo
    const [validationErrors, setValidationErrors] = useState({});

    // Cargar datos de localStorage al montar el componente
    useEffect(() => {
        const savedFormValues = getAdditionalInformation();
        setAdditional(savedFormValues);
    }, []);

    // Guardar datos en localStorage cada vez que `additional` cambie
    const updateLocalStorage = (newData) => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.additional = newData;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    // Actualizar estado y localStorage para los checkboxes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        const newCheckboxes = {
            ...additional.checkboxes,
            [name]: checked,
        };
        const newData = {
            ...additional,
            checkboxes: newCheckboxes,
        };
        setAdditional(newData);
        updateLocalStorage(newData);
    };

    // Actualizar estado y localStorage para el Custom Clause
    const handleCustomClauseChange = (e) => {
        const newData = {
            ...additional,
            customClauseText: e.target.value,
        };
        setAdditional(newData);
        updateLocalStorage(newData);
    };

    // Función para agregar un nuevo deseo a la lista
    const addWish = () => {
        if (newWish.trim() !== '') {
            const updatedWishes = [...additional.otherWishes, newWish.trim()];
            const newData = {
                ...additional,
                otherWishes: updatedWishes,
            };
            setAdditional(newData);
            updateLocalStorage(newData);
            setNewWish(''); // Limpiar el campo de entrada
        }
    };

    // Función para eliminar un deseo de la lista
    const removeWish = (index) => {
        const updatedWishes = additional.otherWishes.filter((_, i) => i !== index);
        const newData = {
            ...additional,
            otherWishes: updatedWishes,
        };
        setAdditional(newData);
        updateLocalStorage(newData);
    };

    // Sincronizar errores de validación con el componente
    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    return (
        <Container className="mt-4">
            {/* Sección de cláusulas estándar */}
            <Row>
                <Col sm={12}>
                    <h3>Standard Clause</h3>
                </Col>
            </Row>
            <Row className="mt-3">
                <Col sm={12}>
                    <Form>
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-clipboard-heart me-2" style={{ fontSize: '1.5rem' }}></i>
                            <Form.Check
                                type="checkbox"
                                id="organdonation"
                                name="organdonation"
                                label="Organ Donation"
                                checked={additional.checkboxes.organdonation}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-fire me-2" style={{ fontSize: '1.5rem' }}></i>
                            <Form.Check
                                type="checkbox"
                                id="cremation"
                                name="cremation"
                                label="Body Cremation"
                                checked={additional.checkboxes.cremation}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-usb-mini me-2" style={{ fontSize: '1.5rem' }}></i>
                            <Form.Check
                                type="checkbox"
                                id="buried"
                                name="buried"
                                label="Buried"
                                checked={additional.checkboxes.buried}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </Form>
                </Col>
            </Row>

            {/* Sección de cláusulas personalizadas */}
            <Row className="mt-4">
                <Col sm={12}>
                    <h3>Custom Clause</h3>
                </Col>
            </Row>
            <Row>
                <Col sm={12}>
                    <Form.Group controlId="customClause">
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={additional.customClauseText}
                            onChange={handleCustomClauseChange}
                            placeholder="Enter your custom clause here..."
                        />
                        {validationErrors.customClauseText && (
                            <p className="text-danger">{validationErrors.customClauseText}</p>
                        )}
                    </Form.Group>
                </Col>
            </Row>

            {/* Sección de otros deseos */}
            <Row className="mt-5">
                <Col sm={12}>
                    <Form>
                        <Form.Group controlId="otherWishes">
                            <Form.Label>Other Wishes</Form.Label>
                            <div className="d-flex">
                                <Form.Control
                                    type="text"
                                    value={newWish}
                                    onChange={(e) => setNewWish(e.target.value)}
                                    placeholder="Enter a wish and press Add"
                                />
                                <Button variant="primary" onClick={addWish} className="ms-2">
                                    Add
                                </Button>
                            </div>
                            <ul className="mt-2">
                                {additional.otherWishes.map((wish, index) => (
                                    <li key={index} className="d-flex justify-content-between">
                                        {wish}
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeWish(index)}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                            {validationErrors.otherWishes && (
                                <p className="text-danger">{validationErrors.otherWishes}</p>
                            )}
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

export default Additional;
