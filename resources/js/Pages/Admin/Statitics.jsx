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
import ReactECharts from 'echarts-for-react';

export default function Statitics() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getData');
                setData(response.data); // Assuming the response data is in the expected format
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only on mount

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    const option = {
        title: {
            text: 'Sample Bar Chart',
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'Sales',
                type: 'bar',
                data: [120, 200, 150, 80, 70, 110, 130],
            },
        ],
    };
    return (
        <>
            <AuthenticatedLayout
                user={"Admin"}
                header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Statitics</h2>}
            > <Head title={"Admin Statitics"} />
                <div className="py-12 bg-gray-100 min-h-screen">
                    <Container className="bg-white p-6 rounded-lg shadow-md">
                        <ReactECharts option={option} />;
                        <div>
                            <h1>Data from Server:</h1>
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div>


                    </Container>
                </div>



            </AuthenticatedLayout>


        </>
    );

}



