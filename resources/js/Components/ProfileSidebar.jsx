import React, { useState } from 'react';
import { Offcanvas, Button, ButtonGroup } from 'react-bootstrap';

function ProfileSidebar({ profiles, currentProfile, onSelectProfile }) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button
                variant="light"
                onClick={handleShow}
                className="fixed left-2 top-1/2 transform -translate-y-1/2 z-50 border border-gray-300 shadow-sm hover:bg-gray-100 px-2 py-1 rounded-full"
                style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <i className="bi bi-chevron-right text-gray-600"></i>
            </Button>

            <Offcanvas show={show} onHide={handleClose} placement="start" className="w-80">
                <Offcanvas.Header closeButton className="border-b border-gray-200 bg-sky-700 text-white">
                    <Offcanvas.Title className="text-lg font-semibold">Select Will Owner</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="bg-gray-50">
                    <ButtonGroup vertical className="w-full space-y-2">
                        {profiles.map((profile, index) => (
                            <Button
                                key={index}
                                variant={`outline-${profile.name}`}
                                onClick={() => {
                                    onSelectProfile(profile);
                                    handleClose();
                                }}
                                className={`d-flex align-items-center justify-content-between ${profile === currentProfile ? `bg-${profile.name} text-white` : ""
                                    }`}
                            >
                                <i className="bi bi-person-circle me-2"></i>
                                <span className="flex-grow text-sm font-medium">{profile.name.charAt(0).toUpperCase() + profile.name.slice(1)}</span>
                                {profile === currentProfile && (
                                    <i className="bi bi-check-circle-fill text-white"></i>
                                )}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default ProfileSidebar;
