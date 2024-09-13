import React from 'react';

const StepRedirect = ({ missingStep, onGoToStep }) => {
    return (
        <div className="flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                            <i className="bi bi-exclamation-triangle text-2xl"></i>
                        </div>
                        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">Missing Information</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            We need a bit more information to continue, Please complete the previus steps before moving forward.
                        </p>
                    </div>
                    <div className="mt-8">
                        <button
                            onClick={() => onGoToStep(missingStep)}
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out"
                        >
                            <i className="bi bi-arrow-left mr-2"> </i>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepRedirect;