// Frontend: AllFiles.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dropdown, Button, Container, Row, Col, Modal, Form, Alert, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
    // Constante para el total de pasos
    const totalSteps = 16;

    // Estados para la tabla y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [files, setFiles] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [isFetchingByDate, setIsFetchingByDate] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estados para el manejo de modales y documentos
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
        localStorage.setItem('currentPointer', obj.length.toString());
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
                setErrorMessage("'From Date' no puede ser posterior a 'To Date'.");
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
                        limit: 256, // Limitar a 256 registros en el rango de fechas
                    },
                });
            } else {
                setIsFetchingByDate(false);
                response = await axios.get('/api/obj-status/all', {
                    params: {
                        limit: 256, // Limitar a los primeros 256 registros
                        order: 'desc', // Orden descendente para obtener los más recientes
                    },
                });
            }

            console.log('Full response:', response.data);

            const transformedData = transformData(response.data);
            setFiles(transformedData);
            setAllDataFetched(response.data);
            console.log('Transformed data:', transformedData);
            setIsLoading(false);

        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrorMessage("Error de validación: Asegúrate de que 'From Date' no sea posterior a 'To Date'.");
            } else {
                setErrorMessage("Ocurrió un error al obtener los archivos. Por favor, intenta nuevamente.");
                console.error('Error fetching files:', error);
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
        if (!Array.isArray(data)) {
            console.error('Expected an array but got:', data);
            return [];
        }

        return data.flatMap(item => {
            const packageInfo = item.information?.find(info => info.packageInfo)?.packageInfo;
            const owner = item.information?.find(info => info.personal)?.personal?.email || 'unknown';
            const creationTimestamp = item.packageInfo?.created_at || item.created_at;
            const lastModificationTimestamp = item.packageInfo?.updated_at || item.updated_at;
            const objectStatus = item.objectStatus || []; // Ahora es un array de objetos

            // Calcular los steps: contar las claves en objectStatus que tienen datos
            const completedSteps = objectStatus.filter(stepObj => {
                const stepKey = Object.keys(stepObj)[0];
                const stepData = stepObj[stepKey].data;

                if (Array.isArray(stepData)) {
                    return stepData.length > 0;
                } else if (typeof stepData === 'object' && stepData !== null) {
                    return Object.keys(stepData).length > 0;
                }
                return false;
            }).length;

            return {
                id: item.id || null,
                email: owner,
                name: packageInfo?.name || 'unknown',
                created: creationTimestamp ? new Date(creationTimestamp).toLocaleDateString() : 'N/A',
                updated: lastModificationTimestamp ? new Date(lastModificationTimestamp).toLocaleDateString() : 'N/A',
                leng: completedSteps,
                totalSteps: totalSteps,
            };
        }).filter(Boolean);
    };

    const findDocumentDOM = (infoArray) => {
        for (const obj of infoArray) {
            if (obj.documentDOM) {
                return obj.documentDOM;
            }
        }
        return null;
    };

    const filteredPackages = useMemo(() => {
        return files.filter(pkg => {
            const matchesEmail = emailFilter ? pkg.email.toLowerCase().includes(emailFilter.toLowerCase()) : true;
            const matchesSearchTerm = searchTerm ? (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.email.toLowerCase().includes(searchTerm.toLowerCase())) : true;
            const createdAtDate = new Date(pkg.created);
            const matchesFromDate = fromDate ? createdAtDate >= fromDate : true;
            const matchesToDate = toDate ? createdAtDate <= toDate : true;

            return matchesEmail && matchesSearchTerm && matchesFromDate && matchesToDate;
        });
    }, [files, searchTerm, emailFilter, fromDate, toDate]);

    const debouncedSearch = useMemo(
        () => debounce((value) => setSearchTerm(value), 300),
        []
    );

    const handleSearchChange = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const handleEmailFilterChange = useCallback((e) => {
        setEmailFilter(e.target.value);
    }, []);

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
            name: 'Step',
            selector: row => row.leng,
            sortable: true,
            center: true,
            cell: row => <span className="text-sm">{row.leng}/{row.totalSteps}</span>,
        },
        {
            name: 'Edit Action',
            cell: row => (
                <>
                    {row.leng === row.totalSteps ? (
                        <Button variant="outline-info" size="sm" onClick={() => saveData(row.id)}>
                            <i className="bi bi-pencil"></i> Continue Editing
                        </Button>
                    ) : (
                        <Button variant="outline-warning" size="sm" onClick={() => handleShow(row.id)}>
                            <i className="bi bi-eye"></i> View Documents
                        </Button>
                    )}
                </>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
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

    // useEffect para cargar los primeros 256 archivos al montar el componente
    useEffect(() => {
        fetchFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        <div className="d-flex flex-column flex-md-row me-4 w-100">
                            <Form.Group className="mb-4 mb-md-0 w-100 me-md-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por usuario o paquete"
                                    onChange={handleSearchChange}
                                    className="focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="Buscar"
                                />
                            </Form.Group>
                            <Form.Group className="mb-4 mb-md-0 w-100 me-md-2">
                                <Form.Control
                                    type="text"
                                    placeholder="Filtrar por email"
                                    onChange={handleEmailFilterChange}
                                    className="focus:ring-blue-500 focus:border-blue-500"
                                    aria-label="Filtrar por Email"
                                />
                            </Form.Group>
                        </div>
                        <div className="d-flex flex-column flex-md-row w-100 mt-4 mt-md-0">
                            <Form.Group className="mb-4 mb-md-0 w-100 me-md-2">
                                <Form.Label className="text-sm font-medium text-gray-700">From Date:</Form.Label>
                                <DatePicker
                                    selected={fromDate}
                                    onChange={date => setFromDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="mt-1 block w-100 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    isClearable
                                    placeholderText="Selecciona una fecha"
                                    maxDate={toDate || null}
                                />
                            </Form.Group>
                            <Form.Group className="mb-4 mb-md-0 w-100 me-md-2">
                                <Form.Label className="text-sm font-medium text-gray-700">To Date:</Form.Label>
                                <DatePicker
                                    selected={toDate}
                                    onChange={date => setToDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="mt-1 block w-100 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    isClearable
                                    placeholderText="Selecciona una fecha"
                                    minDate={fromDate || null}
                                />
                            </Form.Group>
                        </div>
                    </div>
                    {/* El botón de Fetch Files ya no es necesario porque los datos se cargan automáticamente */}
                    <div className="d-flex justify-content-end mb-6">
                        <Button
                            variant="primary"
                            onClick={fetchFiles}
                            disabled={isLoading}
                            className="d-flex align-items-center"
                            aria-label="Fetch Files"
                        >
                            {isLoading && <Spinner animation="border" size="sm" className="me-2" />}
                            <span>{isLoading ? "Fetching..." : "Fetch Files"}</span>
                        </Button>
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
                            fixedHeaderScrollHeight="80vh"
                            noDataComponent={
                                isFetchingByDate
                                    ? "No se encontraron registros en el rango de fechas seleccionado."
                                    : "No hay datos para mostrar."
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

                {/* Modal para seleccionar documento y versión */}
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

                {/* Renderizado del PDF Editor cuando se selecciona un documento y versión */}
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
