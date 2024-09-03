import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

import Form from 'react-bootstrap/Form';
import { FormCheck } from 'react-bootstrap';

var selected_value = "";

export function getHumanData(params) {
    if (params != false) {
        var firstName = document.getElementById('firstNameId').value;
        var middleName = document.getElementById('middleNameId').value;
        var lastName = document.getElementById('lastNameId').value;
        var relative = document.getElementById('relativeId').value;
        if (relative === 'Other') {
            relative = document.getElementById('otherRelativeId').value;
        }
        var city = document.getElementById('city').value;
        var province = document.getElementById('province').value;
        var country = document.getElementById('country').value;

        var obj;
        if (params === "childrens") {
            obj = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                relative: relative,
                email: "NA",
                phone: "NA",
                city: city,
                province: province,
                country: country
            };
        } else {
            var control = 0;
            var email = "NA";
            try {
                email = document.getElementById('emailId0').value;
            } catch (error) {
                control = 1;
                email = document.getElementById('emailId1').value;
            }

            var phone = document.getElementById('phoneId').value;
            obj = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                relative: relative,
                email: email,
                phone: phone,
                city: city,
                province: province,
                country: country
            };
        }
        return obj;
    } else {
        return {
            firstName: "NA",
            middleName: "NA",
            lastName: "NA",
            relative: "NA",
            email: "NA",
            phone: "NA"
        };
    }
}

function AddHuman({ married, childrens, human, errors, onDataChange }) {
    var relationType = null
    if (married) { relationType = 'spouse' }
    if (childrens) { relationType = 'child' }

    const [formValues, setFormValues] = useState(() => {
        if (relationType !== 'spouse') return {};
        const key = 'formValues';
        const savedValues = localStorage.getItem(key);
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        return parsedValues[relationType] || {};
    });

    const [relative, setRelative] = useState('');
    const [showOther, setShowOther] = useState(false);
    const [validationErrors, setValidationErrors] = useState(errors);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (relationType === 'spouse') {
            const key = 'formValues';
            const storedValues = JSON.parse(localStorage.getItem(key)) || {};
            storedValues[relationType] = formValues;
            localStorage.setItem(key, JSON.stringify(storedValues));
        }
    }, [formValues, relationType]);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        const propertyName = id.replace(/Id\d*$/, ''); // Remove 'Id', 'Id0', 'Id1', etc.

        const newValues = { ...formValues, [propertyName]: value };
        setFormValues(newValues);
    };

    const handleRelativeChange = (e) => {
        const value = e.target.value;
        setRelative(value);
        setShowOther(value === 'Other');
    };

    const formatPhoneNumber = (value) => {
        if (!value) return value;

        const phoneNumber = value.replace(/[^\d]/g, '');

        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 2) return `+${phoneNumber}`;
        if (phoneNumberLength < 5) {
            return `+${phoneNumber[0]} (${phoneNumber.slice(1, 4)}`;
        }
        if (phoneNumberLength < 8) {
            return `+${phoneNumber[0]} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}`;
        }
        return `+${phoneNumber[0]} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 11)}`;
    };

    const handlePhoneChange = (e) => {
        const { id } = e.target;
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);

        if (relationType !== 'Child') {
            setFormValues((prevValues) => {
                const newValues = { ...prevValues, phone: formattedPhoneNumber };
                return newValues;
            });
        }
    };

    const isRelativeReadOnly = married || childrens;

    const defaultRelativeValue = married ? 'Spouse' : (childrens ? 'Child' : '');

    return (
        <>
            {married ? <h1>Spouse Details</h1> : <h1>Information details</h1>}
            <Form>
                <Form.Group className="mb-3" controlId="firstNameId">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="First Name"
                        value={formValues?.firstName || ''}
                        onChange={handleInputChange}

                    />
                    {validationErrors.firstName && <p className="mt-2 text-sm text-red-600">{validationErrors.firstName}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="middleNameId">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Middle Name"
                        value={formValues?.middleName || ''}
                        onChange={handleInputChange}
                    />
                    {validationErrors.middleName && <p className="mt-2 text-sm text-red-600">{validationErrors.middleName}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastNameId">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Last Name"
                        value={formValues?.lastName || ''}
                        onChange={handleInputChange}
                    />
                    {validationErrors.lastName && <p className="mt-2 text-sm text-red-600">{validationErrors.lastName}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="relativeId">
                    <Form.Label>Relative</Form.Label>
                    {isRelativeReadOnly ? (
                        <Form.Control type="text" value={defaultRelativeValue} readOnly />
                    ) : (
                        <>
                            <Form.Control as="select" value={relative} onChange={handleRelativeChange}>
                                <option value="">Select...</option>
                                <option value="Brother">Brother</option>
                                <option value="Uncle">Uncle</option>
                                <option value="Other">Other</option>
                            </Form.Control>
                            {!showOther && validationErrors.relative && <p className="mt-2 text-sm text-red-600">{validationErrors.relative}</p>}
                        </>
                    )}
                    {showOther && !isRelativeReadOnly && (
                        <>
                            <Form.Group className="mt-3" controlId="otherRelativeId">
                                <Form.Label>Specify Other</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter relation"
                                    value={formValues?.otherRelative || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            {validationErrors.otherRelative && <p className="mt-2 text-sm text-red-600">{validationErrors.otherRelative}</p>}
                        </>
                    )}
                    {married && (
                        <>
                            <Form.Group className="mb-3" controlId="emailId0">
                                <Form.Label>Email for notifications:</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="example@dot.com"
                                    value={formValues?.email || ''}
                                    onChange={handleInputChange}
                                />
                                {!childrens && validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="phoneId">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="+1(XXX)XXX-XXXX"
                                    onChange={handlePhoneChange}
                                    value={formValues?.phone || phone}
                                />
                                {!childrens && validationErrors.phone && <p className="mt-2 text-sm text-red-600">{validationErrors.phone}</p>}
                            </Form.Group>
                        </>
                    )}
                    {childrens && (
                        <>
                            <Form.Group className="mb-3" controlId="emailId1">
                                {/* Email input can be added here if needed */}
                            </Form.Group>
                        </>
                    )}
                    {human && (
                        <>
                            <Form.Group className="mb-3" controlId="emailId1">
                                <Form.Label>Email for notifications:</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="example@dot.com"
                                    value={formValues?.email || ''}
                                    onChange={handleInputChange}
                                />
                                {(married || human) && validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="phoneId">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="+1(XXX)XXX-XXXX"
                                    onChange={handlePhoneChange}
                                    value={formValues?.phone || phone}
                                />
                                {(married || human) && validationErrors.phone && <p className="mt-2 text-sm text-red-600">{validationErrors.phone}</p>}
                            </Form.Group>
                        </>
                    )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="..."
                        value={formValues?.city || ''}
                        onChange={handleInputChange}
                    />
                    {validationErrors.city && <p className="mt-2 text-sm text-red-600">{validationErrors.city}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="province">
                    <Form.Label>Province/State:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="..."
                        value={formValues?.province || ''}
                        onChange={handleInputChange}
                    />
                    {validationErrors.province && <p className="mt-2 text-sm text-red-600">{validationErrors.province}</p>}
                </Form.Group>
                <Form.Group className="mb-3" controlId="country">
                    <Form.Label>Country:</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="..."
                        value={formValues?.country || ''}
                        onChange={handleInputChange}
                    />
                    {validationErrors.country && <p className="mt-2 text-sm text-red-600">{validationErrors.country}</p>}
                </Form.Group>
            </Form>
        </>
    );
}

export default AddHuman;