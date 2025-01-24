import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { extractData } from '@/utils/objectStatusUtils';
import Form from 'react-bootstrap/Form';

let selected_value = "";
export function getMarriedData() {
    return selected_value;
}

function Married({ datas, humanSelector }) {
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        // Extraer la selección inicial desde `datas`.
        let initialSelection = null
        if (humanSelector == "spouse") {
            initialSelection = extractData(datas, "marriedq", "selection", "false");
        } else {
            initialSelection = extractData(datas, "kidsq", "selection", "false");
        }
        setSelected(initialSelection);
    }, [datas]);

    selected_value = selected
    useEffect(() => {
        const key = 'formValues';
        const savedValues = localStorage.getItem(key);
        const parsedValues = savedValues ? JSON.parse(savedValues) : {};
        if (humanSelector === "spouse") {
            parsedValues.marriedq = selected;
        } else if (humanSelector === "children") {
            parsedValues.kidsq = selected;
        }
        localStorage.setItem(key, JSON.stringify(parsedValues));
    }, [selected, humanSelector]);
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
                                checked={selected == "true"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="2"
                                label="No I am not Married"
                                value="false"
                                checked={selected == "false"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="3"
                                label="I am in a common law relationship"
                                value="soso"
                                checked={selected == "soso"}
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
                                checked={selected == "true"}
                                onChange={handleOptionChange}
                            />
                            <Form.Check
                                type="radio"
                                id="5"
                                label="I do not have kids"
                                value="false"
                                checked={selected == "false"}
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
