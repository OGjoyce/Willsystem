import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Dropdown,
    Button,
    Container,
    Row,
    Col,
    Modal,
    Form,
    Alert,
    Spinner,
    InputGroup,
} from 'react-bootstrap';
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
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Reusable Component for Date Filter
const DateFilter = ({ label, selectedDate, onChange, maxDate, minDate }) => (
    <Form.Group className="mb-4">
        <Form.Label className="text-sm font-medium text-gray-700">{label}:</Form.Label>
        <DatePicker
            selected={selectedDate}
            onChange={onChange}
            dateFormat="yyyy-MM-dd"
            className="form-control rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            isClearable
            placeholderText={`Select ${label.toLowerCase()}`}
            maxDate={maxDate}
            minDate={minDate}
        />
    </Form.Group>
);

// Reusable Component for Action Buttons in DataTable
const ActionButton = ({ row, handleShow, saveData }) => (

    <>
        {row.percentageCompleted == "100%" ? (
            <Button
                variant="outline-warning"
                size="sm"
                onClick={() => handleShow(row.id)}
                aria-label={`View documents for file ${row.id}`}
                className="d-flex align-items-center"
            >
                <i className="bi bi-eye me-1"></i> View Documents
            </Button>
        ) : (
            <Button
                variant="outline-info"
                size="sm"
                onClick={() => saveData(row.id)}
                aria-label={`Continue editing file ${row.id}`}
                className="d-flex align-items-center"
            >
                <i className="bi bi-pencil me-1"></i> Continue Editing
            </Button>
        )}
    </>
);

const AllFiles = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [files, setFiles] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isFetchingByDate, setIsFetchingByDate] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [docSelected, setDocSelected] = useState("Will");
    const [idSelected, setIdSelected] = useState("");
    const [documentVersions, setDocumentVersions] = useState([]);
    const [selectedVersion, setSelectedVersion] = useState("");
    const [finalSelection, setFinalSelection] = useState([]);
    const [allDataFetched, setAllDataFetched] = useState([]);

    // Handle Modal Visibility
    const handleClose = () => setShowModal(false);
    const handleShow = (id) => {
        setIdSelected(id);
        setShowModal(true);
        searchById(id);
    };

    // Save Data and Redirect
    const saveData = (idItem) => {
        const dataItem = allDataFetched.find(item => item.id === idItem);
        if (dataItem) {
            const obj = dataItem.information;
            localStorage.setItem('fullData', JSON.stringify(obj));
            localStorage.setItem('currentPointer', 15);
            localStorage.setItem('currIdObjDB', idItem);
            window.location.href = '/personal';
        }
    };

    // Search by ID to Fetch Document Versions
    const searchById = (id) => {
        const selectedInformation = allDataFetched.find(item => item.id === id)?.information || [];
        const documentDOMs = selectedInformation
            .map(obj => obj.documentDOM ? obj.documentDOM : null)
            .filter(dom => dom !== null);

        if (documentDOMs.length > 0) {
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
        } else {
            setDocumentVersions([]);
        }

        setFinalSelection(selectedInformation);
    };

    // Handle Version Selection in Modal
    const handleVersionSelect = (docType, version) => {
        setDocSelected(docType);
        setSelectedVersion(version);
        setShowModal(false);
    };

    // Fetch Files from API
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

    // Format DateTime for API
    const formatDateTime = (date, type) => {
        const d = new Date(date);
        type === 'start' ? d.setHours(0, 0, 0, 0) : d.setHours(23, 59, 59, 999);

        return d.toISOString().replace('T', ' ').substring(0, 19);
    };

    // Transform API Data to Table Format
    const transformData = (data) => {
        if (!Array.isArray(data)) return [];

        return data.map(item => {
            const packageInfo = item.information[0]?.find(info => info.packageInfo)?.packageInfo;
            const owner = item.information[0]?.find(info => info.personal)?.personal?.email || 'unknown';
            const creationTimestamp = item.created_at || "NA"
            const lastModificationTimestamp = item.updated_at || "NA";

            const documentDOMArray = item.information
                .map(profile => profile[profile.length - 1])

            const savedDocuments = documentDOMArray.flatMap(documentDOM =>
                Object.values(documentDOM).filter(doc => doc.v1 !== null ? doc : null)
            );


            const totalSavedDocuments = savedDocuments.reduce((count, obj) => {
                return count + Object.keys(obj).length;
            }, 0);

            const availableDocuments = packageInfo.documents.length




            const completionPercentage = totalSavedDocuments > 0
                ? (availableDocuments / totalSavedDocuments) * 100
                : 0; // Retorna 0 si no hay documentos guardados



            return {
                id: item.id || null,
                email: owner,
                name: packageInfo?.description || 'unknown',
                created: creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A',
                updated: lastModificationTimestamp ? new Date(lastModificationTimestamp).toLocaleDateString() : 'N/A',
                sendAt: packageInfo.documents_sent_at == "Not sent yet" ? null : packageInfo.documents_sent_at,
                leng: availableDocuments,
                totalSteps: totalSavedDocuments,
                percentageCompleted: Math.round(completionPercentage) + '%',
            };
        }).filter(Boolean);
    };

    // Filter Packages based on Search and Date
    const filteredPackages = useMemo(() => {
        return files.filter(pkg => {
            const matchesSearchTerm = searchTerm
                ? (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.email.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;
            const createdAtDate = new Date(pkg.created);
            const matchesFromDate = fromDate ? createdAtDate >= fromDate : true;
            const matchesToDate = toDate ? createdAtDate <= toDate : true;

            return matchesSearchTerm && matchesFromDate && matchesToDate;
        });
    }, [files, searchTerm, fromDate, toDate]);

    // Debounced Search Input
    const debouncedSearch = useMemo(() => debounce((value) => setSearchTerm(value), 300), []);

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    // Status Icon Helper
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

    // Define DataTable Columns
    const columns = [
        {
            name: 'File ID',
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
            name: 'Package',
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
            name: 'Last Modified',
            selector: row => row.updated,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.updated}</span>,
        },
        {
            name: 'Sent At',
            selector: row => new Date(row.sendAt),
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.sendAt || "Not sent yet"}</span>,
        },
        {
            name: 'Progress',
            selector: row => row.leng,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.percentageCompleted}</span>,
        },
        {
            name: 'Actions',
            cell: row => (
                <ActionButton
                    row={row}
                    handleShow={handleShow}
                    saveData={saveData}
                />
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '180px',
        }
    ];

    // Custom Styles for DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f1f5f9',
            },
        },
        headCells: {
            style: {
                fontWeight: '600',
                fontSize: '0.9rem',
                color: '#1f2937',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        cells: {
            style: {
                fontSize: '0.85rem',
                color: '#374151',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
    };

    // Fetch Files on Component Mount
    useEffect(() => {
        fetchFiles();
    }, []);

    // Function to Export Data as CSV
    const exportCSV = () => {
        const headers = columns.map(col => col.name).filter(name => name !== 'Actions');
        const rows = filteredPackages.map(pkg => [
            pkg.id,
            pkg.email,
            pkg.name,
            pkg.created,
            pkg.updated,
            pkg.percentageCompleted,
        ]);

        let csvContent = '';
        csvContent += headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(item => `"${item}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'files_data.csv');
    };

    // Function to Export Data as Excel
    const exportExcel = () => {
        const worksheetData = [
            columns.map(col => col.name).filter(name => name !== 'Actions'),
            ...filteredPackages.map(pkg => [
                pkg.id,
                pkg.email,
                pkg.name,
                pkg.created,
                pkg.updated,
                pkg.percentageCompleted,
            ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'FilesData');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'files_data.xlsx');
    };

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">All Files</h2>}
        >
            <Head title={"View Files"} />
            <div className="py-12 bg-gray-100 min-h-screen">
                <Container className="bg-white p-6 rounded-lg shadow-md">
                    {/* Display Error Message */}
                    {errorMessage && (
                        <Alert variant="danger" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}

                    {/* Filters Section */}
                    <Row className="mb-6">
                        {/* Search Filter */}
                        <Col md={6} className="mb-4 mb-md-0">
                            <InputGroup>
                                <InputGroup.Text id="search-icon">
                                    <i className="bi bi-filter"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Filter by email or package name"
                                    onChange={handleSearchChange}
                                    aria-label="Search Files"
                                    aria-describedby="search-icon"
                                />
                            </InputGroup>
                        </Col>

                        {/* Date Filters */}
                        <Col md={6}>
                            <Row>
                                <Col sm={6}>
                                    <DateFilter
                                        label="From Date"
                                        selectedDate={fromDate}
                                        onChange={date => setFromDate(date)}
                                        maxDate={toDate || null}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <DateFilter
                                        label="To Date"
                                        selectedDate={toDate}
                                        onChange={date => setToDate(date)}
                                        minDate={fromDate || null}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* Action Buttons */}
                    <Row className="mb-4">
                        <Col className="d-flex justify-content-end gap-2">
                            <Button
                                variant="outline-success"
                                onClick={exportExcel}
                                aria-label="Export as Excel"
                                className="d-flex align-items-center"
                            >
                                <i className="bi bi-file-earmark-spreadsheet me-2"></i> Export Excel
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={exportCSV}
                                aria-label="Export as CSV"
                                className="d-flex align-items-center"
                            >
                                <i className="bi bi-file-earmark-arrow-down me-2"></i> Export CSV
                            </Button>
                            <Button
                                variant="primary"
                                onClick={fetchFiles}
                                disabled={isLoading}
                                aria-label="Search Files"
                                className="d-flex align-items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-search me-2"></i> Search Files
                                    </>
                                )}
                            </Button>
                        </Col>
                    </Row>

                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        className='z-0'
                        data={filteredPackages}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100, 256]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="500px"
                        noDataComponent={
                            isFetchingByDate
                                ? "No records found in the selected date range."
                                : "No data to display."
                        }
                        customStyles={customStyles}
                        progressPending={isLoading}
                        progressComponent={
                            <div className="d-flex justify-content-center align-items-center py-4">
                                <Spinner animation="border" role="status" aria-label="Loading">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        }
                        aria-label="Files Data Table"
                    />

                    {/* Back to Dashboard Button */}
                    <Row className="mt-6">
                        <Col className="d-flex justify-content-end">
                            <Link href={route('dashboard')}>
                                <Button
                                    variant="outline-success"
                                    size="lg"
                                    className="d-flex align-items-center"
                                    aria-label="Back to Dashboard"
                                >
                                    <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                                </Button>
                            </Link>
                        </Col>
                    </Row>
                </Container>

                {/* Modal for Selecting Document and Version */}
                <Modal show={showModal} onHide={handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Document and Version</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            {['Will', 'POA1', 'POA2', 'POA3'].map((docType) => (
                                <Col xs={6} key={docType}>
                                    <Dropdown className="w-100">
                                        <Dropdown.Toggle
                                            variant="outline-secondary"
                                            id={`dropdown-${docType.toLowerCase()}`}
                                            className="d-flex align-items-center justify-content-between w-100 text-center font-semibold"
                                        >
                                            <span>
                                                <i className={`bi bi-${docType === 'Will' ? 'file-earmark-text' : docType === 'POA1' ? 'house' : 'hospital'}`}></i> {docType}
                                            </span>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu className="w-100">
                                            {documentVersions.length > 0 ? (
                                                documentVersions.map((document, index) => (
                                                    <Dropdown.Item
                                                        key={index}
                                                        onClick={() => handleVersionSelect(docType, document.key)}
                                                        className="d-flex justify-content-between align-items-center"
                                                    >
                                                        <span>{document.key}</span>
                                                        <small className="text-muted">
                                                            {new Date(document.value.timestamp).toLocaleDateString('en-GB')}
                                                        </small>
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
                        <Button variant="secondary" onClick={handleClose} aria-label="Close Modal">
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Rendering the PDF Editor when a document and version are selected */}
                {docSelected && selectedVersion && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-100 z-50 overflow-auto">
                        <div className="relative w-full max-w-5xl bg-white shadow-lg rounded-lg p-6">
                            <PDFEditor
                                ContentComponent={
                                    docSelected === 'Will' ? WillContent :
                                        docSelected === 'POA1' ? POA1Content :
                                            docSelected === 'POA2' ? POA2Content :
                                                null
                                }
                                datas={finalSelection}
                                backendId={idSelected}
                                documentType={docSelected}
                                version={selectedVersion}

                            />
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default AllFiles;
