import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Form from 'react-bootstrap/Form';

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

function AddHuman({ married, childrens, human }) {
    const [relative, setRelative] = useState('');
    const [showOther, setShowOther] = useState(false);

    const handleRelativeChange = (e) => {
        const value = e.target.value;
        setRelative(value);
        setShowOther(value === 'Other');
    };

    return (
        <>
            <h1>Information details</h1>
            <Form>
                <Form.Group className="mb-3" controlId="firstNameId">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control type="text" placeholder="First Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="middleNameId">
                    <Form.Label>Middle Name</Form.Label>
                    <Form.Control type="text" placeholder="Middle Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastNameId">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control type="text" placeholder="Last Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="relativeId">
                    <Form.Label>Relative</Form.Label>
                    <Form.Control as="select" value={relative} onChange={handleRelativeChange}>
                        <option value="">Select...</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Children">Children</option>
                        <option value="Brother">Brother</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Other">Other</option>
                    </Form.Control>
                    {showOther && (
                        <Form.Group className="mt-3" controlId="otherRelativeId">
                            <Form.Label>Specify Other</Form.Label>
                            <Form.Control type="text" placeholder="Enter relation" />
                        </Form.Group>
                    )}
                    {married && (
                        <>
                            <Form.Group className="mb-3" controlId="emailId0">
                                <Form.Label>Email for notifications:</Form.Label>
                                <Form.Control type="email" placeholder="example@dot.com" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="phoneId">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control type="text" placeholder="+1(XXX)XXX-XXXX" />
                            </Form.Group>
                        </>
                    )}
                    {childrens && (
                        <>
                            <Form.Control readOnly defaultValue="Children" />
                            <Form.Group className="mb-3" controlId="emailId1">
                                {/* Email input can be added here if needed */}
                            </Form.Group>
                        </>
                    )}
                    {human && (
                        <>

                            <Form.Group className="mb-3" controlId="emailId1">
                                <Form.Label>Email for notifications:</Form.Label>
                                <Form.Control type="email" placeholder="example@dot.com" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="phoneId">
                                <Form.Label>Phone</Form.Label>
                                <Form.Control type="text" placeholder="+1(XXX)XXX-XXXX" />
                            </Form.Group>
                        </>
                    )}
                </Form.Group>
                <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City</Form.Label>
                    <Form.Control type="text" placeholder="..." />
                </Form.Group>
                <Form.Group className="mb-3" controlId="province">
                    <Form.Label>Province/State:</Form.Label>
                    <Form.Control type="text" placeholder="..." />
                </Form.Group>
                <Form.Group className="mb-3" controlId="country">
                    <Form.Label>Country:</Form.Label>
                    <Form.Control type="text" placeholder="..." />
                </Form.Group>
            </Form>
        </>
    );
}

export default AddHuman;
