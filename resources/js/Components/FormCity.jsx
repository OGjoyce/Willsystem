import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import CityAutocomplete from './CityAutocomplete';
import { InputGroup, FormControl } from 'react-bootstrap';

let city = undefined
let country = undefined
let province = undefined
let sendVia = "";

var dropdown_selected = "";
var ErrorFullName = () => { }
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const handleCitySelect = (selectedData) => {
    city = selectedData.city,
        province = selectedData.province,
        country = selectedData.country
};

export function getFormData() {
    var telephone = `+${document.getElementById('phone').value}`;
    var fullname = document.getElementById('firstName')?.value + ' ' + document.getElementById('middleName')?.value + ' ' + document.getElementById('lastName')?.value;
    var email = document.getElementById('email').value;

    var obj = {
        "city": city,
        "province": province,
        "country": country,
        "telephone": telephone,
        "fullName": fullname,
        "email": email,
        "send_via": sendVia // Se agregó la opción para seleccionar entre BTL y L&L
    }

    return obj;
}

function setData(x) {
    dropdown_selected = x;
}

function FormCity({ auth, laravelVersion, phpVersion, errors }) {
    const [selected, setSelected] = useState('')
    const [validationErrors, setValidationErrors] = useState(errors)
    const [phone, setPhone] = useState('');
    const [selectedOption, setSelectedOption] = useState("BTL");

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    const handleOnChange = (selected) => {
        setSelected(selected);
        setData(selected);
        return true;
    }

    const formatPhoneNumber = (value) => {
        if (!value) return '';
        const phoneNumber = value.replace(/[^\d]/g, '')
        return phoneNumber;
    };

    const handlePhoneChange = (e) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };

    const handleCheckboxChange = (option) => {
        setSelectedOption(option);
        sendVia = option;
    }

    return (
        <>
            <Listbox Label={"province"} value={selected} onChange={handleOnChange}>
                {({ open }) => (
                    <>
                        <div className='mb-2'>
                            <CityAutocomplete onCitySelect={handleCitySelect} validationErrors={validationErrors} />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block">Phone Number</label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text>+ </InputGroup.Text>
                                <FormControl
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    placeholder="X XXX XXX-XXXX"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    aria-label="Phone Number"
                                />
                            </InputGroup>
                            {validationErrors.telephone && <p className="mt-2 text-sm text-red-600">{validationErrors.telephone}</p>}
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="block w-full"
                                placeholder="johndoe@willexample.com" />
                            {validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
                        </div>
                        <div>
                            <label>First Name</label>
                            <input type="text" name="name" id="firstName" className="block w-full" />
                            <label>Middle Name</label>
                            <input type="text" name="name" id="middleName" className="block w-full" />
                            <label>Last Name</label>
                            <input type="text" name="name" id="lastName" className="block w-full" />
                            {validationErrors.fullName && <p className="mt-2 text-sm text-red-600">{validationErrors.fullName}</p>}
                        </div>
                        <div className="mt-4">
                            <label className="block font-medium text-gray-700">Send via:</label>
                            <div className="flex gap-4 mt-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedOption === "BTL"}
                                        onChange={() => handleCheckboxChange("BTL")}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">BTL</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedOption === "L&L"}
                                        onChange={() => handleCheckboxChange("L&L")}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">L&L</span>
                                </label>
                            </div>
                        </div>
                    </>
                )}
            </Listbox>
        </>
    );
}

export default FormCity;
