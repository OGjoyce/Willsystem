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
    let something, dates, packagePRices;
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/getData');
                setData(response.data); // Assuming the response data is in the expected format
                something = JSON.parse(response.data);
                // Extract dates into a separate array
                dates = something.map(item => item.date);

                // Extract package prices into a separate array
                packagePRices = something.map(item => item["packageInfo.price"]);

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


    let option2 = {
        title: {
            text: 'Package Sales by Date',
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: data!== null? dates: ['mon', 'tue', 'th', 'wed', 'fr', 'sat', 'sund'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'Sales',
                type: 'bar',
                data: data!== null? packagePRices: [100, 120, 130, 150, 40, 600, 100],
            },
        ],
    };



    const option = {
        title: {
            text: 'Sample Bar Chart',
        },
        tooltip: {},
        xAxis: {
            type: 'category',
            data: ['mon', 'tue', 'th', 'wed', 'fr', 'sat', 'sund'],
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                name: 'Sales',
                type: 'bar',
                data: [100, 120, 130, 150, 40, 600, 100]
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
                        {
                            data != null ?
                                <ReactECharts option={option2} />
                                :
                                null

                        }

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



