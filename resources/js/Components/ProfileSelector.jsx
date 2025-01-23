import { Modal, ListGroup, Button } from "react-bootstrap";
import { useEffect, useState } from "react";

export const ProfileSelector = ({ currentDocument, objectStatus, handleCreateNewProfile, selectProfile }) => {
    const [emails, setEmails] = useState([]);

    useEffect(() => {
        // Filtra los correos electrónicos que no son owners de un documento con el mismo tipo que currentDocument.docType
        const filteredEmails = objectStatus
            .flatMap(profileArray =>
                profileArray.map(profile => {
                    const email = profile.personal?.email;
                    if (!email) return null; // Ignora perfiles sin email

                    // Comprobación de si es propietario de un documento del tipo actual
                    const isOwnerOfSameType = objectStatus[0][0]?.packageInfo?.documents.some(doc => {
                        if (currentDocument == "secondaryWill") {
                            // Asegurarse de que retorne un valor booleano
                            return (doc.owner === email || doc.owner.split("*")[0] === email) && doc.docType === currentDocument;
                        } else {
                            return doc.owner === email && doc.docType === currentDocument;
                        }
                    });

                    return !isOwnerOfSameType ? email : null; // Solo devuelve emails que no coincidan
                })
            )
            .filter(Boolean); // Elimina valores nulos o undefined


        setEmails(filteredEmails);
    }, [currentDocument, objectStatus]);

    return (
        <Modal
            show={true}
            onHide={() => { }}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header>
                <Modal.Title>Select profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ListGroup variant="flush" className="w-100">
                    {emails.map((email, idx) => (
                        <ListGroup.Item
                            key={idx}
                            action
                            onClick={() => selectProfile(objectStatus, email, currentDocument)}
                            className="text-center"
                        >
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>{email.includes('*secondaryWill') ? `${email.split(".com*")[0]} (Secondary Will)` : email}</strong>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <hr className="my-4" />

                <Button
                    variant="outline-primary"
                    size="md"
                    className="w-100"
                    onClick={handleCreateNewProfile}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    <strong>Create new profile</strong>
                </Button>
            </Modal.Body>
        </Modal>
    );
};
