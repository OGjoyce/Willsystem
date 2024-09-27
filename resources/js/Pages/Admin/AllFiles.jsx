import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dropdown, Button, Container, Row, Col, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PDFEditor from '@/Components/PDF/PDFEditor';
import WillContent from '@/Components/PDF/Content/WillContent';
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';
import { debounce } from 'lodash';

const AllFiles = () => {
    const totalSteps = 16;
    const [searchTerm, setSearchTerm] = useState('');
    const [files, setFiles] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isFetchingByDate, setIsFetchingByDate] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [docSelected, setDocSelected] = useState("Will");
    const [idSelected, setIdSelected] = useState("");
    const [documentVersions, setDocumentVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [finalSelection, setFinalSelection] = useState([]);
    const [allDataFetched, setAllDataFetched] = useState([]);

    const handleClose = () => setShow(false);

    const handleShow = (id) => {
        setIdSelected(id);
        setShow(true);
        searchById(id);
    };

    const saveData = (idItem) => {
        const dataFetchedLarge = allDataFetched.length;
        let obj = [];
        for (let i = 0; i < dataFetchedLarge; i++) {
            if (allDataFetched[i].id === idItem) {
                obj = allDataFetched[i].information;
                break;
            }
        }

        localStorage.setItem('fullData', JSON.stringify(obj));
        localStorage.setItem('currentPointer', 15);
        localStorage.setItem('currIdObjDB', idItem);

        window.location.href = '/personal';
    };

    const searchById = (id) => {
        let selectedInformation = {};
        allDataFetched.forEach(function (arrayItem) {
            if (arrayItem.id === id) {
                selectedInformation = arrayItem.information;
                const documentDOMs = selectedInformation.map(object => object.documentDOM ? object.documentDOM : null).filter(dom => dom !== null);
                if (documentDOMs[0]) {
                    const versionsObject = documentDOMs[0][docSelected];
                    if (versionsObject) {
                        const versionsArray = Object.entries(versionsObject).map(([key, value]) => ({
                            key,
                            value
                        }));
                        setDocumentVersions(versionsArray);
                    } else {
                        setDocumentVersions([]);
                    }
                }
            }
        });
        setFinalSelection(selectedInformation);
    };

    const handleVersionSelect = (docType, version) => {
        setDocSelected(docType);
        setSelectedVersion(version);
        setShow(false);
    };

    const fetchFiles = async () => {
        try {
            setErrorMessage('');
            setIsLoading(true);

            if (fromDate && toDate && fromDate > toDate) {
                setErrorMessage("'From Date' cannot be later than 'To Date'.");
                setIsLoading(false);
                return;
            }

            let response;
            if (fromDate && toDate) {
                setIsFetchingByDate(true);
                const formattedFromDate = formatDateTime(fromDate, 'start');
                const formattedToDate = formatDateTime(toDate, 'end');
                response = await axios.get('/api/obj-status/date-range', {
                    params: {
                        from_date: formattedFromDate,
                        to_date: formattedToDate,
                        limit: 256,
                    },
                });
            } else {
                setIsFetchingByDate(false);
                response = await axios.get('/api/obj-status/all', {
                    params: {
                        limit: 256,
                        order: 'desc',
                    },
                });
            }

            const transformedData = transformData(response.data);
            setFiles(transformedData);
            setAllDataFetched(response.data);
            setIsLoading(false);

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrorMessage("Validation error: Ensure 'From Date' is not later than 'To Date'.");
            } else {
                setErrorMessage("An error occurred while fetching the files. Please try again.");
            }
            setIsLoading(false);
        }
    };

    const formatDateTime = (date, type) => {
        const d = new Date(date);
        if (type === 'start') {
            d.setHours(0, 0, 0, 0);
        } else if (type === 'end') {
            d.setHours(23, 59, 59, 999);
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const transformData = (data) => {
        if (!Array.isArray(data)) return [];

        return data.flatMap(item => {
            const packageInfo = item.information?.find(info => info.packageInfo)?.packageInfo;
            const owner = item.information?.find(info => info.personal)?.personal?.email || 'unknown';
            const creationTimestamp = item.packageInfo?.created_at || item.created_at;
            const lastModificationTimestamp = item.packageInfo?.updated_at || item.updated_at;
            const objectStatus = item.information || [];
            const documentDOM = objectStatus.find(info => info.documentDOM)?.documentDOM || {};

            const allDocumentsHaveV1 = !Object.values(documentDOM).every(doc => doc?.v1 !== undefined && doc.v1 !== null);

            let completedSteps = objectStatus.filter(stepObj => {
                const stepKey = Object.keys(stepObj)[0];
                const stepData = stepObj[stepKey]?.data || stepObj[stepKey];

                if (Array.isArray(stepData)) {
                    return stepData.length > 0;
                } else if (typeof stepData === 'object' && stepData !== null) {
                    return Object.keys(stepData).length > 0;
                }
                return false;
            }).length;

            if (allDocumentsHaveV1 && completedSteps >= 15) {
                completedSteps = totalSteps;
            } else if (completedSteps >= 15) {
                completedSteps = 15;
            }

            const completionPercentage = (completedSteps / totalSteps) * 100;

            return {
                id: item.id || null,
                email: owner,
                name: packageInfo?.name || 'unknown',
                created: creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A',
                updated: lastModificationTimestamp ? new Date(lastModificationTimestamp).toLocaleDateString() : 'N/A',
                leng: completedSteps,
                totalSteps: totalSteps,
                percentageCompleted: Math.round(completionPercentage) + '%',
            };
        }).filter(Boolean);
    };

    const filteredPackages = useMemo(() => {
        return files.filter(pkg => {
            const matchesSearchTerm = searchTerm ? (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.email.toLowerCase().includes(searchTerm.toLowerCase())) : true;
            const createdAtDate = new Date(pkg.created);
            const matchesFromDate = fromDate ? createdAtDate >= fromDate : true;
            const matchesToDate = toDate ? createdAtDate <= toDate : true;

            return matchesSearchTerm && matchesFromDate && matchesToDate;
        });
    }, [files, searchTerm, fromDate, toDate]);

    const debouncedSearch = useMemo(() => debounce((value) => setSearchTerm(value), 300), []);

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <i className="bi bi-patch-check-fill text-success" aria-label="Completed"></i>;
            case 'changes requested':
                return <i className="bi bi-patch-exclamation-fill text-danger" aria-label="Changes Requested"></i>;
            case 'pending':
            default:
                return <i className="bi bi-patch-question-fill text-warning" aria-label="Pending"></i>;
        }
    };

    const columns = [
        {
            name: 'File id',
            selector: row => row.id,
            sortable: true,
            wrap: true,
            cell: row => <span className="text-sm">{row.id}</span>,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            wrap: true,
            cell: row => (
                <Link href={route('profile.info', { email: row.email })}>
                    {row.email}
                </Link>
            ),
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            wrap: true,
            cell: row => <span className="text-sm">{row.name}</span>,
        },
        {
            name: 'Created',
            selector: row => row.created,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.created}</span>,
        },
        {
            name: 'Last Modification',
            selector: row => row.updated,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.updated}</span>,
        },
        {
            name: 'Progress',
            selector: row => row.leng,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.percentageCompleted}</span>,
        },
        {
            name: 'Edit Action',
            cell: row => (
                <>
                    {row.leng === totalSteps ? (
                        <Button variant="outline-warning" size="sm" onClick={() => handleShow(row.id)}>
                            <i className="bi bi-eye"></i> View Documents
                        </Button>
                    ) : (
                        <Button variant="outline-info" size="sm" onClick={() => saveData(row.id)}>
                            <i className="bi bi-pencil"></i> Continue Editing
                        </Button>
                    )}
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }

    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
            },
        },
        headCells: {
            style: {
                fontWeight: '600',
                fontSize: '0.875rem',
                color: '#4B5563',
            },
        },
        cells: {
            style: {
                fontSize: '0.875rem',
                color: '#374151',
            },
        },
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"View Files"}</h2>}
        >
            <Head title={"View Files"} />
            <div className="py-12 bg-gray-100 min-h-screen">
                <Container className="bg-white p-6 rounded-lg shadow-md">
                    {errorMessage && (
                        <Alert variant="danger" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}
                    <div className="d-flex flex-column flex-md-row justify-content-between mb-6">
                        <div className="d-flex flex-column flex-md-row w-100 me-md-2">
                            <Form.Group className="mb-4 w-100">
                                <Form.Control
                                    type="text"
                                    placeholder="Filter by email or Package"
                                    onChange={handleSearchChange}
                                    className="focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="Search"
                                />
                            </Form.Group>
                        </div>
                        <div className="d-flex flex-column flex-md-row w-100">
                            <Form.Group className="mb-4 w-100 me-md-2 z-50">
                                <Form.Label className="text-sm font-medium text-gray-700">From Date:</Form.Label>
                                <DatePicker
                                    selected={fromDate}
                                    onChange={date => setFromDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="block w-100 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    isClearable
                                    placeholderText="Select a date"
                                    maxDate={toDate || null}
                                />
                            </Form.Group>
                            <Form.Group className="mb-4 w-100 me-md-2 z-50">
                                <Form.Label className="text-sm font-medium text-gray-700">To Date:</Form.Label>
                                <DatePicker
                                    selected={toDate}
                                    onChange={date => setToDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="block w-100 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    isClearable
                                    placeholderText="Select a date"
                                    minDate={fromDate || null}
                                />
                            </Form.Group>
                            <Button
                                variant="primary"
                                onClick={fetchFiles}
                                disabled={isLoading}
                                className="align-self-center"
                                aria-label="Search Files"
                            >
                                {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                                <span>{isLoading ? "Searching..." : "Search Files"}</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <DataTable
                            columns={columns}
                            data={filteredPackages}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                            highlightOnHover
                            responsive
                            fixedHeader
                            fixedHeaderScrollHeight="364px"
                            noDataComponent={
                                isFetchingByDate
                                    ? "No records found in the selected date range."
                                    : "No data to display."
                            }
                            customStyles={customStyles}
                            progressPending={isLoading}
                            progressComponent={<div className="d-flex justify-content-center align-items-center py-4"><Spinner animation="border" /></div>}
                        />
                    </div>
                    <div className="d-flex justify-content-end">
                        <Link href={route('dashboard')}>
                            <Button variant="outline-success" size="lg" className="d-flex align-items-center" aria-label="Back to Dashboard">
                                <i className="bi bi-arrow-left me-2"></i> Back
                            </Button>
                        </Link>
                    </div>
                </Container>

                {/* Modal for selecting document and version */}
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select the document and version you want to see</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="mt-3">
                            {['Will', 'POA1', 'POA2', 'POA3'].map((docType) => (
                                <Col key={docType}>
                                    <Dropdown className="w-100">
                                        <Dropdown.Toggle
                                            variant="outline-dark"
                                            id={`dropdown-${docType.toLowerCase()}`}
                                            className="w-100 d-flex align-items-center justify-content-between"
                                        >
                                            <span><i className={`bi bi-${docType === 'Will' ? 'file-text' : docType === 'POA1' ? 'house' : 'hospital'}`}></i> {docType}</span>
                                        </Dropdown.Toggle>

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

                {/* Rendering the PDF Editor when a document and version are selected */}
                {docSelected !== "" && selectedVersion !== "" && (
                    <div className="position-fixed top-0 start-0 w-100 h-100 bg-white">
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
                        <Col sm={4} className="mt-3">
                            <Link href={route('view')}>
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
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default AllFiles;
