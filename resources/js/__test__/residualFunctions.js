  if (pointer === 17 || pointer === 18 || pointer === 19) {
            setValidationErrors({})
            // If we're viewing a specific document, go back to document selection

            const newDocumentDOM = { ...getDocumentDOMInfo(), "timestamp": Date.now() };

            var documentDOMData = getDocumentDOMInfo();

            if (pointer === 18) {
                // Check if POA1 exists in the object_status
                const poa1Exists = documentDOMData?.hasOwnProperty('POA1');
                if (!poa1Exists) {
                    setValidationErrors({ documentDOM: 'POA1 must be saved before proceeding.' });
                    console.log(validationErrors);
                    return null;
                }
            }

            if (pointer === 19) {
                // Check if POA1 exists in the object_status
                const poa2Exists = documentDOMData?.hasOwnProperty('POA2');
                if (!poa2Exists) {
                    setValidationErrors({ documentDOM: 'POA2 must be saved before proceeding.' });
                    console.log(validationErrors);
                    return null;
                }
            }
            console.log(documentDOMData);

            var errors = validate.documentDOM(documentDOMData);
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors)
                console.log(validationErrors)
                return null;
            } else {
                // Find the index of the existing documentDOM object
                const documentDOMIndex = object_status.findIndex(obj => obj.hasOwnProperty('documentDOM'));

                if (documentDOMIndex !== -1) {
                    // If documentDOM exists, update it
                    object_status[documentDOMIndex].documentDOM = newDocumentDOM;
                } else {
                    // If documentDOM doesn't exist, add it
                    object_status.push({ documentDOM: newDocumentDOM });
                }

                updateDataObject(object_status, currIdObjDB);
                setSelectedDocument(null);
                setPointer(16);
                return true;
            }
        }

        var stepper = [
        {
            "step": 0,
            "title": "Please insert the personal information"
        },
        {
            "step": 1,
            "title": "Married Status"
        },
        {
            "step": 2,
            "title": "Spouse's Information"
        },
        {
            "step": 3,
            "title": "Children"
        },
        {
            "step": 4,
            "title": "Children Information"
        },
        {
            "step": 5,
            "title": "Add Will Executors"
        },
        {
            "step": 6,
            "title": "Bequest Information"
        },
        {
            "step": 7,
            "title": "Select Residue"
        },
        {
            "step": 8,
            "title": "Wipeout Information"
        },
        {
            "step": 9,
            "title": "Testamentary Trust"
        },
        {
            "step": 10,
            "title": "Guardian For Minors"
        },
        {
            "step": 11,
            "title": "Guardian For Pets"
        },
        {
            "step": 12,
            "title": "Additional Information"
        },
        {
            "step": 13,
            "title": "Power Of Attorney POA"
        },
        {
            "step": 14,
            "title": "Final Details"
        }
        ,
        {
            "step": 15,
            "title": "Review, Edit and Download your Documents"
        }

    ]


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
                  ${isFuture ? 'bg-gray-200 text-gray-400' : 'bg-gray-200 text-gray-400'}
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