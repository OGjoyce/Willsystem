import { Modal, ListGroup, Button } from "react-bootstrap";

import { useEffect } from "react";
import { useState } from "react";

export const ProfileSelector = ({ objectStatus, handleCreateNewProfile, selectProfile }) => {
    const [data, setData] = useState([])
    useEffect(() => {
        setData(objectStatus)
    }, [objectStatus])


    return (

        <Modal Modal
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
                    {data.map((profileArray, idx) => {
                        const profile = profileArray.find(obj => obj.personal?.email);
                        if (profile && profile.personal?.email) {
                            return (
                                <ListGroup.Item
                                    key={idx}
                                    action
                                    onClick={() => selectProfile(objectStatus, profile.personal.email)}
                                    className="text-center"
                                >
                                    <i className="bi bi-person-circle me-2"></i>
                                    <strong>{profile.personal.email}</strong>
                                </ListGroup.Item>
                            );
                        }
                        return null;
                    })}
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
    )
}