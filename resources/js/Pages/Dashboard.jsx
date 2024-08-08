import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomToast from '@/Components/CustomToast';

export default function Dashboard({ auth }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('Success');
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [actionTriggered, setActionTriggered] = useState(false);

    let username = auth.user.name;

    useEffect(() => {
        if (actionTriggered && redirectUrl) {
            const timer = setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [actionTriggered, redirectUrl]);

    const handleLinkClick = (event, url, selected) => {
        event.preventDefault();
        switch (selected) {
            case 'continue-will':
                const object_status = JSON.parse(localStorage.getItem("fullData"));
                if (!object_status) {
                    window.location.href = route('view');
                } else {
                    setToastMessage(
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            borderRadius: '0.25rem',
                            fontSize: '1rem',
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}>
                            <Spinner animation="border" role="status" style={{ marginRight: '0.5rem' }}>
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                            <p style={{ margin: 0 }}>
                                Recovering data for {object_status[0].personal.email}
                            </p>
                        </div>
                    );

                    setToastTitle('Notification');
                    setShowToast(true);
                    setRedirectUrl(url);
                    setActionTriggered(true);
                    setTimeout(() => {
                        setShowToast(false);
                    }, 1500);
                }
                break;

            case 'new-will':
                localStorage.removeItem('currIdObjDB');
                localStorage.removeItem('currentPointer');
                localStorage.removeItem('fullData');
                localStorage.removeItem('formValues');

                window.location.href = url;
                break;

            case 'view':
                localStorage.removeItem('currIdObjDB');
                localStorage.removeItem('currentPointer');
                localStorage.removeItem('fullData');
                localStorage.removeItem('formValues');
                window.location.href = url;
                break;
            case 'packages':
                window.location.href = url;
                break;

            default:
                console.error('Unknown selection:', selected);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {`Welcome, ${username}`}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={toastMessage}
                title={toastTitle}
            />

            <div className="py-12" style={{ background: '#f1f5f9' }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Container className="text-center my-5">
                        <Row xs={1} md={2} lg={4} className="g-4">
                            <Col>
                                <Card>
                                    <Card.Body>
                                        <i className="bi bi-file-earmark-text"></i>
                                        <Card.Title>Continue Will</Card.Title>
                                        <Button className='mt-3' onClick={(e) => handleLinkClick(e, route('personal'), "continue-will")} variant="outline-dark">Continue</Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card>
                                    <Card.Body>
                                        <i className="bi bi-files"></i>
                                        <Card.Title>Create Will + 2 POA</Card.Title>
                                        <Button className='mt-3' onClick={(e) => handleLinkClick(e, route('personal'), "new-will")} variant="outline-dark">Get Started</Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card>
                                    <Card.Body>
                                        <i className="bi bi-search"></i>
                                        <Card.Title>Search Files</Card.Title>
                                        <Button className='mt-3' onClick={(e) => handleLinkClick(e, route('view'), "view")} variant="outline-dark">Search Now</Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col>
                                <Card>
                                    <Card.Body>
                                        <i className="bi bi-box-seam"></i>
                                        <Card.Title>Packages</Card.Title>
                                        <Button className='mt-3' onClick={(e) => handleLinkClick(e, route('packages'), "packages")} variant="outline-dark">View Packages</Button>
                                    </Card.Body>
                                </Card>

                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
