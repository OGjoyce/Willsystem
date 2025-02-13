import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Container, Alert, Row, Col, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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

export default function ObjectStatusSelection({ auth, objectStatuses }) {
    const [filteredStatuses, setFilteredStatuses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStatuses = objectStatuses.filter(objStatus => {
            if (objStatus.information?.length > 0 && objStatus.information[0]?.length > 0) {
                return objStatus.information[0][0].packageInfo?.documents?.some(doc => doc.owner === auth.user.email);
            }
            return false;
        });
        setFilteredStatuses(userStatuses);
        setLoading(false);
    }, [auth.user.email, objectStatuses]);

    async function handleObjectStatusSelection(objectStatusId) {
        try {
            const response = await axios.post('/api/generate-token', {
                email: auth.user.email,
                id: objectStatusId
            });
            const token = response.data.token;
            window.location.href = `/documents-approval?token=${token}`;
        } catch (err) {
            alert('Error generating access token');
        }
    }

    const columns = [
        {
            name: 'Status',
            selector: row => row.status,
            sortable: true,
            center: true,
            cell: row => <StatusIcon status={row.status} />, width: '100px',
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
            cell: row => (
                <button className="btn btn-outline-primary btn-sm" onClick={() => handleObjectStatusSelection(row.packageId)}>
                    Access Documents
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        },
    ];

    const data = filteredStatuses.map((objStatus, index) => {
        const packageInfo = objStatus.information[0][0].packageInfo;
        const userDocuments = packageInfo?.documents.filter(doc => doc.owner === auth.user.email) || [];
        const totalDocs = userDocuments.length;
        const approvedDocs = userDocuments.filter(doc => doc.dataStatus === 'approved').length;

        return {
            id: index,
            packageId: packageInfo?.id,
            user: auth.user.email,
            name: packageInfo?.name || 'Unknown',
            approved: `${approvedDocs}/${totalDocs}`,
            createdAt: objStatus.created_at ? new Date(objStatus.created_at).toLocaleDateString() : 'N/A',
            updatedAt: objStatus.updated_at ? new Date(objStatus.updated_at).toLocaleDateString() : 'N/A',
            status: approvedDocs === totalDocs && totalDocs > 0 ? 'completed' : approvedDocs > 0 ? 'changes requested' : 'pending'
        };
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Documents Approval</h2>}
        >
            <Head title="Select Object Status" />
            <div className="py-12 bg-gray-100 min-h-screen">
                <Container className=" bg-white shadow-sm rounded-lg p-6">
                    <Row className="mb-4">
                        <Col>
                            <h1 className="font-semibold text-2xl text-gray-800 leading-tight">Select a file to review</h1>
                            <p className="text-gray-600">Approve or request changes to your documents</p>
                        </Col>
                    </Row>

                    {loading ? (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    ) : filteredStatuses.length === 0 ? (
                        <Alert variant="warning">No files found for your account.</Alert>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            pagination
                            highlightOnHover
                            responsive
                            customStyles={{
                                headCells: {
                                    style: {
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        color: '#1f2937',
                                    },
                                },
                                cells: {
                                    style: {
                                        fontSize: '0.85rem',
                                        color: '#374151',
                                    },
                                },
                            }}
                        />
                    )}
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
}
