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
import MapChart from '@/Components/MapChart';
import EmailForm from '@/Components/EmailForm';
export default function Statitics() {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartFlag, setChartFlag] = useState(false);
    let dates = null;
    let packagePRices = null;
    let something;
    const [option2, setOption2] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://willsystemapp.com:5000/getData');
                setData(response.data); // Assuming the response data is in the expected format
                something = JSON.parse(response.data);
                // Extract dates into a separate array
                dates = something.map(item => item.date);

                // Extract package prices into a separate array
                packagePRices = something.map(item => item["packageInfo.price"]);

                setOption2({
                    title: {
                        text: 'Package Sales by Date',
                    },
                    tooltip: {},
                    xAxis: {
                        type: 'category',
                        data: dates,
                    },
                    yAxis: {
                        type: 'value',
                    },
                    series: [
                        {
                            name: 'Sales',
                            type: 'bar',
                            data: packagePRices,
                        },
                    ],
                });

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
                setChartFlag(true);

                console.log(Date.now())
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only on mount
    let optionLoad = {
        graphic: {
          elements: [
            {
              type: 'group',
              left: 'center',
              top: 'center',
              children: new Array(7).fill(0).map((val, i) => ({
                type: 'rect',
                x: i * 20,
                shape: {
                  x: 0,
                  y: -40,
                  width: 10,
                  height: 80
                },
                style: {
                  fill: '#5470c6'
                },
                keyframeAnimation: {
                  duration: 1000,
                  delay: i * 200,
                  loop: true,
                  keyframes: [
                    {
                      percent: 0.5,
                      scaleY: 0.3,
                      easing: 'cubicIn'
                    },
                    {
                      percent: 1,
                      scaleY: 1,
                      easing: 'cubicOut'
                    }
                  ]
                }
              }))
            }
          ]
        }
      };

    if (loading) return <ReactECharts option={optionLoad} />;
    if (error) return <p>Error: {error.message}</p>;

    console.log(Date.now())









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
                        {option2 !== null?
                         <ReactECharts option={option2} />
                        :
                        <p>chart loading...</p>
                        }

                        {/* <div>
                            <h1>Data from Server:</h1>
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        </div> */}
                         <MapChart />
                         <EmailForm/>


                    </Container>
                </div>



            </AuthenticatedLayout>


        </>
    );

}



