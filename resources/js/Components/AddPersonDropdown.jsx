import React, { useEffect, useState } from 'react';
import { Dropdown, Modal, Button } from 'react-bootstrap';
import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import { validate } from './Validations';

function AddPersonDropdown({
    options,
    extraOptions = [],
    label,
    selected,
    onSelect,
    onAddPerson,
    validationErrors,
    setValidationErrors,
    variant = "outline-dark",
}) {
    const [showModal, setShowModal] = useState(false);
    const [availableDocuments, setAvailableDocuments] = useState([])

    useEffect(() => {
        const objectStatus = JSON.parse(localStorage.getItem('fullData'));
        setAvailableDocuments(objectStatus[0]?.[0]?.packageInfo?.documents)
    }, [])

    const handleSelect = (eventKey) => {
        if (eventKey === 'add-person') {
            setShowModal(true);
        } else {
            onSelect(eventKey);
        }
    };

    const handleCloseAddPersonModal = () => {
        setShowModal(false);
        setValidationErrors({});
    };

    const handleSaveAddPersonModal = () => {
        const newPerson = getHumanData();

        const errors = validate.addHumanData(newPerson);

        if (Object.keys(errors).length === 0) {
            onAddPerson(newPerson);
            setValidationErrors({});
            setShowModal(false);
        } else {
            setValidationErrors(errors);
        }
    };

    return (
        <>
            <Dropdown onSelect={handleSelect}>
                <Dropdown.Toggle style={{ width: '100%' }} variant={variant} id="add-person-dropdown">
                    {selected || label}
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-center" style={{ width: '100%' }}>
                    {extraOptions.map((item, index) => (
                        <Dropdown.Item key={`extra-${index}`} eventKey={item}>
                            {item}
                        </Dropdown.Item>
                    ))}
                    {extraOptions.length > 0 && <Dropdown.Divider />}
                    {options.map((name, index) => (
                        <Dropdown.Item key={index} eventKey={name}>
                            {name}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Divider />
                    <Dropdown.Item eventKey="" className="text-primary">
                        Clear
                    </Dropdown.Item>
                    <Dropdown.Item eventKey="add-person" className="text-primary">
                        Add Person
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>

            <Modal show={showModal} onHide={handleCloseAddPersonModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Person</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddHuman human={true} errors={validationErrors} documents={availableDocuments} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" size="sm" onClick={handleCloseAddPersonModal}>
                        Close
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSaveAddPersonModal}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default AddPersonDropdown;
