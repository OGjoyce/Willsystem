
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
    var telephone = `+1 ${document.getElementById('phone').value}`;
    var fullname = document.getElementById('firstName')?.value + ' ' + document.getElementById('middleName')?.value + ' ' + document.getElementById('lastName')?.value;
    var email = document.getElementById('email').value;

    var obj = {
        "city": city,
        "province": province,
        "country": country,
        "telephone": telephone,
        "fullName": fullname,
        "email": email,
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

        // Elimina cualquier carácter que no sea un número
        const phoneNumber = value.replace(/[^\d]/g, '').slice(0, 10); // Limita a 10 dígitos

        // Aplica el formato XXX XXX XXXX

        return phoneNumber;
    };

    const handlePhoneChange = (e) => {
        const formattedPhoneNumber = formatPhoneNumber(e.target.value);
        setPhone(formattedPhoneNumber);
    };




    return (
        <>

            <Listbox Label={"province"} value={selected} onChange={handleOnChange}>
                {({ open }) => (
                    <>

                        {/* Integrate CityAutocomplete */}
                        <div className='mb-2'>
                            <CityAutocomplete onCitySelect={handleCitySelect} validationErrors={validationErrors} />

                        </div>
                        <div>
                            <label htmlFor="phone" className="block">
                                Phone Number
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                                </div>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text>+1 </InputGroup.Text>
                                    <FormControl
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        placeholder="XXX XXX-XXXX"
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        aria-label="Phone Number"
                                    />
                                </InputGroup>
                            </div>
                            {validationErrors.telephone && <p className="mt-2 text-sm text-red-600">{validationErrors.telephone}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block">
                                Email
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="johndoe@willexample.com...." />
                            </div>
                            {validationErrors.email && <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="name" className="block ">
                                First Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="firstName"
                                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="" />
                            </div>
                            <label htmlFor="name" className="block ">
                                Middle Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="middleName"
                                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="" />
                            </div>
                            <label htmlFor="name" className="block ">
                                Last Name
                            </label>
                            <div className="relative mt-2 rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">

                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    id="lastName"
                                    className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="" />
                            </div>
                            {validationErrors.fullName && <p className="mt-2 text-sm text-red-600">{validationErrors.fullName}</p>}
                        </div>
                    </>
                )}
            </Listbox></>




    );
}
export default FormCity