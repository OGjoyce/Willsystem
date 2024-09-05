import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Dropdown, Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, Head } from '@inertiajs/react';
import { debounce } from 'lodash';
import axios from 'axios';

const PackagesReview = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await axios.get('/api/obj-status/all');

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

                    if (!packageInfo || !documentDOM) {
                        return {
                            id: item.id || null,
                            user: owner,
                            name: packageInfo?.name || 'unknown',
                            approved: '0/0',
                            status: 'pending'
                        };
                    }

                    console.log('Processing documentDOM:', documentDOM);

                    const documents = Object.entries(documentDOM);
                    let hasChangesRequested = false;
                    let allApproved = true;
                    let totalCount = 0;
                    let approvedCount = 0;

                    documents.forEach(([key, versions]) => {
                        console.log(`Processing document: ${key}`);
                        console.log(`Available versions for ${key}:`, Object.keys(versions));

                        const versionKeys = Object.keys(versions).filter(vKey => vKey.startsWith('v'));
                        if (versionKeys.length === 0) {
                            console.log(`No version keys found for document: ${key}`);
                            return;
                        }

                        // Obtener la última versión del documento
                        const lastVersionKey = versionKeys.sort((a, b) => parseInt(b.replace('v', '')) - parseInt(a.replace('v', '')))[0];
                        const lastVersion = versions[lastVersionKey]?.v1;

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

                    return {
                        id: item.id || null,
                        user: owner,
                        name: packageInfo.name || 'unknown',
                        approved: `${approvedCount}/${totalCount}`, // Mostrar número de aprobados/total
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
            console.error('Error fetching files:', error);
        }
    };

    const filteredPackages = useMemo(() => {
        return files.filter(pkg =>
            (statusFilter === 'All' || pkg.status.toLowerCase() === statusFilter.toLowerCase()) &&
            (pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.user.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [files, statusFilter, searchTerm]);

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

    const renderTableRow = useCallback((pkg) => (
        <tr key={pkg.id}>
            <td className='text-center'>
                <OverlayTrigger
                    key={pkg.id}
                    placement='top'
                    overlay={
                        <Tooltip id={pkg.id}>
                            <strong>{pkg.status}</strong>
                        </Tooltip>
                    }
                >
                    {
                        pkg.status === 'completed'
                            ? <i style={{ color: "#008857" }} className="bi bi-patch-check-fill"></i>
                            : (
                                pkg.status === 'changes requested'
                                    ? <i style={{ color: "#E53448" }} className="bi bi-patch-exclamation-fill"></i>
                                    : <i style={{ color: "#FFC339" }} className="bi bi-patch-question-fill"></i>
                            )
                    }
                </OverlayTrigger>
            </td>
            <td>{pkg.user}</td>
            <td>{pkg.name}</td>
            <td>{pkg.approved}</td>
            <td>27/12/2024</td>
            <td>27/12/2024</td>
            <td>
                <Link href={route('package-status', { id: pkg.id })}>
                    <Button className="w-100" variant="outline-info" size="sm">
                        View
                    </Button>
                </Link>
            </td>
        </tr>
    ), []);

    return (
        <AuthenticatedLayout
            user={"Admin"}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{"Review Packages"}</h2>}
        >
            <Head title={"Welcome, Admin"} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>
                        <Container style={{ display: "flex", flexDirection: "column", height: "70vh", justifyContent: "space-between" }}>
                            <Row className="mb-3">
                                <Col xs={12} md={9} className="mb-3 mb-md-0">
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
                                                    <span className="me-1">Filter:</span>
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
                                </Col>
                            </Row>
                            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                <p className="text-center mb-4">Start typing the owner's email or package to filter results in the table below.</p>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Status</th>
                                            <th>User</th>
                                            <th>Package</th>
                                            <th>Approved</th>
                                            <th>Created At</th>
                                            <th>Updated At</th>
                                            <th>Options</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPackages.map(renderTableRow)}
                                    </tbody>
                                </Table>
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

export default PackagesReview;
