import React from 'react';
import { Modal } from 'react-bootstrap';
import '@/Components/PDF/Content/content.css';

const PDFViewer = ({ content, show, handleClose }) => {
    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="pdf-viewer-modal"
        >
            <Modal.Header closeButton className="bg-gray-100 border-b-2 border-gray-300">
                <Modal.Title id="contained-modal-title-center" className="text-lg font-semibold text-gray-700">
                    Document Viewer
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 mx-0">
                <div className="overflow-auto w-full h-[80vh] mx-auto bg-white shadow-lg rounded-lg">
                    <div className="p-4" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PDFViewer;