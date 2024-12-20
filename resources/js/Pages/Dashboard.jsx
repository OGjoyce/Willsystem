import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';

const CustomCard = styled(Card)`
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
  height: 100%;
  background: #fff;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.3);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.3rem;
  margin: auto;
  margin-bottom: 0.5rem;
  color: #002c42;
  transition: transform 0.2s ease, color 0.2s ease;

  ${CustomCard}:hover & {
    transform: scale(1.15);
    color: #004060;
  }
`;

const CardBody = styled(Card.Body)`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #fff;
`;

const CardTitle = styled(Card.Title)`
  text-align: center;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #002c42;
`;

const CardText = styled(Card.Text)`
text-align: center;
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  flex: 1;
`;

export default function Dashboard({ auth }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('Success');
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [actionTriggered, setActionTriggered] = useState(false);

    const username = auth.user.name;

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
                const objectStatus = JSON.parse(localStorage.getItem('fullData'));
                if (!objectStatus) {
                    window.location.href = route('view');
                } else {
                    setToastMessage(
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#d4edda', color: '#155724', borderRadius: '0.25rem', fontSize: '1rem', maxWidth: '400px', margin: '0 auto' }}>
                            <Spinner animation="border" role="status" style={{ marginRight: '0.5rem', width: '8px', height: '8px' }}>
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                            <p style={{ margin: 0 }}>Recovering data for {objectStatus[0].personal.email}</p>
                        </div>
                    );
                    setToastTitle('Notification');
                    setShowToast(true);
                    setRedirectUrl(url);
                    setActionTriggered(true);
                    setTimeout(() => setShowToast(false), 1500);
                }
                break;

            case 'new-will':
            case 'view':
                localStorage.clear();
                window.location.href = url;
                break;

            default:
                window.location.href = url;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{`Welcome, ${username}`}</h2>}
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
                    <Container>
                        <Row xs={1} md={2} lg={4} className="g-4">

                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-files"></i>
                                        </IconWrapper>
                                        <CardTitle>Create File</CardTitle>
                                        <CardText>Select your package and start creating your documents</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('personal'), 'new-will')} variant="outline-dark">Get Started</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-archive"></i>
                                        </IconWrapper>
                                        <CardTitle>All Files</CardTitle>
                                        <CardText>Access all documents for all users.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('all-files'), 'all-files')} variant="outline-dark">Go Now</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-search"></i>
                                        </IconWrapper>
                                        <CardTitle>Search Files</CardTitle>
                                        <CardText>Quickly locate and access all documents for specific users.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('view'), 'view')} variant="outline-dark">Search Now</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi  bi-inboxes"></i>
                                        </IconWrapper>
                                        <CardTitle>Files Review</CardTitle>
                                        <CardText>View the status of all files for all users.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('files-review'), 'files-review')} variant="outline-dark">Go Now</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                        </Row>
                        <Row xs={1} md={2} lg={4} className="g-4 mt-4">
                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi  bi-filetype-pdf"></i>
                                        </IconWrapper>
                                        <CardTitle>Documents Approval</CardTitle>
                                        <CardText>Approve or request changes on your documents.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('documents-approval'), 'documents-approval')} variant="outline-dark">Go Now</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                            <Col>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-box-seam"></i>
                                        </IconWrapper>
                                        <CardTitle>View Packages</CardTitle>
                                        <CardText>Manage the legal document packages.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('packages'), 'packages')} variant="outline-dark">View Packages</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                            <Col className='hidden'>
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-file-earmark-text"></i>
                                        </IconWrapper>
                                        <CardTitle>Continue Will</CardTitle>
                                        <CardText>Resume your will creation process where you left off.</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('personal'), 'continue-will')} variant="outline-dark">Continue</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                            <Col >
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i class="bi bi-graph-up"></i>
                                        </IconWrapper>
                                        <CardTitle>Statistics</CardTitle>
                                        <CardText>View key metrics and analytics in the dashboard</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('statitics'), 'statitics')} variant="outline-dark">See</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                            <Col >
                                <CustomCard>
                                    <CardBody>
                                        <IconWrapper>
                                            <i class="bi bi-bank"></i>
                                        </IconWrapper>
                                        <CardTitle>Lawyers & Lawfirm</CardTitle>
                                        <CardText>Organize schedules and manage lawyers seamlessly</CardText>
                                        <Button onClick={(e) => handleLinkClick(e, route('lawyers-management'), 'lawyers-management')} variant="outline-dark">Go now</Button>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                        </Row>
                        <Row>

                        </Row>
                    </Container>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
