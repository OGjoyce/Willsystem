// src/Components/Additional.jsx

import React, { useState, useEffect } from 'react';
import {
    Container,
    Dropdown,
    Row,
    Col,
    Form,
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ConfirmationModal from '@/Components/AdditionalComponents/ConfirmationModal';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';

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
            setCustomClauseText(customClauseText || '');
            setOtherWishes(otherWishes || '');
            setCheckboxes(checkboxes || {
                organdonation: false,
                cremation: false,
                buried: false,
            });
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

    // Validate inputs before proceeding
    const validateInputs = () => {
        let errors = {};

        if (selectedClause === 'Custom Clause') {
            if (!customClauseText.trim()) {
                errors.customClauseText = 'Custom Clause cannot be empty.';
            }
        }

        if (!otherWishes.trim()) {
            errors.otherWishes = 'Other Wishes cannot be empty.';
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    };

    // Handle the proceed action (e.g., clicking "Next" in the parent component)
    const handleProceed = () => {
        if (validateInputs()) {
            setToastMessage('Data validated successfully. Proceeding...');
            setShowToast(true);
            // Here you can call a function from the parent component to advance
            // For example, props.onProceed(getAdditionalInformation())
        } else {
            setToastMessage('Please correct the errors before proceeding.');
            setShowToast(true);
        }
    };

    // Handle data deletion (if necessary in the future)
    const handleDelete = () => {
        setModalMessage('Are you sure you want to delete all data?');
        setShowDeleteModal(true);
    };

    // Confirm deletion of data
    const confirmDelete = () => {
        setSelectedClause('Standard Clause');
        setCustomClauseText('');
        setOtherWishes('');
        setCheckboxes({
            organdonation: false,
            cremation: false,
            buried: false,
        });
        setValidationErrors({});
        setToastMessage('Data deleted successfully.');
        setShowToast(true);
        setShowDeleteModal(false);

        // Clear localStorage
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        delete formValues.additional;
        localStorage.setItem('formValues', JSON.stringify(formValues));
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

            {/* Action Buttons (Remove if not needed) */}
            {/*
      <Row className="mt-4">
        <Col sm={6}>
          <Button
            variant="danger"
            onClick={handleDelete}
            style={{ width: '100%' }}
          >
            <i className="bi bi-trash"></i> Delete Data
          </Button>
        </Col>
      </Row>
      */}

            {/* Notification Toast */}
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                message={modalMessage}
            />
        </Container >
    );
}

export default Additional;
