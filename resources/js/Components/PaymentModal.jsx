import React, { useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

const PaymentModal = ({ show, handleClose }) => {
    const paymentOptions = [
        { label: 'Stripe', iconClass: 'bi bi-credit-card' },
        { label: 'Bank Transfer', iconClass: 'bi bi-bank' },
        { label: 'Paypal', iconClass: 'bi bi-paypal' },
        { label: 'Cryptocurrency', iconClass: 'bi bi-currency-bitcoin' },
    ];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setIsDropdownOpen(false);
    };

    const handleConfirm = () => {
        if (selectedOption) {
            console.log('Selected Payment Option:', selectedOption);
            // Add your payment processing logic here
        }
    };

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
                {/* Modal Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Select Payment Method</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Close modal"
                    >
                        <i className="bi bi-x-lg text-2xl"></i>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    <div className="relative">
                        {/* Dropdown Button */}
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center justify-between w-full bg-white border border-gray-300 hover:border-sky-800 px-4 py-3 rounded focus:outline-none focus:shadow-outline"
                        >
                            {selectedOption ? (
                                <div className="flex items-center">
                                    <i
                                        className={`${selectedOption.iconClass} text-2xl text-sky-800 mr-2`}
                                    ></i>
                                    <span className="text-gray-700 text-lg font-medium">
                                        {selectedOption.label}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-gray-500 text-lg">Choose Payment Option</span>
                            )}
                            <i
                                className={`bi ${isDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                                    } text-gray-600 ml-2`}
                            ></i>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <ul className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg">
                                {paymentOptions.map((option, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => handleOptionSelect(option)}
                                            className="flex items-center w-full px-4 py-2 hover:bg-sky-50 focus:outline-none"
                                        >
                                            <i
                                                className={`${option.iconClass} text-2xl text-sky-800 mr-2`}
                                            ></i>
                                            <span className="text-gray-700 text-lg">{option.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end items-center px-6 py-4 border-t">
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedOption}
                        className={`px-6 py-2 rounded-md text-white text-lg font-medium focus:outline-none transition ${selectedOption
                            ? 'bg-sky-800 hover:bg-sky-900 focus:ring-2 focus:ring-sky-500'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
