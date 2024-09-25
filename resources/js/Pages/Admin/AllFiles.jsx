import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { Link, Head } from '@inertiajs/react';
import { debounce } from 'lodash';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AllFiles = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [files, setFiles] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isFetchingByDate, setIsFetchingByDate] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchFiles();
    }, [fromDate, toDate]);

    const fetchFiles = async () => {
        try {
            setErrorMessage(''); // Resetear mensaje de error

            // Validación adicional
            if (fromDate && toDate && fromDate > toDate) {
                setErrorMessage("'From Date' no puede ser posterior a 'To Date'.");
                return;
            }

            let response;
            if (fromDate && toDate) {
                setIsFetchingByDate(true);
                // Formatear las fechas para incluir todo el día en tiempo local
                const formattedFromDate = formatDateTime(fromDate, 'start');
                const formattedToDate = formatDateTime(toDate, 'end');
                response = await axios.get('/api/obj-status/date-range', {
                    params: {
                        from_date: formattedFromDate,
                        to_date: formattedToDate,
                    },
                });
            } else {
                setIsFetchingByDate(false);
                response = await axios.get('/api/obj-status/all');
            }

            // Imprimir la estructura completa de la respuesta para depuración
            console.log('Full response:', response.data);

            function transformData(data) {
                if (!Array.isArray(data)) {
                    console.error('Expected an array but got:', data);
                    return [];
                }

                return data.flatMap(item => {
                    // Buscar el objeto documentDOM dentro de la estructura de información
                    const documentDOM = findDocumentDOM(item.information);
                    const packageInfo = item.information?.find(info => info.packageInfo)?.packageInfo;
                    const owner = item.information?.find(info => info.personal)?.personal?.email || 'unknown';
                    const creationTimestamp = item.information?.find(info => info.personal)?.personal?.timestamp;
                    let latestTimestamp = creationTimestamp;

                    if (!packageInfo || !documentDOM) {
                        return {
                            id: item.id || null,
                            user: owner,
                            name: packageInfo?.name || 'unknown',
                            approved: '0/0',
                            status: 'pending',
                            createdAt: 'N/A',
                        };
                    }

                    if (documentDOM) {
                        Object.values(documentDOM).forEach(doc => {
                            Object.values(doc).forEach(version => {
                                Object.values(version).forEach(v => {
                                    if (v.timestamp && new Date(v.timestamp).getTime() > new Date(latestTimestamp).getTime()) {
                                        latestTimestamp = v.timestamp;
                                    }
                                });
                            });
                        });
                    }

                    console.log('Processing documentDOM:', documentDOM);

                    const documents = Object.entries(documentDOM);
                    let hasChangesRequested = false;
                    let allApproved = true;
                    let totalCount = 0;
                    let approvedCount = 0;

                    documents.forEach(([key, versions]) => {
                        // Evitar procesar documentos con nombre que empieza con 'timestamp'
                        if (key.startsWith('timestamp')) {
                            console.log(`Skipping document: ${key}`);
                            return;
                        }

                        console.log(`Processing document: ${key}`);
                        console.log(`Available versions for ${key}:`, Object.keys(versions));

                        const versionKeys = Object.keys(versions).filter(vKey => vKey.startsWith('v'));
                        if (versionKeys.length === 0) {
                            console.log(`No version keys found for document: ${key}`);
                            return;
                        }

                        // Obtener la última versión del documento
                        const lastVersionKey = versionKeys.sort((a, b) => parseInt(b.replace('v', '')) - parseInt(a.replace('v', '')))[0];
                        const lastVersion = versions[lastVersionKey];

                        if (lastVersion) {
                            console.log(`Document: ${key}, Version: ${lastVersionKey}, Status: ${lastVersion.status}`);
                            const status = lastVersion.status;

                            if (status === 'changes requested') {
                                hasChangesRequested = true;
                            } else if (status === 'approved') {
                                approvedCount += 1;
                            } else if (status === 'pending') {
                                allApproved = false;
                            }
                        } else {
                            console.log(`No last version found for document: ${key}`);
                        }

                        totalCount += 1;
                    });

                    let status = 'pending';
                    if (hasChangesRequested) {
                        status = 'changes requested';
                    } else if (approvedCount === totalCount && totalCount > 0) {
                        status = 'completed';
                    } else if (!hasChangesRequested && !allApproved) {
                        status = 'pending';
                    }

                    console.log(`Final status for package ${packageInfo.name}:`, status);

                    const formattedCreationDate = creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A';

                    return {
                        id: item.id || null,
                        user: owner,
                        name: packageInfo.name || 'unknown',
                        approved: `${approvedCount}/${totalCount}`,
                        createdAt: formattedCreationDate,
                        status: status
                    };
                }).filter(Boolean);
            }

            function findDocumentDOM(infoArray) {
                for (const obj of infoArray) {
                    if (obj.documentDOM) {
                        return obj.documentDOM;
                    }
                }
                return null;
            }

            const transformedData = transformData(response.data);
            setFiles(transformedData);
            console.log('Transformed data:', transformedData);

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrorMessage("Error de validación: Asegúrate de que 'From Date' no sea posterior a 'To Date'.");
            } else {
                setErrorMessage("Ocurrió un error al obtener los archivos. Por favor, intenta nuevamente.");
                console.error('Error fetching files:', error);
            }
        }
    };

    // Función para formatear las fechas en tiempo local
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

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Formato 'YYYY-MM-DD HH:MM:SS'
    };

    const filteredPackages = useMemo(() => {
        return files.filter(pkg => {
            const matchesStatus = (statusFilter === 'All' || pkg.status.toLowerCase() === statusFilter.toLowerCase());
            const matchesSearchTerm = (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.user.toLowerCase().includes(searchTerm.toLowerCase()));
            const createdAtDate = new Date(pkg.createdAt);
            const matchesFromDate = fromDate ? createdAtDate >= fromDate : true;
            const matchesToDate = toDate ? createdAtDate <= toDate : true;

            return matchesStatus && matchesSearchTerm && matchesFromDate && matchesToDate;
        });
    }, [files, statusFilter, searchTerm, fromDate, toDate]);

    const debouncedSearch = useMemo(
        () => debounce((value) => setSearchTerm(value), 300),
        []
    );

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const handleStatusFilterChange = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    const columns = [
        {
            name: 'Status',
            selector: row => row.status,
            cell: row => (
                <div className='text-center'>
                    <OverlayTrigger
                        key={row.id}
                        placement='top'
                        overlay={
                            <Tooltip id={`tooltip-${row.id}`}>
                                <strong>{row.status}</strong>
                            </Tooltip>
                        }
                    >
                        {
                            row.status === 'completed'
                                ? <i style={{ color: "#008857" }} className="bi bi-patch-check-fill"></i>
                                : (
                                    row.status === 'changes requested'
                                        ? <i style={{ color: "#E53448" }} className="bi bi-patch-exclamation-fill"></i>
                                        : <i style={{ color: "#FFC339" }} className="bi bi-patch-question-fill"></i>
                                )
                        }
                    </OverlayTrigger>
                </div>
            ),
            center: true,
            width: '80px',
        },
        {
            name: 'User',
            selector: row => row.user,
            sortable: true,
        },
        {
            name: 'Package',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Approved',
            selector: row => row.approved,
            sortable: true,
        },
        {
            name: 'Created At',
            selector: row => row.createdAt,
            sortable: true,
        },
        {
            name: 'Options',
            cell: row => (
                <Link href={route('package-status', { id: row.id })}>
                    <Button className="w-100" variant="outline-info" size="sm">
                        View
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"Files Review"}</h2>}
        >
            <Head title={"Welcome, Admin"} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>
                        <Container style={{ display: "flex", flexDirection: "column", height: "70vh", justifyContent: "space-between" }}>
                            <Row className="mb-3">
                                <Col xs={12} md={9} className="mb-3 mb-md-0">
                                    {errorMessage && (
                                        <Alert variant="danger">
                                            {errorMessage}
                                        </Alert>
                                    )}
                                    <Form.Group as={Row}>
                                        <Col xs={8} md={4}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search"
                                                onChange={handleSearchChange}
                                            />
                                        </Col>
                                        <Col xs={6} md={5}>
                                            <Dropdown>
                                                <Dropdown.Toggle
                                                    variant="outline-dark"
                                                    id="dropdown-basic"
                                                    className="w-100 text-truncate"
                                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <span className="me-1">Filter for All Files:</span>
                                                    <span className="text-truncate">{statusFilter}</span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu className='w-100 text-center'>
                                                    {['All', 'Pending', 'Changes Requested', 'Completed'].map((status) => (
                                                        <Dropdown.Item
                                                            key={status}
                                                            onClick={() => handleStatusFilterChange(status)}
                                                            className="text-truncate"
                                                        >
                                                            {status}
                                                        </Dropdown.Item>
                                                    ))}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Col>
                                    </Form.Group>
                                    <Form.Group as={Row} className="mt-3">
                                        <Col xs={12} md={6}>
                                            <Form.Label>From Date:</Form.Label>
                                            <DatePicker
                                                selected={fromDate}
                                                onChange={date => setFromDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                className="form-control"
                                                isClearable
                                                placeholderText="Selecciona una fecha"
                                                maxDate={toDate || null} // Limita la fecha máxima a `toDate`
                                            />
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Label>To Date:</Form.Label>
                                            <DatePicker
                                                selected={toDate}
                                                onChange={date => setToDate(date)}
                                                dateFormat="yyyy-MM-dd"
                                                className="form-control"
                                                isClearable
                                                placeholderText="Selecciona una fecha"
                                                minDate={fromDate || null} // Limita la fecha mínima a `fromDate`
                                            />
                                        </Col>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                <p className="text-center mb-4">
                                    {isFetchingByDate
                                        ? "Mostrando resultados dentro del rango de fechas seleccionado."
                                        : "Start typing the owner's email or package to filter results in the table below."
                                    }
                                </p>
                                <DataTable
                                    columns={columns}
                                    data={filteredPackages}
                                    pagination
                                    paginationPerPage={10}
                                    paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                    highlightOnHover
                                    responsive
                                    noDataComponent={isFetchingByDate ? "No se encontraron registros en el rango de fechas seleccionado." : "No hay datos para mostrar."}
                                />
                            </div>
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AllFiles;
