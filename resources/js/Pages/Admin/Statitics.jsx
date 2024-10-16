import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Dropdown,
    Button,
    Container,
    Row,
    Col,
    Form,
    Alert,
    Spinner,
    InputGroup,
} from 'react-bootstrap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import axios from 'axios';

export default function Statitics() {

    return (
            <>
            <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Statitics</h2>}
        > <Head title={"Admin Statitics"} />


        </AuthenticatedLayout>


            </>
            );

}



