import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import OrganDonation from '@/Components/AdditionalComponents/OrganDonation';
import ClauseArea from '@/Components/AdditionalComponents/ClauseArea';
import OtherWishes from '@/Components/AdditionalComponents/ClauseArea';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';  // Bootstrap imports

let additionalInfo = {
    additional: {}
};

export function getAdditionalInformation() {
    additionalInfo.additional.timestamp = Date.now();
    return additionalInfo.additional;
}

function Additional({ datas, errors }) {
    const [dataPointer2, setDataPointer2] = useState(null);
    const [updatePointerSelector, setUpdatePointerSelector] = useState({});
    const [checkedState, setCheckedState] = useState({});
    const [validationErrors, setValidationErrors] = useState(errors);

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        // Load data from localStorage on startup
        const storedFormValues = JSON.parse(localStorage.getItem('formValues')) || {};
        if (storedFormValues.additional) {
            additionalInfo.additional = storedFormValues.additional;
        }
    }, []);

    const updateLocalStorage = () => {
        const formValues = JSON.parse(localStorage.getItem('formValues')) || {};
        formValues.additional = additionalInfo.additional;
        localStorage.setItem('formValues', JSON.stringify(formValues));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState(prevState => {
            const newState = { ...prevState, [name]: checked };
            additionalInfo.additional[name] = checked;
            updateLocalStorage();
            return newState;
        });
    };

    const callFunction = (obj) => {
        if (obj === false) {
            setDataPointer2(null);
        } else {
            setDataPointer2(null);
            setUpdatePointerSelector(obj);
            const newObj = {
                Master: dataPointer2 === 0 ? "standard" : dataPointer2 === 1 ? "custom" : dataPointer2 === 3 ? "otherWishes" : "",
                ...obj
            };

            // Remove the opposite clause if it exists
            if (newObj.Master === "standard" || newObj.Master === "custom") {
                delete additionalInfo.additional.custom;
                delete additionalInfo.additional.standard;
            }

            // Update or add the new information
            delete additionalInfo.additional.temp_custom;
            additionalInfo.additional[newObj.Master] = newObj;
            updateLocalStorage();
        }
    };

    const handleSwitch = (pointer) => {
        setValidationErrors({});
        setDataPointer2(pointer);
    };

    return (
        <>
            {dataPointer2 == null ? (
                <Container>
                    <Row>
                        <Col sm={4}>
                            <i class="bi bi-clipboard" style={{ fontSize: "4rem", position: "relative", left: "30%" }}></i> {/* Bootstrap Icon for Standard Clause */}
                        </Col>
                        <Col sm={4}>
                            <Button variant="outline-dark" type="submit" onClick={() => handleSwitch(0)} style={{ width: "100%", position: "relative", top: "40%" }}>Standard Clause</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <i class="bi bi-clipboard-plus" style={{ fontSize: "4rem", position: "relative", left: "30%" }}></i> {/* Bootstrap Icon for Custom Clause */}
                        </Col>
                        <Col sm={4}>
                            <Button variant="outline-dark" type="submit" onClick={() => handleSwitch(1)} style={{ width: "100%", position: "relative", top: "40%" }}>Custom Clause</Button>
                        </Col>
                    </Row>
                    <Row>
                        {/* Blended Family Checkbox hidden */}
                        {/* Hidden due to potential issues */}
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <i class="bi bi-list-check" style={{ fontSize: "4rem", position: "relative", left: "30%" }}></i> {/* Bootstrap Icon for Other Wishes */}
                        </Col>
                        <Col sm={4}>
                            <Button variant="outline-dark" type="submit" onClick={() => handleSwitch(3)} style={{ width: "100%", position: "relative", top: "40%" }}>Other Wishes</Button>
                        </Col>
                    </Row>
                </Container>
            ) : dataPointer2 == 0 ? (
                <OrganDonation callFunction={callFunction} />
            ) : dataPointer2 == 1 ? (
                <ClauseArea callFunction={callFunction} clause="custom" />
            ) : dataPointer2 == 3 ? (
                <OtherWishes callFunction={callFunction} clause={"other"} />
            ) : null}
            {validationErrors.additional && <p className="mt-12 text-sm text-center text-red-600">{validationErrors.additional}</p>}
        </>
    );
}

export default Additional;
