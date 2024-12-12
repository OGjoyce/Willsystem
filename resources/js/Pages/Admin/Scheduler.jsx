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
import SchedulerUI from '@/Components/Scheduler/Scheduler';
export default function Scheduler(){
    return (
        <>
            <AuthenticatedLayout
                user={"Admin"}
                header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Statitics</h2>}
            > <Head title={"Admin Statitics"} />
                <div className="py-12 bg-gray-100 min-h-screen">
                    <Container className="bg-white p-6 rounded-lg shadow-md">
                     
                    <SchedulerUI/>

                    </Container>
                </div>



            </AuthenticatedLayout>


        </>
    );
}