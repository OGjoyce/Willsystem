import { Link, Head } from '@inertiajs/react';
import { Image, Row, Container, Col, Navbar, Button, Card } from 'react-bootstrap';
import Carousel from 'react-bootstrap/Carousel';
import Nav from 'react-bootstrap/Nav';
import logo from '../../B.png';
import bg1 from '../../bgcar1.png';
import bg2 from '../../bgcar2.png';
import bg3 from '../../bgcar3.png';
import 'bootstrap-icons/font/bootstrap-icons.css';
export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document.getElementById('screenshot-container')?.classList.add('!hidden');
        document.getElementById('docs-card')?.classList.add('!row-span-1');
        document.getElementById('docs-card-content')?.classList.add('!flex-row');
        document.getElementById('background')?.classList.add('!hidden');
    };

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-white">
                <Navbar className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand href="#">
                            <img
                                alt=""
                                src={logo}
                                width="80"
                                height="100"
                                className="d-inline-block align-top"
                            />{' '}

                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                {auth.user ? (
                                    <Nav.Link
                                        href={route('dashboard')}
                                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-black dark:hover:text-black/80 dark:focus-visible:ring-black"
                                    >
                                        Dashboard
                                    </Nav.Link>
                                ) : (
                                    <>
                                        <Nav.Link
                                            href={route('login')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-black dark:hover:text-black/80 dark:focus-visible:ring-black"
                                        >
                                            Log in
                                        </Nav.Link>
                                        <Nav.Link
                                            href={route('register')}
                                            className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-black dark:hover:text-black/80 dark:focus-visible:ring-black"
                                        >
                                            Register
                                        </Nav.Link>
                                    </>
                                )}

                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>


                <Carousel data-bs-theme="dark">
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={bg1}
                            alt="First slide"
                        />
                        <Carousel.Caption>
                            <h5>Your family</h5>
                            <p>They will keep the goal and dreams.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={bg2}
                            alt="Second slide"
                        />
                        <Carousel.Caption>
                            <h5>Your legacy</h5>
                            <p>They will follow your guidelines</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src={bg3}
                            alt="Third slide"
                        />
                        <Carousel.Caption>
                            <h5>Create your Will</h5>
                            <p>
                                Your will is easier with our Will System.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>




                <Container className="text-center my-5">
                    <Row>

                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Register</Card.Title>
                                    <Card.Text>Create your account today</Card.Text>
                                    <Link
                                        href={route('register')}
                                    >

                                        <Button variant="outline-dark"><i className="bi bi-person-checkk">Register</i></Button>
                                    </Link>

                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Create your will</Card.Title>
                                    <Card.Text>Create today your will and save the tomorrow's family dreams</Card.Text>
                                    <Link
                                        href={route('dashboard')}
                                    >
                                        <Button variant="outline-dark"> <i className="bi bi-file-earmark-break">Create</i></Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Business in a Box</Card.Title>
                                    <Card.Text>do you want your own business?</Card.Text>
                                    <Link
                                        href={route('dashboard')}
                                    >
                                        <Button variant="outline-dark"><i className="bi bi-cash-stack"></i>I want my own will business</Button>


                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>


                <footer className="bg-dark text-white text-center py-3">
                    <Container>
                        <p>&copy; 2024 Barrett Tax Law & Barrett Will System. All rights reserved.</p>
                    </Container>
                </footer>

            </div>
        </>
    );
}
