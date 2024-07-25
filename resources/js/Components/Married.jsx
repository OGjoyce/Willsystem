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
export function getMarriedData() {
    return selected_value;
}

function Married({ humanSelector }) {
    const [selected, setSelected] = useState("false"); // "No estoy casado" por defecto

    const handleOptionChange = (e) => {
        const { value } = e.target;
        setSelected(value);
        selected_value = value;
    };

    return (
        <>
            {humanSelector === "spouse" ? (
                <>
                    <h1>Are you married?</h1>
                    <Form>
                        <div className="mb-3">
                            <Form.Check
                                type="radio"
                                id="1"
                                label="Yes I am Married"
                                value="true"
                                checked={selected === "true"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="2"
                                label="No I am not Married"
                                value="false"
                                checked={selected === "false"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="3"
                                label="I am in a common law relationship"
                                value="soso"
                                checked={selected === "soso"}
                                onChange={handleOptionChange}
                            />
                        </div>
                    </Form>
                </>
            ) : null}
            {humanSelector === "children" ? (
                <>
                    <h1>Do you have children?</h1>
                    <Form>
                        <div className="mb-3">
                            <Form.Check
                                type="radio"
                                id="4"
                                label="I do have kids"
                                value="true"
                                checked={selected === "true"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="5"
                                label="I do not have kids"
                                value="false"
                                checked={selected === "false"}
                                onChange={handleOptionChange}
                            />
                        </div>
                    </Form>
                </>
            ) : null}
        </>
    );
}

export default Married;
