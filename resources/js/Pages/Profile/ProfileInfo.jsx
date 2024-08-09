import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import styled from 'styled-components';
import { searchDataByEmail } from '@/Components/ObjStatusForm';


const StyledCard = styled(Card)`
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled(Card.Header)`
  background-color: #f8f9fa;
  border-bottom: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #007bff;
  }
`;

const CardBody = styled(Card.Body)`
  padding: 1.5rem;
`;

const InfoItem = styled.div`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;
`;

const Value = styled.span`
  color: #212529;
`;

export default function ProfileInfo({ auth, requestedEmail }) {
    const email = requestedEmail;
    console.log(email)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await searchDataByEmail(email);
                setData(result);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        }
        fetchData()
    }, [])

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data) return <div>No data available</div>;


    const { user } = auth;
    const personal = data[0]?.personal || {};
    const married = data[2]?.married || {};
    const kids = data[4]?.kids || [];
    const relatives = data[5]?.relatives || [];
    const executors = data[5]?.executors || [];
    const bequests = data[6]?.bequests || {};
    const residue = data[7]?.residue || {};
    const wipeout = data[8]?.wipeout || {};
    const trusting = data[9]?.trusting || {};
    const guardians = data[10]?.guardians || [];
    const pets = data[11]?.pets || {};
    const additional = data[12]?.additional || [];
    const poa = data[13]?.poa || {};
    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile Information</h2>}
        >
            <Head title="Profile Information" />
            <Container className="py-5">
                <Row>
                    <Col lg={6}>
                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-person-circle"></i> Personal Information</h5>
                            </CardHeader>
                            <CardBody>
                                <InfoItem><Label>Full Name:</Label><Value>{personal.fullName}</Value></InfoItem>
                                <InfoItem><Label>Email:</Label><Value>{personal.email}</Value></InfoItem>
                                <InfoItem><Label>City:</Label><Value>{personal.city}</Value></InfoItem>
                                <InfoItem><Label>Province:</Label><Value>{personal.province}</Value></InfoItem>
                                <InfoItem><Label>Telephone:</Label><Value>{personal.telephone}</Value></InfoItem>
                            </CardBody>
                        </StyledCard>

                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-heart"></i> Spouse Information</h5>
                            </CardHeader>
                            <CardBody>
                                <InfoItem><Label>Name:</Label><Value>{`${married.firstName} ${married.middleName} ${married.lastName}`}</Value></InfoItem>
                                <InfoItem><Label>Email:</Label><Value>{married.email}</Value></InfoItem>
                                <InfoItem><Label>Phone:</Label><Value>{married.phone}</Value></InfoItem>
                                <InfoItem><Label>Location:</Label><Value>{`${married.city}, ${married.province}, ${married.country}`}</Value></InfoItem>
                            </CardBody>
                        </StyledCard>

                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-people"></i> Children</h5>
                            </CardHeader>
                            <CardBody>
                                {kids.map((child) => (
                                    <InfoItem key={child.id}>
                                        <Label>{`${child.firstName} ${child.lastName}:`}</Label>
                                        <Value>{`${child.city}, ${child.province}, ${child.country}`}</Value>
                                    </InfoItem>
                                ))}
                            </CardBody>
                        </StyledCard>
                    </Col>

                    <Col lg={6}>
                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-clipboard-check"></i> Executors</h5>
                            </CardHeader>
                            <CardBody>
                                {executors.map((executor) => (
                                    <InfoItem key={executor.id}>
                                        <Label>{`${executor.firstName} ${executor.lastName}:`}</Label>
                                        <Value>{`${executor.relative} - ${executor.city}, ${executor.province}, ${executor.country}`}</Value>
                                    </InfoItem>
                                ))}
                            </CardBody>
                        </StyledCard>

                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-gift"></i> Bequests</h5>
                            </CardHeader>
                            <CardBody>
                                {Object.values(bequests).filter(bequest => typeof bequest === 'object').map((bequest) => (
                                    <InfoItem key={bequest.id}>
                                        <Label>{bequest.names}:</Label>
                                        <Value>{`${bequest.shares}% of ${bequest.bequest}`}</Value>
                                    </InfoItem>
                                ))}
                            </CardBody>
                        </StyledCard>

                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-piggy-bank"></i> Pets</h5>
                            </CardHeader>
                            <CardBody>
                                {Object.values(pets).filter(pet => typeof pet === 'object').map((pet) => (
                                    <InfoItem key={pet.id}>
                                        <Label>Guardian:</Label>
                                        <Value>{`${pet.guardian} (Backup: ${pet.backup})`}</Value>
                                        <Label>Amount:</Label>
                                        <Value>${pet.amount}</Value>
                                    </InfoItem>
                                ))}
                            </CardBody>
                        </StyledCard>

                        <StyledCard>
                            <CardHeader>
                                <h5 className="mb-0"><i className="bi bi-info-circle"></i> Additional Information</h5>
                            </CardHeader>
                            <CardBody>
                                <InfoItem><Label>Residue:</Label><Value>{residue.selected}</Value></InfoItem>
                                <InfoItem><Label>Wipeout Provision:</Label><Value>{wipeout.wipeout}</Value></InfoItem>
                                {additional[0]?.Slave && (
                                    <>
                                        <InfoItem><Label>Organ Donation:</Label><Value>{additional[0].Slave.organdonation ? 'Yes' : 'No'}</Value></InfoItem>
                                        <InfoItem><Label>Cremation:</Label><Value>{additional[0].Slave.cremation ? 'Yes' : 'No'}</Value></InfoItem>
                                        <InfoItem><Label>Buried:</Label><Value>{additional[0].Slave.buried ? 'Yes' : 'No'}</Value></InfoItem>
                                    </>
                                )}
                            </CardBody>
                        </StyledCard>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout >
    );
}