import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const slideInAnimation = `
    @keyframes slideIn {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const CustomToast = ({ show, onClose, message, title = 'Success' }) => {
    return (
        <>
            <ToastContainer
                position="top-end"
                className="p-3"
                style={{
                    zIndex: 1000,
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem'
                }}
            >
                <Toast
                    show={show}
                    onClose={onClose}
                    delay={5000}
                    autohide
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        animation: 'slideIn 0.3s ease-out'
                    }}
                >
                    <Toast.Header
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            borderBottom: 'none',
                            padding: '0.75rem 1rem'
                        }}
                    >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <strong className="me-auto">{title}</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body
                        style={{
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            padding: '1rem',
                            fontSize: '0.9rem'
                        }}
                    >
                        {message}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
            <style jsx>{slideInAnimation}</style>
        </>
    );
};

export default CustomToast;