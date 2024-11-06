import React, { useState, useEffect } from 'react';
import { Offcanvas, Button, ButtonGroup } from 'react-bootstrap';
import { getLastUnlockedDocument } from '@/utils/documentsUtils';

function ProfileSidebar({ objectStatus, currentProfile, onSelectProfile }) {
    const [show, setShow] = useState(false);
    const [profiles, setProfiles] = useState(null);
    const [documents, setDocuments] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {
        setDocuments(objectStatus[0]?.[0]?.packageInfo?.documents);
        setProfiles(objectStatus.map((data) => data[0].personal?.email));
    }, [objectStatus]);

    return (
        <>
            <Button
                variant="light"
                onClick={handleShow}
                className="fixed left-2 top-1/2 transform -translate-y-1/2 z-50 border border-gray-300 shadow-md hover:bg-gray-100 px-2 py-1 rounded-full transition-all duration-200 ease-in-out"
                style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <i className="bi bi-chevron-right text-gray-600"></i>
            </Button>

            <Offcanvas show={show} onHide={handleClose} placement="start" backdrop="static" className="w-80 h-[40%] m-auto border-r-8">
                <Offcanvas.Header closeButton className="border-b border-gray-200 bg-sky-800 text-white">
                    <Offcanvas.Title className="text-lg font-semibold">Select Profile</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="bg-gray-50 p-4">
                    <ButtonGroup vertical className="w-full space-y-2">
                        {(() => {
                            let poaCount = 0;

                            return documents?.map((docObj, index) => {
                                let documentLabel = '';

                                if (docObj.docType === 'poaProperty') {
                                    poaCount++;
                                    documentLabel = `POA${poaCount} Property`;
                                } else if (docObj.docType === 'poaHealth') {
                                    poaCount++;
                                    documentLabel = `POA${poaCount} Health`;
                                }



                                return (
                                    <>
                                        {docObj.willIdentifier === 'primaryWill_1' && (
                                            <Button
                                                key={index}
                                                variant={docObj.owner === currentProfile ? 'danger' : 'outline-danger'}
                                                className="flex justify-between items-center"
                                                onClick={() => {
                                                    onSelectProfile(docObj.owner)
                                                    handleClose();
                                                }}
                                            >
                                                <span className="flex items-center flex-grow text-sm font-medium">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {docObj.owner !== 'unknown' ? docObj.owner : "Start Primary Will"}
                                                </span>
                                                {docObj.owner === currentProfile && (
                                                    <i className="bi bi-check-circle-fill text-white"></i>
                                                )}
                                            </Button>
                                        )}
                                        {docObj.willIdentifier === 'spousalWill_1' && (
                                            <Button
                                                key={index}
                                                variant={docObj.owner === currentProfile ? 'success' : 'outline-success'}
                                                className="flex justify-between items-center"
                                                onClick={() => {
                                                    onSelectProfile(docObj.owner)
                                                    handleClose();
                                                }}
                                            >
                                                <span className="flex items-center flex-grow text-sm font-medium">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {docObj.owner !== 'unknown' ? docObj.owner : "Start Spousal Will"}
                                                </span>
                                                {docObj.owner === currentProfile && (
                                                    <i className="bi bi-check-circle-fill text-white"></i>
                                                )}
                                            </Button>
                                        )}
                                        {docObj.willIdentifier === 'secondaryWill_1' && (
                                            <Button
                                                key={index}
                                                variant={docObj.owner === currentProfile ? 'primary' : 'outline-primary'}
                                                className="flex justify-between items-center"
                                                onClick={() => {
                                                    onSelectProfile(docObj.owner)
                                                    handleClose();
                                                }}
                                            >
                                                <span className="flex items-center flex-grow text-sm font-medium">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {docObj.owner !== 'unknown' ? docObj.owner : "Start Secondary Will"}
                                                </span>
                                                {docObj.owner === currentProfile && (
                                                    <i className="bi bi-check-circle-fill text-white"></i>
                                                )}
                                            </Button>
                                        )}
                                        {docObj.willIdentifier === 'secondaryWill_2' && (
                                            <Button
                                                key={index}
                                                variant={docObj.owner === currentProfile ? 'warning' : 'outline-warning'}
                                                className="flex justify-between items-center"
                                                onClick={() => {
                                                    onSelectProfile(docObj.owner)
                                                    handleClose();
                                                }}
                                            >
                                                <span className="flex items-center flex-grow text-sm font-medium">
                                                    <i className="bi bi-person-circle me-2"></i>
                                                    {docObj.owner !== 'unknown' ? docObj.owner : "Start Secondary Will"}
                                                </span>
                                                {docObj.owner === currentProfile && (
                                                    <i className="bi bi-check-circle-fill text-white"></i>
                                                )}
                                            </Button>
                                        )}
                                        {docObj?.docType?.includes("poa") &&
                                            docObj.owner !== 'unknown' &&
                                            !documents.some(doc => doc.willIdentifier && doc.owner === docObj.owner) && (
                                                <Button
                                                    key={index}
                                                    variant={docObj.owner === currentProfile ? 'warning' : 'outline-warning'}
                                                    className="flex justify-between items-center"
                                                    onClick={() => {
                                                        onSelectProfile(docObj.owner);
                                                        handleClose();
                                                    }}
                                                >
                                                    <span className="flex items-center flex-grow text-sm font-medium">
                                                        <i className="bi bi-person-circle me-2"></i>
                                                        {docObj.owner}
                                                    </span>
                                                    {docObj.owner === currentProfile && (
                                                        <i className="bi bi-check-circle-fill text-white"></i>
                                                    )}
                                                </Button>
                                            )}

                                    </>

                                );
                            });
                        })()}

                        {documents?.find(document => document.owner == "unknown" && document.associatedWill == "unknown") && <Button
                            variant="outline-dark"
                            size="md"
                            className="w-full flex justify-center items-center space-x-2 py-2 border border-gray-300 rounded-lg text-gray-600 transition-all duration-200 ease-in-out"
                            onClick={() => { handleClose(); }}
                        >
                            <i className="bi bi-plus-circle"></i>
                            <strong>Create new profile</strong>
                        </Button>
                        }
                    </ButtonGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default ProfileSidebar;
