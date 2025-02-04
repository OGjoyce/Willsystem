// components/AddHuman.js

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { extractData } from '@/utils/objectStatusUtils';
// Import the CityAutocomplete component
import CityAutocomplete from './CityAutocomplete';
import { Form, InputGroup } from 'react-bootstrap';

let city = undefined
let country = undefined
let province = undefined
let blendedFamily = false
let addToSpousalWill = false
let addToSpousalRelatives = false

let isFirstCheckDone = false;

export function getHumanData(params) {
    if (params !== false) {
        isFirstCheckDone = true;
        const firstName = document.getElementById('firstNameId').value;
        const middleName = document.getElementById('middleNameId').value;
        const lastName = document.getElementById('lastNameId').value;
        let relative = document.getElementById('relativeId')?.value;
        if (relative === 'Other') {
            relative = document.getElementById('otherRelativeId')?.value;
        }

        let obj;
        if (params === "childrens") {
            obj = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                relative: relative,
                email: "NA",
                //    phone: "NA",
                blendedFamily: blendedFamily,
                isIncludedOnSpousalWill: addToSpousalWill,
                city: city,
                province: province,
                country: country
            };
        } else {
            let control = 0;
            let email = "NA";
            try {
                email = document.getElementById('emailId0')?.value;
            } catch (error) {
                control = 1;
                email = document.getElementById('emailId1')?.value;
            }

            const phone = document.getElementById('phoneId')?.value;
            obj = {
                firstName: firstName,
                middleName: middleName,
                lastName: lastName,
                relative: relative,
                email: document.getElementById('emailId1')?.value,
                //  phone: `+${phone}`,
                phone: `+${phone}` || null,
                city: city,
                province: province,
                country: country,
                isIncludedOnSpousalRelatives: addToSpousalRelatives,
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
            // phone: "NA"
        };
    }
}

function AddHuman({ datas, married, childrens, human, errors, onDataChange, documents }) {
    let relationType = null;
    if (married) { relationType = 'spouse'; }
    if (childrens) { relationType = 'child'; }
    const [formValues, setFormValues] = useState(() => {
        if (relationType !== 'spouse') return {};
        const key = 'formValues';
        const savedValues = localStorage.getItem(key);
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        return parsedValues[relationType] || {};
    });

    const [relative, setRelative] = useState('');
    const [showOther, setShowOther] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [phone, setPhone] = useState('');
    const [isBlendedFamily, setIsBlendedFamily] = useState(false)
    const [isSpousalDocumentAvailable, setIsSpousalDocumentAvailable] = useState(false)
    const [isIncludedOnSpousal, setIsIncludedOnSpousal] = useState(false)
    const [isSharedRelative, setIsSharedRelative] = useState(false)
    const [isDataLoaded, setIsDataLoaded] = useState(false)

    useEffect(() => {
        setValidationErrors({})
    }, [])

    useEffect(() => {
        if (married) {
            const spouseData = extractData(datas, "married", null, {});
            setFormValues(spouseData);
            setPhone(spouseData.phone || "");
            const prevErrors = validationErrors
            delete prevErrors.email
            setValidationErrors(prevErrors)
            setIsDataLoaded(true)
        }
    }, [datas, married]);

    useEffect(() => {
        const spousalWill = documents?.find(document => document.docType === "spousalWill")

        if (spousalWill) {
            setIsSpousalDocumentAvailable(true)
        } else {
            setIsSpousalDocumentAvailable(false)
        }
        console.log('documents', documents)
    }, [documents])

    useEffect(() => {
        blendedFamily = isBlendedFamily
        addToSpousalWill = isIncludedOnSpousal
        addToSpousalRelatives = isSharedRelative
    }, [isBlendedFamily, isIncludedOnSpousal, isSharedRelative])



    useEffect(() => {
        setValidationErrors(errors);
        if (married && isFirstCheckDone && !isDataLoaded) {

            const isValidEmail = (email) => {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
            };
            const isValidPhone = (phone) => {
                const re = /^\+\d+$/;
                return re.test(phone);
            };


            const data = getHumanData()
            if (!data.email || !isValidEmail(data.email)) {
                errors.email = 'Valid email is required';
            }

            if (!data.phone || !isValidPhone(data.phone)) {
                errors.phone = 'Valid phone number is required (+X XXX XXX XXXX)';
            }
        }
    }, [errors, married, isDataLoaded]);

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
        if (!value) return '';

        // Elimina cualquier carácter que no sea un número
        const phoneNumber = value.replace(/[^\d]/g, '').slice(0, 11); // Limita a 10 dígitos

        // Aplica el formato XXX XXX XXXX

        return phoneNumber;
    };


    const handlePhoneChange = (e) => {
        const { id } = e.target;
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);

        if (relationType !== 'child') {
            setFormValues((prevValues) => {
                const newValues = { ...prevValues, phone: formattedPhoneNumber };
                return newValues;
            });
        }
    };

    const handleCitySelect = (selectedData) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            city: selectedData.city,
            province: selectedData.province,
            country: selectedData.country,
        }));

        city = selectedData.city,
            province = selectedData.province,
            country = selectedData.country
    };

    const isRelativeReadOnly = married || childrens;

    const defaultRelativeValue = married ? 'Spouse' : (childrens ? 'Child' : '');

    return (
        <>
            {married ? <h1>Spouse Details</h1> : <h1>Information Details</h1>}
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
                {
                    !human && <Form.Group className="mb-3" controlId="relativeId">
                        <Form.Label>Relative</Form.Label>
                        {isRelativeReadOnly ? (
                            <Form.Control type="text" value={defaultRelativeValue} readOnly />
                        ) : (
                            <>
                                <Form.Control as="select" value={relative} onChange={handleRelativeChange}>
                                    <option value="">Select...</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Father">Father</option>
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Uncle">Uncle</option>
                                    <option value="Aunt">Aunt</option>
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
                        {childrens && isSpousalDocumentAvailable && <>
                            <Form.Check
                                type="checkbox"
                                className='mt-2'
                                label="Blended family"
                                checked={isBlendedFamily}
                                onChange={() => { setIsBlendedFamily(!isBlendedFamily) }}
                            />
                            <Form.Check
                                type="checkbox"
                                className='mt-2'
                                label="Include them on Spousal Will"
                                checked={isIncludedOnSpousal}
                                onChange={() => {
                                    setIsIncludedOnSpousal(!isIncludedOnSpousal)
                                }}
                            />
                        </>}

                        {(married && isSpousalDocumentAvailable) && (
                            <>
                                <Form.Group className="mb-3" controlId="emailId1">
                                    <Form.Label>Email for Notifications:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="example@domain.com"
                                        value={formValues?.email || ''}
                                        onChange={handleInputChange}
                                    />
                                    {(married || human) && validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
                                </Form.Group>

                                {false && (
                                    <>
                                        <Form.Label>Phone</Form.Label>
                                        <InputGroup className="mb-3" controlId="phoneId">

                                            <InputGroup.Text>+ </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                name="phone"
                                                id="phoneId"
                                                placeholder="X XXX XXX-XXXX"
                                                value={formValues?.phone || phone}
                                                onChange={handlePhoneChange}

                                            />
                                        </InputGroup>
                                        {(married || human) && validationErrors.phone && <p className="mt-2 text-sm text-red-600">{validationErrors.phone}</p>}

                                    </>
                                )}

                            </>
                        )}
                    </Form.Group>
                }

                {/* Integrate CityAutocomplete */}
                <CityAutocomplete onCitySelect={handleCitySelect} validationErrors={validationErrors} formValues={formValues} />
                {!married && !childrens && isSpousalDocumentAvailable && (<Form.Check
                    type="checkbox"

                    className='mt-2'
                    label="Include them in the list of the spouse's relatives"
                    checked={isSharedRelative}
                    onChange={() => { setIsSharedRelative(!isSharedRelative) }}
                />)}
            </Form>
        </>
    );
}

export default AddHuman;
