import React, { useRef, useEffect } from 'react';

const BreadcrumbNavigation = ({ steps, currentStep, onStepClick, stepHasData, isStepClickable }) => {
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
                    const clickable = isStepClickable ? isStepClickable(index) : true;
                    const disabled = !clickable;

                    let buttonClasses = 'flex items-center px-2.5 py-1.5 rounded-full text-sm transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

                    if (isActive) {
                        buttonClasses += ' bg-sky-800 text-white font-semibold shadow ring-2 ring-blue-300';
                    } else if (isPast && !isActive) {
                        buttonClasses += ' bg-green-100 text-green-800 hover:bg-green-200';
                    } else if (isFuture) {
                        buttonClasses += ' bg-gray-200 text-gray-400';
                    } else {
                        buttonClasses += ' bg-gray-200 text-gray-400';
                    }

                    if (!isActive && !isFuture && clickable) {
                        buttonClasses += ' hover:bg-opacity-80';
                    }

                    if (disabled) {
                        buttonClasses += ' cursor-not-allowed text-gray-400';
                    }

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
                                onClick={() => {
                                    if (clickable) {
                                        onStepClick(index);
                                    } else {
                                        alert("Por favor, completa el paso de Información Personal primero.");
                                    }
                                }}
                                className={buttonClasses}
                                disabled={!clickable}
                            >
                                <span className="font-medium"> {index + 1}. {step.title}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default BreadcrumbNavigation;
