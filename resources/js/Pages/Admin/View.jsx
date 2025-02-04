import React, { useState, useEffect } from 'react';
import { Dropdown, Button, Container, Row, Col, Table, Modal, Form } from 'react-bootstrap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import axios from 'axios';
import PDFEditor from '@/Components/PDF/PDFEditor';
import WillContent from '@/Components/PDF/Content/WillContent';
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';

const View = () => {
    const [objStatuses, setObjStatuses] = useState([]);
    const [packageValue, setPackageValue] = useState('');
    const [results, setResults] = useState([]);
    const [show, setShow] = useState(false);
    const [docSelected, setDocSelected] = useState("Will");
    const [idSelected, setIdSelected] = useState("");
    const [documentVersions, setDocumentVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [ArrObj, setArrObj] = useState([]);
    const [allDataFetched, setAllDataFetched] = useState([]);
    const [finalSelection, setFinalSelection] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [noResults, setNoResults] = useState(false);


    const handleClose = () => setShow(false);

    const handleShow = (id) => {
        setIdSelected(id);
        setShow(true);
    };

    const saveData = (idItem) => {
        const dataFetchedLarge = allDataFetched.length;
        let obj = [];

        for (let i = 0; i < dataFetchedLarge; i++) {
            if (allDataFetched[i].id == idItem) {
                obj = allDataFetched[i].information;
            }
        }

        localStorage.setItem('fullData', JSON.stringify(obj));
        localStorage.setItem('currentPointer', obj[0].length.toString()); // Ajustado para contar el subnivel
        localStorage.setItem('currIdObjDB', idItem);

        window.location.href = '/personal';
    };

    const searchById = (file) => {
        let selectedInformation = {};
        allDataFetched.forEach(function (arrayItem) {
            if (arrayItem.id == idSelected) {
                selectedInformation = arrayItem.information;
                if (file) {
                    const documentDOMs = selectedInformation.map(object => object.documentDOM ? object.documentDOM : null).filter(dom => dom !== null);
                    if (documentDOMs[0] && documentDOMs[0][file]) {
                        const versionsObject = documentDOMs[0][file];
                        const versionsArray = Object.entries(versionsObject).map(([key, value]) => {
                            return { key, value };
                        });

                        setDocumentVersions(versionsArray);

                    } else {
                        setDocumentVersions([]);
                    }
                }
            }
        });
        setFinalSelection(selectedInformation);
        setDocSelected(file);
    };
    const handleVersionSelect = (docType, version) => {
        setDocSelected(docType);
        setSelectedVersion(version);
        setShow(false);
    };

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        setNoResults(false);
        setArrObj([]); // Clear previous results

        try {
            const response = await axios.get('/api/files/search', {
                params: { owner: packageValue }
            });

            if (response.data.length === 0) {
                setNoResults(true);
                setAllDataFetched([]);
            } else {
                setAllDataFetched(response.data);

                const newArrObj = response.data.map(element => {
                    const firstElement = element.information[0][0];
                    return {
                        id: element.id,
                        created: element.created_at,
                        updated: element.updated_at,
                        email: firstElement.owner,
                        name: firstElement.personal.fullName,
                        leng: element.information[0].length
                    };
                });

                setArrObj(newArrObj);
            }
        } catch (err) {
            setError('An error occurred while fetching data.');
            console.error('There was an error fetching the data!', err);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        axios.get('/api/obj-statuses')
            .then(response => {
                setObjStatuses(response.data);
            })
            .catch(error => {
                console.error('There was an error fetching the data!', error);
            });
    }, []);



    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"View Files"}</h2>}
        >
            <Head title={"Welcome, Admin"} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>
                        {docSelected !== "" && selectedVersion !== "" ? (
                            <>
                                <PDFEditor
                                    ContentComponent={
                                        docSelected === 'Will' ? WillContent :
                                            docSelected === 'POA1' ? POA1Content :
                                                POA2Content
                                    }
                                    datas={finalSelection}
                                    backendId={idSelected}
                                    documentType={docSelected}
                                    version={selectedVersion}
                                />
                                <Col sm={4}>
                                    <Link
                                        href={route('view')}
                                    >
                                        <Button
                                            variant="outline-success"
                                            size="lg"
                                            style={{ width: "100%" }}
                                            className={'mb-8'}
                                        >
                                            Back
                                        </Button>
                                    </Link>
                                </Col>
                            </>
                        ) : (
                            <>
                                <Container style={{ display: "flex", flexDirection: "column", height: "70vh", justifyContent: "space-between" }}>
                                    <Form>
                                        <Row>
                                            <Col sm={8}>
                                                <Form.Group className="mb-3" controlId="emailid">
                                                    <Form.Control
                                                        onChange={(e) => setPackageValue(e.target.value)}
                                                        type="email"
                                                        placeholder="type the email or name of the owner or id of file..."
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col sm={4}>
                                                <Button onClick={handleSearch} type='button' className='outline-dark'>Search</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                    <br />
                                    {!loading && !error && !noResults && ArrObj.length === 0 && (
                                        <p className="text-center">Please, search by email or name of the owner of the file or its id</p>
                                    )}
                                    {loading && <p className="text-center">Loading...</p>}
                                    {error && <p className="text-center text-danger">{error}</p>}
                                    {noResults && <p className="text-center">No results found.</p>}
                                    {ArrObj.length > 0 && (
                                        <Table striped bordered hover responsive>
                                            <thead>
                                                <tr>
                                                    <th>File id</th>
                                                    <th>Email</th>
                                                    <th>Name</th>
                                                    <th>Created</th>
                                                    <th>Last Modification</th>
                                                    <th>Step</th>
                                                    <th>Edit Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ArrObj.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item.id}</td>
                                                        <td>
                                                            <Link href={route('profile.info', { email: item.email })}>
                                                                {item.email}
                                                            </Link>
                                                        </td>
                                                        <td>{item.name}</td>
                                                        <td>{item.created}</td>
                                                        <td>{item.updated}</td>
                                                        <td>{item.leng}/16</td>
                                                        <td>
                                                            {item.leng > 15 ? (
                                                                <Button variant="outline-warning" size="sm" onClick={() => saveData(item.id)}>
                                                                    <i className="bi bi-eye"></i>View Documents
                                                                </Button>
                                                            ) : (
                                                                <Button variant="outline-info" size="sm" onClick={() => saveData(item.id)}>
                                                                    <i className="bi bi-eye"></i>Continue Editing
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                    <Row style={{ marginBottom: "24px" }}>
                                        <Col xs={6}>
                                            <Link href={route('dashboard')}>
                                                <Button variant="outline-success" size="lg" className="w-100">
                                                    Back
                                                </Button>
                                            </Link>
                                        </Col>
                                    </Row>
                                </Container>

                                <Modal show={show} onHide={handleClose}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Select the document and version you want to see</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Row className="mt-3">
                                            {['Will', 'POA1', 'POA2', 'POA3'].map((docType) => (
                                                <Col key={docType}>
                                                    <Dropdown className="w-[100%]">
                                                        <href onClick={() => searchById(docType, show)}>
                                                            <Dropdown.Toggle
                                                                onSelect={() => { }}
                                                                variant="outline-dark"
                                                                id={`dropdown-${docType.toLowerCase()}`}
                                                                style={{ width: "100%" }}

                                                            >

                                                                <i className={`bi bi-${docType === 'Will' ? 'file-text' : docType === 'POA1' ? 'house' : 'hospital'}`}></i> {docType}

                                                            </Dropdown.Toggle>
                                                        </href>


                                                        <Dropdown.Menu>
                                                            {documentVersions.length !== 0 ? (
                                                                documentVersions.map((document, index) => (
                                                                    <Dropdown.Item
                                                                        className={'text-center'}
                                                                        style={{ width: "100%" }}
                                                                        key={index}
                                                                        onClick={() => handleVersionSelect(docType, document.key)}
                                                                    >
                                                                        {document.key} {new Date(document.value.timestamp).toLocaleDateString('en-GB')}
                                                                    </Dropdown.Item>
                                                                ))
                                                            ) : (
                                                                <Dropdown.Item disabled>No versions available</Dropdown.Item>
                                                            )}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleClose}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </>
                        )}
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
};

export default View;