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
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-center">
                    Document Viewer
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 mx-0">
                <div className="pdf-content-wrapper overflow-auto  w-[100%] h-[80vh] mx-auto">

                    <div className='mx-4 mt-4' dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PDFViewer;