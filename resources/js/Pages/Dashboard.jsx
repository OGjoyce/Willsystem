import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Styled Components
const CustomCard = styled(Card)`
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const CardImg = styled(Card.Img)`
  object-fit: cover;
  height: 200px;
  border-bottom: 1px solid #e0e0e0;
`;

const CardBody = styled(Card.Body)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1.5rem;
`;

const CardTitle = styled(Card.Title)`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const CardText = styled(Card.Text)`
  font-size: 1rem;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const StyledButton = styled(Button)`
  width: 100%;
  border: none;
  background-color: #007bff;
  color: white;
  margin-top: auto;

  &:hover {
    background-color: #0056b3;
  }
`;

export default function Dashboard({ auth }) {
    let username = auth.user.name;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{`Welcome, ${username}`}</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <Container>
                            <Row xs={1} md={2} lg={3} className="g-4">
                                <Col>
                                    <CustomCard>
                                        <CardImg variant="top" src="/images/will-document.jpg" />
                                        <CardBody>
                                            <CardTitle>Continue Will</CardTitle>
                                            <CardText>
                                                <i style={{ color: "green" }} className="bi bi-file-plus"></i> Continue with your will
                                            </CardText>
                                            <Link href={route('personal')}>
                                                <StyledButton variant="outline-dark">Go</StyledButton>
                                            </Link>
                                        </CardBody>
                                    </CustomCard>
                                </Col>

                                <Col>
                                    <CustomCard>
                                        <CardImg variant="top" src="/images/poa-document.jpeg" />
                                        <CardBody>
                                            <CardTitle>Create Will +2 POA</CardTitle>
                                            <CardText>
                                                <i style={{ color: "green" }} className="bi bi-file-plus"></i> Create a new will and 2 POAs
                                            </CardText>
                                            <Link href={route('personal')}>
                                                <StyledButton variant="outline-dark">Go</StyledButton>
                                            </Link>
                                        </CardBody>
                                    </CustomCard>
                                </Col>

                                <Col>
                                    <CustomCard>
                                        <CardImg variant="top" src="/images/search-files.jpg" />
                                        <CardBody>
                                            <CardTitle>Search Files</CardTitle>
                                            <CardText>
                                                <i style={{ color: "cyan" }} className="bi bi-search"></i> Search your files
                                            </CardText>
                                            <Link href={route('view')}>
                                                <StyledButton variant="outline-dark">Go</StyledButton>
                                            </Link>
                                        </CardBody>
                                    </CustomCard>
                                </Col>

                                <Col>
                                    <CustomCard>
                                        <CardImg variant="top" src="/images/packages.png" />
                                        <CardBody>
                                            <CardTitle>Packages</CardTitle>
                                            <CardText>
                                                <i className="bi bi-box-seam"></i> View available packages
                                            </CardText>
                                            <Link href={route('packages')}>
                                                <StyledButton variant="outline-dark">Go</StyledButton>
                                            </Link>
                                        </CardBody>
                                    </CustomCard>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
