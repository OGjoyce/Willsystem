
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Image from 'react-bootstrap/Image';

import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
var selected_value = "";


function Additional({ datas }) {



    return (
        <Container>
            <Row>
                <Col xs={6} md={4}>
                    <Image src="holder.js/171x180" rounded />
                </Col>
                <Col xs={6} md={4}>
                
                </Col>
            </Row>
        </Container>





    );
}
export default Additional;