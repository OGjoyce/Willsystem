import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    Dropdown,
    Button,
    Container,
    Row,
    Col,
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
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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

// Reusable Component for Status Icon with Tooltip
const StatusIcon = ({ status }) => {
    const getStatusDetails = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return { icon: 'bi-patch-check-fill', color: '#008857', label: 'Completed' };
            case 'changes requested':
                return { icon: 'bi-patch-exclamation-fill', color: '#E53448', label: 'Changes Requested' };
            case 'pending':
            default:
                return { icon: 'bi-patch-question-fill', color: '#FFC339', label: 'Pending' };
        }
    };

    const { icon, color, label } = getStatusDetails(status);

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`tooltip-${label}`}>{label}</Tooltip>}
        >
            <i className={`bi ${icon}`} style={{ color }} aria-label={label}></i>
        </OverlayTrigger>
    );
};

// Reusable Component for Action Buttons in DataTable
const ActionButton = ({ row }) => (
    <Link href={route('package-status', { id: row.id })}>
        <Button
            variant="outline-info"
            size="sm"
            className="d-flex align-items-center"
            aria-label={`View details for package ${row.name}`}
        >
            <i className="bi bi-eye me-1"></i> View
        </Button>
    </Link>
);

const FilesReview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [files, setFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Files on Component Mount and when filters change
    useEffect(() => {
        fetchFiles();
    }, [fromDate, toDate]);

    // Fetch Files from API with Date Filters
    const fetchFiles = async () => {
        try {
            setErrorMessage('');
            setIsLoading(true);

            // Validate Date Range
            if (fromDate && toDate && fromDate > toDate) {
                setErrorMessage("'From Date' cannot be later than 'To Date'.");
                setIsLoading(false);
                return;
            }

            let response;
            if (fromDate && toDate) {
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
                response = await axios.get('/api/obj-status/all', {
                    params: {
                        limit: 256,
                        order: 'desc',
                    },
                });
            }

            const transformedData = transformData(response.data);
            setFiles(transformedData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching files:', error);
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

    // Helper Function to Find and Combine all documentDOM from the nested structure
    const findAndCombineDocumentDOMs = (infoArrays) => {
        const documentDOMs = [];

        infoArrays.forEach(infoArray => {
            for (const obj of infoArray) {
                if (obj.documentDOM) {
                    documentDOMs.push(obj.documentDOM);
                }
            }
        });

        return documentDOMs?.length > 0 ? documentDOMs : null;
    };

    // Transform API Data to Table Format
    const transformData = (data) => {
        if (!Array.isArray(data)) {
            console.error('Expected an array but got:', data);
            return [];
        }

        return data.flatMap(item => {
            const documentDOMs = findAndCombineDocumentDOMs(item.information);
            const packageInfo = item.information[0]?.find(info => info.packageInfo)?.packageInfo;
            const owner = item.information[0]?.find(info => info.personal)?.personal?.email || 'unknown';
            const creationTimestamp = item.created_at;
            let latestTimestamp = item.updated_at;

            if (!packageInfo || !documentDOMs) {
                return {
                    id: item.id || null,
                    user: owner,
                    name: packageInfo?.name || 'unknown',
                    approved: '0/0',
                    createdAt: creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A',
                    updatedAt: latestTimestamp,
                    status: 'pending'
                };
            }

            // Process each documentDOM
            let hasChangesRequested = false;
            let allApproved = true;
            let totalCount = 0;
            let approvedCount = 0;


            totalCount = packageInfo?.documents?.length || undefined
            documentDOMs.forEach(documentDOM => {
                const documents = Object.entries(documentDOM);

                documents.forEach(([key, versions]) => {
                    // Skip documents with keys starting with 'timestamp'
                    if (key.startsWith('timestamp')) {
                        return;
                    }

                    const versionKeys = Object.keys(versions).filter(vKey => vKey.startsWith('v'));
                    if (versionKeys?.length === 0) {
                        return;
                    }

                    // Get the latest version
                    const lastVersionKey = versionKeys.sort((a, b) => parseInt(b.replace('v', '')) - parseInt(a.replace('v', '')))[0];
                    const lastVersion = versions[lastVersionKey];

                    if (lastVersion) {
                        const status = lastVersion.status;

                        if (status === 'changes requested') {
                            hasChangesRequested = true;
                        } else if (status === 'approved') {
                            approvedCount += 1;
                        } else if (status === 'pending') {
                            allApproved = false;
                        }
                    }
                });
            });

            let status = 'pending';
            if (hasChangesRequested) {
                status = 'changes requested';
            } else if (approvedCount === totalCount && totalCount > 0) {
                status = 'completed';
            } else if (!hasChangesRequested && !allApproved) {
                status = 'pending';
            }

            const formattedCreationDate = creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A';
            const formattedLatestDate = latestTimestamp ? new Date(latestTimestamp).toLocaleDateString() : 'N/A';

            return {
                id: item.id || null,
                user: owner,
                name: packageInfo.description || 'unknown',
                approved: `${approvedCount}/${totalCount}`,
                createdAt: formattedCreationDate,
                updatedAt: formattedLatestDate,
                status: status
            };
        }).filter(Boolean);
    };


    // Filter Packages based on Search, Status, and Dates
    const filteredPackages = useMemo(() => {
        return files.filter(pkg => {
            const matchesStatus = statusFilter === 'All' || pkg.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesSearch = searchTerm
                ? (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pkg.user.toLowerCase().includes(searchTerm.toLowerCase()))
                : true;

            return matchesStatus && matchesSearch;
        });
    }, [files, statusFilter, searchTerm]);

    // Debounced Search Input
    const debouncedSearch = useMemo(() => debounce((value) => setSearchTerm(value), 300), []);

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const handleStatusFilterChange = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    // Define DataTable Columns
    const columns = [
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => <StatusIcon status={row.status} />,
            width: '100px',
        },
        {
            name: 'Owner',
            selector: row => row.user,
            sortable: true,
            wrap: true,
            cell: row => <span className="text-sm">{row.user}</span>,
        },
        {
            name: 'Package',
            selector: row => row.name,
            sortable: true,
            wrap: true,
            cell: row => <span className="text-sm">{row.name}</span>,
        },
        {
            name: 'Approved',
            selector: row => row.approved,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.approved}</span>,
        },
        {
            name: 'Created At',
            selector: row => row.createdAt,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.createdAt}</span>,
        },
        {
            name: 'Updated At',
            selector: row => row.updatedAt,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.updatedAt}</span>,
        },
        {
            name: 'Options',
            cell: row => <ActionButton row={row} />,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '120px',
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

    // Function to Export Data as CSV
    const exportCSV = () => {
        const headers = columns.map(col => col.name).filter(name => name !== 'Options');
        const rows = filteredPackages.map(pkg => [
            pkg.status,
            pkg.user,
            pkg.name,
            pkg.approved,
            pkg.createdAt,
            pkg.updatedAt,
        ]);

        let csvContent = '';
        csvContent += headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(item => `"${item}"`).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'files_review_data.csv');
    };

    // Function to Export Data as Excel
    const exportExcel = () => {
        const worksheetData = [
            columns.map(col => col.name).filter(name => name !== 'Options'),
            ...filteredPackages.map(pkg => [
                pkg.status,
                pkg.user,
                pkg.name,
                pkg.approved,
                pkg.createdAt,
                pkg.updatedAt,
            ]),
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'FilesReviewData');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'files_review_data.xlsx');
    };

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Files Review</h2>}
        >
            <Head title={"Files Review"} />
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
                        <Col md={6}>
                            {/* Search Filter */}
                            <InputGroup className="mb-4">
                                <InputGroup.Text id="search-icon">
                                    <i className="bi bi-filter"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Filter by user email or package name"
                                    onChange={handleSearchChange}
                                    aria-label="Search Files"
                                    aria-describedby="search-icon"
                                />
                            </InputGroup>
                        </Col>

                        <Col md={6}>
                            <Row>
                                {/* From Date Filter */}
                                <Col sm={6} className="mb-3 mb-sm-0">
                                    <DateFilter
                                        label="From Date"
                                        selectedDate={fromDate}
                                        onChange={date => setFromDate(date)}
                                        maxDate={toDate || null}
                                    />
                                </Col>

                                {/* To Date Filter */}
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

                        {/* Status Filter */}

                    </Row>

                    {/* Action Buttons */}
                    <Row className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                        <Col sm={3} className="mt-3 mt-md-0">
                            <Form.Group>
                                <Form.Label className="text-sm font-medium text-gray-700">Status:</Form.Label>
                                <Dropdown onSelect={(eventKey) => handleStatusFilterChange(eventKey)}>
                                    <Dropdown.Toggle
                                        variant={
                                            statusFilter == "Completed"
                                                ? "outline-success"
                                                : (
                                                    statusFilter === "Pending"
                                                        ? "outline-warning"
                                                        : (
                                                            statusFilter == "Changes Requested"
                                                                ? "outline-danger"
                                                                : "outline-dark"
                                                        )
                                                )
                                        }
                                        id="dropdown-status"
                                        className="w-100 flex justify-between"
                                    >
                                        {statusFilter}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="w-100">
                                        {['All', 'Pending', 'Changes Requested', 'Completed'].map((status) => (
                                            <Dropdown.Item
                                                key={status}
                                                eventKey={status}
                                            >
                                                {status}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                        </Col>
                        <Col className="d-flex justify-content-end gap-2">
                            <Button variant="outline-success" onClick={exportExcel} className="d-flex align-items-center">
                                <i className="bi bi-file-earmark-spreadsheet me-2"></i> Export Excel
                            </Button>
                            <Button variant="outline-primary" onClick={exportCSV} className="d-flex align-items-center">
                                <i className="bi bi-file-earmark-arrow-down me-2"></i> Export CSV
                            </Button>
                            <Button variant="primary" onClick={fetchFiles} disabled={isLoading} className="d-flex align-items-center">
                                {isLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            className="me-2"
                                        />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-search me-2"></i> Search
                                    </>
                                )}
                            </Button>
                        </Col>
                    </Row>


                    {/* Data Table */}
                    <DataTable
                        columns={columns}
                        data={filteredPackages}
                        pagination
                        paginationPerPage={10}
                        paginationRowsPerPageOptions={[10, 25, 50, 100, 256]}
                        highlightOnHover
                        responsive
                        fixedHeader
                        fixedHeaderScrollHeight="500px"
                        noDataComponent={
                            isLoading
                                ? "Loading data..."
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
                        aria-label="Files Review Data Table"
                        className='z-0'
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
            </div>
        </AuthenticatedLayout >
    );
};

export default FilesReview;
