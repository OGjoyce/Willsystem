import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export function CreateAppointmentModal({ show, handleClose, newAppointment, setNewAppointment, handleSave }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create a New Appointment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={newAppointment.email}
                            onChange={(e) => setNewAppointment({ ...newAppointment, email: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter a title"
                            value={newAppointment.title}
                            onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Appointment description"
                            value={newAppointment.description}
                            onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="text" value={newAppointment.date} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Control type="text" value={newAppointment.time} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Duration (minutes)</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter duration"
                            value={newAppointment.duration}
                            onChange={(e) => setNewAppointment({ ...newAppointment, duration: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}
