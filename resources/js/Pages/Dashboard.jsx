import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from 'react-bootstrap/DropdownToggle';
import DropdownButton from 'react-bootstrap/DropdownButton';
import DropdownMenu from 'react-bootstrap/DropdownMenu';
import DropdownItem from 'react-bootstrap/DropdownItem';
import Image from 'react-bootstrap/Image';
export default function Dashboard({ auth }) {
    let username = auth.user.name;
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{`Welcome, ${username} `}</h2>}
        >
            <Head title="Dashboard" />


            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg container">
                        <Container>
                            <Row >
                                <Col sm={4}>
                                    <Link
                                        href={route('personal')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i style={{ color: "green" }} className="bi bi-file-plus"></i>Create new will + 2 POA </Button>
                                    </Link>
                                </Col>
                                <Col sm={4}>
                                    <Link
                                        href={route('personal')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i className="bi bi-send-check">Send Will to Client</i> </Button>
                                    </Link>
                                </Col>
                                <Col sm={4}>
                                    <Link
                                        href={route('view')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i style={{ color: "cyan" }} className="bi bi-search">Search Files</i> </Button>
                                    </Link>
                                </Col>
                            </Row>
                            <br></br>
                            <br></br>
                            <Row >
                                <Col sm={4}>
                                    <Link
                                        href={route('personal')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i className="bi bi-bar-chart-fill"> Admin Data Statitics</i> </Button>


                                    </Link>
                                </Col>
                                <Col sm={4}>
                                    <Link
                                        href={route('personal')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i className="bi bi-collection-fill"> Modify Will</i> </Button>


                                    </Link>
                                </Col>
                                <Col sm={4}>
                                    <Link
                                        href={route('personal')}
                                    >
                                        <Button style={{ width: "100%" }} variant="outline-dark"> <i style={{ color: "green" }} className="bi bi-person-plus-fill"> Add Internal User</i> </Button>


                                    </Link>
                                </Col>



                            </Row>
                            <br /><br />
                            <Row>
                                <Col sm={4}>
                                    <Link href={route('profile.info')}>
                                        <Button style={{ width: "100%" }} variant="outline-dark">
                                            <i className="bi bi-person-circle"> Profile Info</i>
                                        </Button>
                                    </Link>
                                </Col>

                            </Row>
                        </Container>









                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
