import React from 'react';
import Breadcrumb from 'react-bootstrap/Breadcrumb';

const BreadcrumbNavigation = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <Breadcrumb className="flex items-center whitespace-nowrap p-0 m-0 bg-transparent min-w-max">
                {steps.map((step, index) => (
                    <Breadcrumb.Item
                        key={index}
                        active={index === currentStep}
                        onClick={() => onStepClick(index)}
                        linkProps={{
                            className: `
                                px-4 py-2 rounded-md transition-all duration-300 ease-in-out text-sm md:text-base
                                ${index === currentStep
                                    ? 'bg-blue-700 text-white font-bold shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-200 hover:text-blue-700'}
                                ${index < currentStep ? 'text-blue-600' : ''}
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                                cursor-pointer
                            `,
                        }}
                        className="flex items-center mx-2 first:ml-0 last:mr-0"
                    >
                        {step.title}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </div>
    );
};

export default BreadcrumbNavigation;
