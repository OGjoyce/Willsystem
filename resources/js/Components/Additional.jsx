// src/Components/Additional.jsx

import React, { useState, useEffect } from 'react';
import {
    Container,
    Dropdown,
    Row,
    Col,
    Form,
} from 'react-bootstrap';


/**
 * Function to retrieve additional information.
 * This can be expanded to gather all necessary data from the component.
 */
export const getAdditionalInformation = () => {
    const savedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
    return savedFormValues.additional || {};
};

function Additional({ datas, errors }) {
    // State management for clause selection and inputs
    const [selectedClause, setSelectedClause] = useState('Standard Clause'); // Initially 'Standard Clause'
    const [customClauseText, setCustomClauseText] = useState('');
    const [otherWishes, setOtherWishes] = useState('');
    const [checkboxes, setCheckboxes] = useState({
        organdonation: false,
        cremation: false,
        buried: false,
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Effect to synchronize validation errors
    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    // Effect to load data from localStorage when the component mounts
    useEffect(() => {
        const savedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (savedFormValues.additional) {
            const {
                selectedClause,
                customClauseText,
                otherWishes,
                checkboxes,
            } = savedFormValues.additional;
            setSelectedClause(selectedClause || 'Standard Clause');
            setCustomClauseText(customClauseText);
            setOtherWishes(otherWishes);
            setCheckboxes(checkboxes);
        }
    }, []);

    // Effect to save data to localStorage whenever relevant states change
    useEffect(() => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.additional = {
            selectedClause,
            customClauseText,
            otherWishes,
            checkboxes,
            timestamp: Date.now(),
        };
        localStorage.setItem('formValues', JSON.stringify(formValues));
    }, [selectedClause, customClauseText, otherWishes, checkboxes]);

    // Handle selection in the Dropdown
    const handleDropdownSelect = (eventKey) => {
        setSelectedClause(eventKey);
        setValidationErrors({});
        setCustomClauseText('');
        setCheckboxes({
            organdonation: false,
            cremation: false,
            buried: false,
        });
    };

    // Handle changes in the checkboxes
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCheckboxes((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // Handle changes in the Custom Clause text area
    const handleCustomClauseChange = (e) => {
        setCustomClauseText(e.target.value);
    };

    // Handle changes in the Other Wishes text area
    const handleOtherWishesChange = (e) => {
        setOtherWishes(e.target.value);
    };

    return (
        <Container className="mt-4">
            {/* Standard Clause Section */}
            <Row>
                <Col sm={12}>

                    <Dropdown onSelect={handleDropdownSelect} className="mb-3 mt-3 w-100">
                        <Dropdown.Toggle
                            variant={selectedClause ? 'outline-success' : 'outline-dark'}
                            id="standard-clause-dropdown"
                            style={{ width: '100%' }}
                        >
                            {selectedClause}
                        </Dropdown.Toggle>

                        <Dropdown.Menu className='w-100 text-center'>
                            <Dropdown.Item eventKey="Standard Clause">Standard Clause</Dropdown.Item>
                            <Dropdown.Item eventKey="Custom Clause">Custom Clause</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    {validationErrors.selectedClause && (
                        <p className="text-danger">{validationErrors.selectedClause}</p>
                    )}
                </Col>
            </Row>

            {/* Checkboxes for Standard Clause */}
            {selectedClause === 'Standard Clause' && (
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
                                    checked={checkboxes.organdonation}
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
                                    checked={checkboxes.cremation}
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
                                    checked={checkboxes.buried}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </Form>
                    </Col>
                </Row>
            )
            }

            {/* Text Area for Custom Clause */}
            {
                selectedClause === 'Custom Clause' && (
                    <Row>
                        <Col sm={12}>
                            <Form.Group controlId="customClause">
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={customClauseText}
                                    onChange={handleCustomClauseChange}
                                    placeholder="Enter your custom clause here..."
                                />
                                {validationErrors.customClauseText && (
                                    <p className="text-danger">{validationErrors.customClauseText}</p>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                )
            }

            {/* Other Wishes Section */}
            <Row className="mt-5">
                <Col sm={12}>
                    <Form>
                        <Form.Group controlId="otherWishes">
                            <Form.Label>Other Wishes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={otherWishes}
                                onChange={handleOtherWishesChange}
                                placeholder="Enter your other wishes here..."
                            />
                            {validationErrors.otherWishes && (
                                <p className="text-danger">{validationErrors.otherWishes}</p>
                            )}
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        </Container >
    );
}

export default Additional;
