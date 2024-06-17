
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

const people = [


    {
        id: 1,
        name: 'Alberta',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Flag_of_Alberta.svg/1200px-Flag_of_Alberta.svg.png',
    },
    {
        id: 2,
        name: 'British Columbia',
        avatar:
            'https://en.wikipedia.org/wiki/British_Columbia#/media/File:Flag_of_British_Columbia.svg',
    },
    {
        id: 3,
        name: 'Manitoba',
        avatar:
            'https://en.wikipedia.org/wiki/Manitoba#/media/File:Flag_of_Manitoba.svg',
    },
    {
        id: 4,
        name: 'New Brunswick',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Flag_of_New_Brunswick.svg/640px-Flag_of_New_Brunswick.svg.png',
    },
    {
        id: 5,
        name: 'Newfoundland and Labrador',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Newfoundland_and_Labrador.svg',
    },
    {
        id: 6,
        name: 'Nova Scotia',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_Nova_Scotia.svg',
    },
    {
        id: 7,
        name: 'Nunavut',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/9/90/Flag_of_Nunavut.svg',
    },
    {
        id: 8,
        name: 'Ontario',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/8/88/Flag_of_Ontario.svg',
    },
    {
        id: 9,
        name: 'Prince Edward Island',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/d/d7/Flag_of_Prince_Edward_Island.svg',
    },
    {
        id: 10,
        name: 'Québec',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/5/5f/Flag_of_Quebec.svg',
    },
    {
        id: 11,
        name: 'Saskatchewan',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/b/bb/Flag_of_Saskatchewan.svg',
    },
    {
        id: 12,
        name: 'Yukon Territory',
        avatar:
            'https://upload.wikimedia.org/wikipedia/commons/6/69/Flag_of_Yukon.svg',
    },
]
var dropdown_selected = "";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function getFormData(){
    
    var city = document.getElementById('city').value;
    var telephone = document.getElementById('phone').value;
    var fullname = document.getElementById('fullname').value;
    var province = dropdown_selected;
    var obj = {
        "city" : city,
        "telephone" : telephone,
        "province" : province.name,
        "fullName": fullname
    }
    return obj;
}
function setData(x){
    dropdown_selected = x;
}

function FormCity({ auth, laravelVersion, phpVersion }) {
    const [selected, setSelected] = useState(people[9])

    const handleOnChange = (selected) =>{
        setSelected(selected);
        setData(selected);
        return true;
    }
    return (
        <>
        
        <Listbox Label={"province"} value={selected} onChange={handleOnChange}>
            {({ open }) => (
                <>

                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Province</Listbox.Label>
                    <div className="relative mt-2">
                        <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                            <span className="flex items-center">
                                <img src={selected.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                                <span className="ml-3 block truncate">{selected.name}</span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </Listbox.Button>

                        <Transition
                            show={open}
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {people.map((person) => (
                                    <Listbox.Option
                                        key={person.id}
                                        className={({ active }) => classNames(
                                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                            'relative cursor-default select-none py-2 pl-3 pr-9'
                                        )}
                                        value={person}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <div className="flex items-center">
                                                    <img src={person.avatar} alt="" className="h-5 w-5 flex-shrink-0 rounded-full" />
                                                    <span
                                                        className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                                                    >
                                                        {person.name}
                                                    </span>
                                                </div>

                                                {selected ? (
                                                    <span
                                                        className={classNames(
                                                            active ? 'text-white' : 'text-indigo-600',
                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                        )}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Transition>
                    </div>

                    <div>
                        <label htmlFor="City" className="block text-sm font-medium leading-6 text-gray-900">
                            City
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">~</span>
                            </div>
                            <input
                                type="text"
                                name="City"
                                id="city"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="City" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium leading-6 text-gray-900">
                            Phone Number
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              
                            </div>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="+1 (XXX) XXX-XXXX" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                            Full Name
                        </label>
                        <div className="relative mt-2 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              
                            </div>
                            <input
                                type="text"
                                name="name"
                                id="fullname"
                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="John Doe..." />
                        </div>
                    </div>
                </>
            )}
        </Listbox></>




    );
}
export default FormCity;