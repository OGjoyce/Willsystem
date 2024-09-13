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