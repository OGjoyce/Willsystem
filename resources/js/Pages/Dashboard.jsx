import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomToast from '@/Components/CustomToast';

// Styled Components
const CustomCard = styled(Card)`
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  height: 100%;
  background: #ffffff;

  &:hover {
    transform: translateY(-10px) rotate(1deg);
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
    opacity: 0.9;
  }
`;

const CardImg = styled(Card.Img)`
  object-fit: fill;
  height: 100%; 
  width: 50%;
  transition: transform 0.4s ease;
  margin: auto;
  margin-top: 24px;
  
  ${CustomCard}:hover & {
    transform: scale(1.3);
  
  }
`;

const CardBody = styled(Card.Body)`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #f1f5f9;
`;

const CardTitle = styled(Card.Title)`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #002C42;
`;

const CardText = styled(Card.Text)`
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const StyledButton = styled(Button)`
  width: 100%;
  border: none;
  background: linear-gradient(45deg, #004060, #006080);
  color: white;
  margin-top: auto;
  padding: 0.75rem;
  font-weight: 600;
  transition: background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background: linear-gradient(45deg, #002C42, #004060);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 44, 66, 0.4);
  }
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #002C42;
  transition: transform 0.3s ease, color 0.3s ease;

  ${CustomCard}:hover & {
    transform: scale(1.1);
    color: #004060;
  }
`;

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
            }, 5000);

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
                    setToastMessage(`Recovering data for ${object_status[0].owner}`);
                    setToastTitle('Notification');
                    setShowToast(true);
                    setRedirectUrl(url);
                    setActionTriggered(true);
                    setTimeout(() => {
                        setShowToast(false);
                    }, 5000);
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
                    <Container>
                        <Row xs={1} md={2} lg={4} className="g-4">
                            <Col>
                                <CustomCard>
                                    <CardImg variant="top" src="/images/continue-will.webp" />
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-file-earmark-text"></i>
                                        </IconWrapper>
                                        <CardTitle>Continue Will</CardTitle>
                                        <CardText>
                                            Resume your will creation process where you left off.
                                        </CardText>
                                        <StyledButton onClick={(e) => handleLinkClick(e, route('personal'), "continue-will")}>
                                            Continue
                                        </StyledButton>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                            <Col>
                                <CustomCard>
                                    <CardImg variant="top" src="/images/new-will.webp" />
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-files"></i>
                                        </IconWrapper>
                                        <CardTitle>Create Will + 2 POA</CardTitle>
                                        <CardText>
                                            Start a new will and create two Power of Attorney documents.
                                        </CardText>
                                        <StyledButton onClick={(e) => handleLinkClick(e, route('personal'), "new-will")}>
                                            Get Started
                                        </StyledButton>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                            <Col>
                                <CustomCard>
                                    <CardImg variant="top" src="/images/search.webp" />
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-search"></i>
                                        </IconWrapper>
                                        <CardTitle>Search Files</CardTitle>
                                        <CardText>
                                            Quickly locate and access all documents for specific users.
                                        </CardText>
                                        <StyledButton onClick={(e) => handleLinkClick(e, route('view'), "view")}>
                                            Search Now
                                        </StyledButton>
                                    </CardBody>
                                </CustomCard>
                            </Col>

                            <Col>
                                <CustomCard>
                                    <CardImg variant="top" src="/images/packages.webp" />
                                    <CardBody>
                                        <IconWrapper>
                                            <i className="bi bi-box-seam"></i>
                                        </IconWrapper>
                                        <CardTitle>Packages</CardTitle>
                                        <CardText>
                                            Explore our comprehensive legal document packages.
                                        </CardText>
                                        <StyledButton onClick={(e) => handleLinkClick(e, route('packages'), "packages")}>
                                            View Packages
                                        </StyledButton>
                                    </CardBody>
                                </CustomCard>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
