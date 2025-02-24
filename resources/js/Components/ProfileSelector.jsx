import { Modal, ListGroup, Button } from "react-bootstrap";
import { useEffect, useState } from "react";

export const ProfileSelector = ({ currentDocument, objectStatus, handleCreateNewProfile, selectProfile }) => {
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
        const filteredProfiles = objectStatus
            .flatMap(profileArray =>
                profileArray.map(profile => {
                    const email = profile.personal?.email;
                    const fullName = profile.personal?.fullName;

                    if (!email || !fullName) return null; // ignora perfiles incompletos

                    const isOwnerOfSameType = objectStatus[0][0]?.packageInfo?.documents.some(doc => {
                        if (currentDocument === "secondaryWill") {
                            return (
                                (doc.owner === email || doc.owner.split("*")[0] === email) &&
                                doc.docType === currentDocument
                            );
                        } else {
                            return doc.owner === email && doc.docType === currentDocument;
                        }
                    });

                    return !isOwnerOfSameType ? { email, fullName } : null;
                })
            )
            .filter(Boolean);

        setProfiles(filteredProfiles);
    }, [currentDocument, objectStatus]);

    return (
        <Modal show={true} onHide={() => { }} backdrop="static" keyboard={false}>
            <Modal.Header>
                <Modal.Title>Select profile</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ListGroup variant="flush" className="w-100">
                    {profiles.map(({ email, fullName }, idx) => (
                        <ListGroup.Item
                            key={idx}
                            action
                            onClick={() => selectProfile(objectStatus, email, currentDocument)}
                            className="text-center"
                        >
                            <i className="bi bi-person-circle me-2"></i>
                            <strong>{fullName} {email.includes('*secondaryWill') ? '(Secondary Will)' : ''}</strong>
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
