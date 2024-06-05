
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Form from 'react-bootstrap/Form';




var selected_value = "";
export function getMarriedData() {
    return selected_value;

}

function Married({ humanSelector }) {
    const [selected, setSelected] = useState(null);
    const [value, setValue] = useState();
    const onInput = ({ target: { value } }) => setValue(value);
    const onFormSubmit = e => {
        selected_value = e.target.value;
    }



    return (
        <>
            {
                humanSelector == "spouse"?
                <><h1>Are you married?</h1><Form onChange={onFormSubmit}>
                        {['switch'].map((type) => (
                            <div key={`default-${type}`} className="mb-3">
                                <Form.Check // prettier-ignore

                                    type={type}
                                    id={`1`}
                                    label={`Yes I am Married`}
                                    value={"true"} />

                                <Form.Check

                                    type={type}
                                    label={`No I am not Married`}
                                    id={`2`}
                                    value={"false"} />
                                <Form.Check

                                    type={type}
                                    label={`I am in a common law relationship`}
                                    id={`3`}
                                    value={"soso"} />
                            </div>
                        ))}
                    </Form></>
                :
                null
            }
               {
                humanSelector == "children"?
                <><h1>Do you have childrens?</h1><Form onChange={onFormSubmit}>
                        {['switch'].map((type) => (
                            <div key={`default-${type}`} className="mb-3">
                                <Form.Check // prettier-ignore

                                    type={type}
                                    id={`1`}
                                    label={`I do have kids`}
                                    value={"true"} />

                                <Form.Check

                                    type={type}
                                    label={`I do not have kids`}
                                    id={`2`}
                                    value={"false"} />
                            </div>
                        ))}
                    </Form></>
                :
                null
            }
            

        </>




    );
}
export default Married;