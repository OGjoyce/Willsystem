import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ObjStatusForm from '@/Components/ObjStatusForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Image from 'react-bootstrap/Image';
import 'bootstrap-icons/font/bootstrap-icons.css';



import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
const View = () => {
    const [objStatuses, setObjStatuses] = useState([]);

    useEffect(() => {
        axios.get('/api/obj-statuses')
            .then(response => {
                setObjStatuses(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);

    return (
        // <><div>
        //     <h1>ObjStatus List</h1>
        //     <ul>
        //         {objStatuses.map(objStatus => (
        //             <li key={objStatus.id}>{JSON.stringify(objStatus.information)}</li>
        //         ))}
        //     </ul>
        // </div>
        <>
        <br></br>
        <br></br>
        <Container>

        </Container>
        </>
    );
};

export default View;