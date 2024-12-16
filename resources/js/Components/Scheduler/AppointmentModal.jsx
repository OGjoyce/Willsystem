import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export function AppointmentModal({ show, handleClose, appointment }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Appointment Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {appointment && (
                    <>
                        <p><strong>Title:</strong> {appointment.title || appointment.Title || 'No Title'}</p>
                        <p><strong>Description:</strong> {appointment.description || appointment.Description || 'No Description'}</p>
                        <p><strong>Date:</strong> {appointment.date}</p>
                        <p><strong>Time:</strong> {appointment.time}</p>
                        <p><strong>Duration:</strong> {appointment.duration} minutes</p>
                        <p><strong>Owner:</strong> {appointment.owner || 'Unknown'}</p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
