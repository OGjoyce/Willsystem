import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';
import CustomToast from '@/Components/AdditionalComponents/CustomToast';

// **Styled Components for Cards**
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

// **Configuración de permisos por tipo de usuario**
const PERMISSIONS = {
    1: ["Create File", "All Files", "Documents Approval"], // Tipo de usuario 1
    4: ["Create File", "All Files", "Search Files", "Files Review", "View Packages"],
    2: [ // Otros tipos de usuario
        "Create File", "All Files", "Search Files", "Files Review",
        "Documents Approval", "View Packages", "Continue Will",
        "Statistics", "Lawyers Management"
    ],
    3: [ // Otros tipos de usuario
        "Create File", "All Files", "Search Files", "Files Review",
        "Documents Approval", "View Packages", "Continue Will",
        "Statistics", "Lawyers Management", "Users Management"
    ],
};

// **Lista de secciones disponibles**
const SECTIONS = [
    { name: "Create File", icon: "bi-files", text: "Start creating your documents", route: "personal", action: "new-will" },
    { name: "All Files", icon: "bi-archive", text: "Access all documents", route: "all-files", action: "all-files" },
    { name: "Search Files", icon: "bi-search", text: "Find specific documents", route: "view", action: "view" },
    { name: "Files Review", icon: "bi-inboxes", text: "Review document statuses", route: "files-review", action: "files-review" },
    { name: "Documents Approval", icon: "bi-filetype-pdf", text: "Approve or request document changes", route: "documents-approval", action: "documents-approval" },
    { name: "View Packages", icon: "bi-box-seam", text: "Manage document packages", route: "packages", action: "packages" },
    //  { name: "Continue Will", icon: "bi-file-earmark-text", text: "Resume your will creation", route: "personal", action: "continue-will" },
    { name: "Statistics", icon: "bi-graph-up", text: "View key metrics and analytics", route: "statitics", action: "statitics" },
    { name: "Lawyers Management", icon: "bi-bank", text: "Manage lawyers and schedules", route: "lawyers-management", action: "lawyers-management" },
    { name: "Users Management", icon: "bi-person", text: "Manage user accounts and roles", route: "users-management", action: "users-management" },
];

export default function Dashboard({ auth }) {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastTitle, setToastTitle] = useState('Success');
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [actionTriggered, setActionTriggered] = useState(false);

    const username = auth.user.name;
    const userType = auth.user.user_type; // Obtener el tipo de usuario
    const allowedSections = PERMISSIONS[userType] || PERMISSIONS.default; // Definir qué puede ver

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
                            {SECTIONS.filter(section => allowedSections.includes(section.name)).map((section, index) => (
                                <Col key={index}>
                                    <CustomCard>
                                        <CardBody>
                                            <IconWrapper>
                                                <i className={`bi ${section.icon}`}></i>
                                            </IconWrapper>
                                            <CardTitle>{section.name}</CardTitle>
                                            <CardText>{section.text}</CardText>
                                            <Button onClick={(e) => handleLinkClick(e, route(section.route), section.action)} variant="outline-dark">
                                                Go Now
                                            </Button>
                                        </CardBody>
                                    </CustomCard>
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
