import React, { useState, useEffect } from 'react';
import { Card, Button, InputGroup, Form, Alert } from 'react-bootstrap';

const AdditionalFeeCard = ({ newPackageInfo, isAddingFee, onSave }) => {
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [currentAdditionalFee, setCurrentAdditionalFee] = useState(0);
    const [currentFinalTotal, setCurrentFinalTotal] = useState(0);
    const [packageInfo, setPackageInfo] = useState(null);
    const [inputValue, setInputValue] = useState("");

    const initialFee = parseFloat(newPackageInfo?.additionalFee.replace('$', '')) || 0;
    useEffect(() => {
        const newFee = parseFloat(newPackageInfo?.additionalFee.replace('$', '')) || 0;
        setCurrentAdditionalFee(initialFee);
        setIsEditingFee(isAddingFee);
        setPackageInfo(newPackageInfo);
        setInputValue(newFee > 0 ? newFee.toString() : "");
    }, [newPackageInfo, isAddingFee]);

    const packagePrice = parseFloat(packageInfo?.price.replace('$', '')) || 0;

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentFinalTotal(packagePrice + currentAdditionalFee);
        }, 200);
        return () => clearTimeout(timer);
    }, [currentAdditionalFee, packagePrice]);

    const handleFeeChange = (e) => {
        const newFee = e.target.value;
        setInputValue(newFee);

        const parsedFee = parseFloat(newFee);
        if (!isNaN(parsedFee) && parsedFee > currentAdditionalFee) {
            setCurrentAdditionalFee(parsedFee);
        }
    };

    const handleSave = () => {
        if (currentAdditionalFee > parseFloat(newPackageInfo?.additionalFee.replace('$', '')) || 0) {
            onSave(currentAdditionalFee);
            setIsEditingFee(false);
        }
    };

    const toggleEditingFee = () => setIsEditingFee(!isEditingFee);

    return (
        <Card className="text-center p-4 ">
            <Card.Body>
                <Card.Title className="font-weight-bold mb-3">Payment Information</Card.Title>

                <Card.Text className="text-start">
                    <strong>Package Value</strong> <span className="float-end">{packageInfo?.price || "0.00"}</span>
                </Card.Text>

                <Card.Text className="text-start">
                    <strong>Additional Fee</strong>
                    {isEditingFee ? (
                        <>
                            <InputGroup>
                                <Form.Control
                                    type="number"
                                    className='border-4 border-red-500'
                                    value={inputValue}
                                    onChange={handleFeeChange}
                                    placeholder="Enter new fee"
                                    aria-label="Additional fee input"
                                    min="0"
                                />
                            </InputGroup>
                            <Button
                                className="mt-4 w-100 py-2 fw-bold"
                                variant="primary"
                                onClick={handleSave}
                                disabled={parseFloat(inputValue) < initialFee}
                                aria-label="Edit or Save Additional Fee"
                            >
                                {isEditingFee ? "Save Additional Fee" : "Edit Additional Fee"}
                            </Button>
                        </>
                    ) : (
                        <span className=" float-end">
                            ${currentAdditionalFee.toFixed(2)}
                        </span>
                    )}
                </Card.Text>

                <Alert variant="info" className="mt-4 mb-4 rounded shadow-sm">
                    <h4 className="m-0">Total: ${currentFinalTotal.toFixed(2)}</h4>
                </Alert>
            </Card.Body>
        </Card>
    );
};

export default AdditionalFeeCard;
