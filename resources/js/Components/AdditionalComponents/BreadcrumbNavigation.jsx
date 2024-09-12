import React, { useRef, useEffect } from 'react';

const BreadcrumbNavigation = ({ steps, currentStep, onStepClick, stepHasData }) => {
    const scrollContainerRef = useRef(null);
    const activeStepRef = useRef(null);

    useEffect(() => {
        if (scrollContainerRef.current && activeStepRef.current) {
            const container = scrollContainerRef.current;
            const activeStep = activeStepRef.current;

            const containerWidth = container.offsetWidth;
            const activeStepLeft = activeStep.offsetLeft;
            const activeStepWidth = activeStep.offsetWidth;

            const scrollPosition = activeStepLeft - containerWidth / 2 + activeStepWidth / 2;

            container.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [currentStep]);

    return (
        <nav className="w-full p-3 overflow-x-auto" ref={scrollContainerRef}>
            <ol className="flex items-center space-x-2 min-w-max m-0">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isPast = stepHasData(step.step);
                    const isFuture = index > currentStep && !stepHasData(step.step);

                    return (
                        <li key={index} className="flex items-center" ref={isActive ? activeStepRef : null}>
                            {index > 0 && (
                                <div className="flex-shrink-0 w-4 h-4 text-gray-300 mx-1">
                                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                            <button
                                onClick={() => onStepClick(index)}
                                className={`
                  flex items-center px-2.5 py-1.5 rounded-full text-sm transition-all duration-300 ease-in-out
                  ${isActive ? 'bg-sky-800 text-white font-semibold shadow ring-2 ring-blue-300' : ''}
                  ${isPast && !isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                  ${isFuture ? 'bg-gray-200 text-gray-400' : ''}
                  ${!isActive && !isFuture ? 'hover:bg-opacity-80' : ''}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                `}
                            >
                                <span className="font-medium">{step.title}</span>
                                {isPast && !isActive && (
                                    <svg className="w-4 h-4 ml-1.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNavigation;