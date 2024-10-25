import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormCity from '@/Components/FormCity';
import Married from '@/Components/Married';
import AddHuman from '@/Components/AddHuman';
import HumanTable from '@/Components/HumanTable';
import Bequest from '@/Components/Bequest';
import Residue from '@/Components/Residue';
import Wipeout from '@/Components/Wipeout';
import AddRelative from '@/Components/AddRelative';
import Trusting from '@/Components/Trusting';
import GuardianForMinors from '@/Components/GuardianForMinors';
import Pets from '@/Components/Pets';
import Additional from '@/Components/Additional';
import PoaProperty from '@/Components/PoaProperty';
import PoaHealth from '@/Components/PoaHealth';
import FinalDetails from '@/Components/FinalDetails';
import DocumentSelector from '@/Components/PDF/DocumentSelector';
import SelectPackageModal from '../Admin/SelectPackageModal';
import BreadcrumbNavigation from '@/Components/AdditionalComponents/BreadcrumbNavigation';
import { handleProfileData } from '@/utils/profileUtils';
import { getObjectStatus, initializeObjectStructure, initializeSpousalWill } from '@/utils/objectStatusUtils';
import { packageDocuments, initializePackageDocuments } from '@/utils/packageUtils'
import { getVisibleSteps } from '@/utils/stepUtils';
import { assignDocuments } from '@/utils/documentsUtils';


import {
    getFormData,
    getMarriedData,
    getRelatives,
    getExecutors,
    getBequestArrObj,
    getHumanData,
    getWipeoutData,
    getTableData,
    getChildRelatives,
    getOptObject,
    getGuardiansForMinors,
    getPetInfo,
    getAdditionalInformation,
    getPoaProperty,
    getPoaHealth,
    getFinalDetails,
    getDocumentDOMInfo,
} from '@/utils/formHandlers';

import { storeDataObject, updateDataObject } from '@/Components/ObjStatusForm';
import { validate } from '@/Components/Validations';

export default function Personal({ auth }) {
    // Component state
    const [objectStatus, setObjectStatus] = useState([]);
    const [currIdObjDB, setCurrIdObjDB] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null)
    const [currentDocument, setCurrentDocument] = useState();
    const [showSelectPackageModal, setShowSelectPackageModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [availableDocuments, setAvailableDocuments] = useState([]);
    const [visibleSteps, setVisibleSteps] = useState([]);
    const [pointer, setPointer] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});


    //Show the select Package modal when starting a new file
    useEffect(() => {
        if (pointer === 0 && !currIdObjDB) {
            setShowSelectPackageModal(true)
        }
    }, [pointer, currIdObjDB])


    useEffect(() => {
        setVisibleSteps(getVisibleSteps(getObjectStatus(objectStatus, currentProfile), currentDocument))
    }, [objectStatus, currentProfile, currentDocument])


    useEffect(() => {
        const currentData = getObjectStatus(objectStatus, currentProfile)
        if (currentDocument === 'poaHealth') {
            if (currentData.some((obj) => Array.isArray(obj.poaHealth))) {
                setPointer(13)
            }
        }
        if (currentDocument === 'poaProperty') {
            if (currentData.some((obj) => Array.isArray(obj.poaProperty))) {
                setPointer(12)
            }
        }

    }, [currentDocument, currentProfile])

    const username = auth.user.name;

    // Load saved data from localStorage on component mount
    useEffect(() => {
        if (currIdObjDB === null) {
            const savedData = localStorage.getItem('fullData');
            const savedPointer = localStorage.getItem('currentPointer');
            const savedCurrIdObjDB = localStorage.getItem('currIdObjDB');

            if (savedData && savedPointer) {
                const parsedData = JSON.parse(savedData);
                setObjectStatus(parsedData);
                setPointer(16);

                // Obtener el currentProfile desde el primer elemento de objectStatus (que tiene los datos de personal)
                const profileData = parsedData[0]?.[0]?.personal?.email || null;
                setCurrentProfile(profileData);

                // Establecer availableDocuments basado en los documentos del paquete
                const packageInfo = parsedData[0]?.[0]?.packageInfo;
                const documents = packageInfo?.documents ? packageInfo.documents.map(doc => doc.docType) : [];
                setAvailableDocuments(documents);

                // Establecer currentDocument con el primer documento disponible, si existe
                setCurrentDocument(documents.length > 0 ? documents[0] : null);

                // Si hay un ID almacenado, restaurarlo
                if (savedCurrIdObjDB) {
                    setCurrIdObjDB(savedCurrIdObjDB);
                }

                // Si hay datos almacenados, actualizarlos en la base de datos
                if (savedCurrIdObjDB) {
                    updateDataObject(parsedData, savedCurrIdObjDB);
                }
            }
        }
    }, [currIdObjDB]);

    //Returns user to the first pointer that is missing data when going to step 0
    useEffect(() => {
        if (pointer == 0 && objectStatus.length > 0) {
            backStep()
        }
    }, [pointer, currentProfile])


    // Clear localstorage when changing profile or document
    useEffect(() => {
        localStorage.removeItem('formValues')
        localStorage.removeItem('poaPropertyValues')
        localStorage.removeItem('poaHealthValues')
        localStorage.removeItem('currentPointer')
    }, [currentProfile, currentDocument])


    //Manage document ownership assignment whenever `currentProfile` or `currentDocument` changes
    useEffect(() => {
        // Ensure both currentProfile and currentDocument are defined before attempting assignment
        if (!currentProfile || !currentDocument) return;

        // Attempt to assign the document and retrieve the updated state
        const updatedObjectStatus = assignDocuments(objectStatus, currentProfile, currentDocument);

        // If the assignment was successful, update the state and storage
        if (updatedObjectStatus) {
            // Update the global objectStatus state
            setObjectStatus(updatedObjectStatus);

            // Save to localStorage and update the database if a record ID is available
            localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));
            if (currIdObjDB) {
                updateDataObject(updatedObjectStatus, currIdObjDB);
            }
        }
    }, [currentProfile, currentDocument]);


    //Initialize the needed object structure every time a new profile is created
    useEffect(() => {
        if (pointer == 1 && !getObjectStatus(objectStatus, currentProfile).some(obj => obj.hasOwnProperty('marriedq'))) {
            const updatedObjectStatus = initializeObjectStructure(objectStatus, currentProfile)
            setObjectStatus(updatedObjectStatus);
            localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));
        }
    }, [objectStatus, currentProfile, currentDocument, pointer]);


    //Initialize the needed structure for spousalWill, taking data from primaryWill
    useEffect(() => {
        if (objectStatus.length === 1 && currentDocument === 'spousalWill') {
            //Gets the kids data in primaryWill
            const kids = objectStatus[0][4].kids

            //Initialized structured and data for spousalWill
            const spousalWillData = initializeSpousalWill(objectStatus)

            //sets the spouse as current profile to continue submiting data in next steps
            setCurrentProfile(spousalWillData[0].personal.email)

            //Add the spousalWill data next to the primaryWill Data
            const newObjectStatus = [objectStatus[0], spousalWillData]

            // submit dummy data to ensure database update
            const propertiesAndData = [
                {
                    name: 'kidsq',
                    data: [],
                },
            ];

            //Update the objectStatus after updating the database
            const updatedObjectStatus = handleProfileData(spousalWillData[0].personal.email, propertiesAndData, newObjectStatus);

            setObjectStatus(updatedObjectStatus)
            localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));

            //set the pointer to continue the next steps
            setPointer(3)

            //Add the kids from primaryWill in the spousalWill "kids" step, data will be shown in the view, user can add or eliminate kids before submit to database
            //setTimeout is needed as all data from localstorage is deleted when changing profiles
            setTimeout(() => {
                localStorage.setItem('formValues', JSON.stringify({ kids: kids }));
            }, 1000);
        }
    }, [currentDocument]);


    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setShowSelectPackageModal(false);
        setAvailableDocuments(packageDocuments[pkg.description] || []);
        setCurrentDocument((packageDocuments[pkg.description] && packageDocuments[pkg.description][0]) || null);
    };



    // Function to handle advancing to the next step
    const pushInfo = async (step) => {
        let propertiesAndData = [];

        const checkValidation = (validation) => {
            setValidationErrors({});

            const errors = validation;
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                console.log(errors);
                return false;
            }

            return true;
        };

        let updatedObjectStatus = objectStatus;

        switch (step) {
            case 0:
                const personalData = getFormData();
                if (checkValidation(validate.formData(personalData))) {
                    const initializedDocuments = initializePackageDocuments(availableDocuments, selectedPackage?.description);
                    const dataObj = {
                        personal: {
                            ...personalData,
                            timestamp: Date.now(),
                        },
                        owner: personalData.email,
                        packageInfo: {
                            ...selectedPackage,
                            documents: initializedDocuments,
                        },
                    };

                    propertiesAndData = [
                        { name: 'personal', data: dataObj.personal },
                        { name: 'owner', data: dataObj.owner },
                        {
                            name: 'packageInfo', data: currIdObjDB === null ? dataObj.packageInfo : { 'undefined': "not an owner of any package" }
                        },
                    ];
                    setCurrentProfile(personalData.email)
                    updatedObjectStatus = handleProfileData(personalData.email, propertiesAndData, objectStatus);
                    setObjectStatus(updatedObjectStatus);

                    if (currIdObjDB === null) {
                        const dataFirstStore = await storeDataObject(dataObj);
                        setCurrIdObjDB(dataFirstStore.id);

                        console.log(packageDocuments[selectedPackage?.description][0])
                        localStorage.setItem('currIdObjDB', dataFirstStore.id);
                    }
                } else {
                    return null;
                }



                break;

            case 1:
                propertiesAndData = [
                    {
                        name: 'marriedq',
                        data: { selection: getMarriedData(), timestamp: Date.now() },
                    },
                ];
                updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);
                setObjectStatus(updatedObjectStatus);

                break;

            case 2:
                const humanData = getHumanData();

                if (checkValidation(validate.addHumanData(humanData))) {
                    propertiesAndData = [
                        { name: 'married', data: { ...humanData, timestamp: Date.now() } },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }

                break;

            case 3:
                propertiesAndData = [
                    {
                        name: 'kidsq',
                        data: { selection: getMarriedData(), timestamp: Date.now() },
                    },
                ];
                updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);
                setObjectStatus(updatedObjectStatus);
                break;

            case 4:
                const kidsData = getChildRelatives();

                if (checkValidation(validate.kids(kidsData))) {
                    propertiesAndData = [
                        { name: 'kids', data: [...kidsData] },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 5:
                const executorsData = [...getExecutors()];
                const relativesData = [...getRelatives()];

                if (checkValidation(validate.executors(executorsData))) {
                    propertiesAndData = [
                        { name: 'relatives', data: relativesData },
                        { name: 'executors', data: executorsData },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 6:
                const bequestData = getBequestArrObj();

                if (checkValidation(validate.bequest(bequestData))) {
                    propertiesAndData = [
                        {
                            name: 'bequests',
                            data: { ...bequestData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 7:
                const residueData = getOptObject();

                if (checkValidation(validate.residue(residueData))) {
                    propertiesAndData = [
                        { name: 'residue', data: { ...residueData, timestamp: Date.now() } },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 8:
                const wipeoutData = getWipeoutData();

                if (checkValidation(validate.wipeout(wipeoutData))) {
                    propertiesAndData = [
                        {
                            name: 'wipeout',
                            data: { ...wipeoutData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 9:
                const trustingData = getTableData();

                if (checkValidation(validate.trusting(trustingData))) {
                    propertiesAndData = [
                        {
                            name: 'trusting',
                            data: { ...trustingData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 10:
                const guardiansData = getGuardiansForMinors();

                if (checkValidation(validate.guardians(guardiansData))) {
                    propertiesAndData = [
                        {
                            name: 'guardians',
                            data: { ...guardiansData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 11:
                const petsData = getPetInfo();

                if (checkValidation(validate.pets(petsData))) {
                    propertiesAndData = [
                        { name: 'pets', data: { ...petsData, timestamp: Date.now() } },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;


            case 12:
                const poaPropertyData = getPoaProperty();


                if (checkValidation(validate.poa(poaPropertyData))) {
                    propertiesAndData = [
                        { name: 'poaProperty', data: { ...poaPropertyData, timestamp: Date.now() } },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            case 13:
                const poaHealthData = getPoaHealth();

                if (checkValidation(validate.poa(poaHealthData))) {
                    propertiesAndData = [
                        { name: 'poaHealth', data: { ...poaHealthData, timestamp: Date.now() } },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;
            case 14:
                const additionalData = getAdditionalInformation();

                if (checkValidation(validate.additional(additionalData))) {
                    propertiesAndData = [
                        {
                            name: 'additional',
                            data: { ...additionalData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;


            case 15:
                propertiesAndData = [
                    {
                        name: 'finalDetails',
                        data: { ...getFinalDetails(), timestamp: Date.now() },
                    },
                ];
                updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);
                setObjectStatus(updatedObjectStatus);
                break;

            case 16:
                const documentDOMData = getDocumentDOMInfo();

                if (checkValidation(validate.documentDOM(documentDOMData))) {
                    propertiesAndData = [
                        {
                            name: 'documentDOM',
                            data: { ...documentDOMData, timestamp: Date.now() },
                        },
                    ];
                    updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatus);;
                    setObjectStatus(updatedObjectStatus);
                } else {
                    return null;
                }
                break;

            default:
                break;
        }

        // Update local storage and database
        if (step !== 0 && currIdObjDB) {
            updateDataObject(updatedObjectStatus, currIdObjDB);
        }
        localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));
        localStorage.setItem('currentPointer', step.toString());

        console.log(updatedObjectStatus);
        return updatedObjectStatus;
    };

    // Modified backStep function to navigate to the first incomplete step within visibleSteps
    const backStep = () => {
        // Find the first incomplete step within visibleSteps
        const firstIncompleteStep = findFirstIncompleteStep();

        if (firstIncompleteStep !== null) {
            setPointer(firstIncompleteStep);
            localStorage.setItem('currentPointer', firstIncompleteStep.toString());
        } else {
            // If all steps are complete, navigate to the previous step
            const currentIndex = visibleSteps !== null ? visibleSteps.findIndex(step => step.step === pointer) : 0
            if (currentIndex > 0) {
                const previousStep = visibleSteps[currentIndex - 1].step;
                setPointer(previousStep);
                localStorage.setItem('currentPointer', previousStep.toString());
            } else {
                // If already at the first step, do nothing or handle accordingly
                console.log('Already at the first step.');
            }
        }

        return true;
    };

    // Function to handle exiting the form
    const handleExit = () => {
        // Clear localStorage
        localStorage.removeItem('currIdObjDB');
        localStorage.removeItem('currentPointer');
        localStorage.removeItem('fullData');
        localStorage.removeItem('formValues');
        // Reset state
        setObjectStatus([]);
        setPointer(0);
        router.get(route('dashboard'));
    };

    // Modified nextStep function to ensure consistent navigation
    const nextStep = async (nextStepValue) => {
        const objectStatusResult = await pushInfo(pointer);
        if (!objectStatusResult) {
            return false;
        }

        // Use the updated objectStatusResult
        const newVisibleSteps = getVisibleSteps(getObjectStatus(objectStatusResult, currentProfile), currentDocument);
        const currentIndex = newVisibleSteps.findIndex((step) => step.step === pointer);
        let nextVisibleStep = newVisibleSteps[currentIndex + 1];

        const noSpouse = getObjectStatus(objectStatusResult, currentProfile).some(
            (obj) => obj.marriedq && (obj.marriedq.selection === 'false' || obj.marriedq.selection === '')
        );

        const noKids = getObjectStatus(objectStatusResult, currentProfile).some(
            (obj) => obj.kidsq && (obj.kidsq.selection === 'false' || obj.kidsq.selection === '')
        );

        if (pointer === 1 && noSpouse) {
            const propertiesAndData = [
                { name: 'married', data: { timestamp: Date.now() } },
            ];
            const updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatusResult);
            setObjectStatus(updatedObjectStatus);
            // Recalculate visible steps
            const updatedVisibleSteps = getVisibleSteps(updatedObjectStatus, currentDocument);
            nextVisibleStep = updatedVisibleSteps.find((step) => step.step > pointer);
        }

        if (pointer === 3 && noKids) {
            const propertiesAndData = [{ name: 'kids', data: [] }];
            const updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatusResult);
            setObjectStatus(updatedObjectStatus);
            // Recalculate visible steps
            const updatedVisibleSteps = getVisibleSteps(updatedObjectStatus, currentDocument);
            nextVisibleStep = updatedVisibleSteps.find((step) => step.step > pointer);
        }

        if (nextVisibleStep) {
            setPointer(nextVisibleStep.step);
            localStorage.setItem('currentPointer', nextVisibleStep.step.toString());
            localStorage.setItem('fullData', JSON.stringify(objectStatusResult));
        } else {
            console.log('No more visible steps');
        }

        return true;
    };

    const stepHasData = (step) => {
        const stepDataMap = {
            0: {
                key: 'personal',
                check: (data) => data && data.fullName && data.fullName.trim() !== '' && data.email && data.email.trim() !== '',
            },
            1: {
                key: 'marriedq',
                check: (data) => data && data.selection && data.selection.trim() !== '',
            },
            2: {
                key: 'married',
                check: (data) => data && data.firstName && data.firstName.trim() !== '',
            },
            3: {
                key: 'kidsq',
                check: (data) => data && data.selection && data.selection.trim() !== '',
            },
            4: {
                key: 'kids',
                check: (data) => data && Array.isArray(data) && data.length > 0,
            },
            5: {
                key: 'executors',
                check: (data) => data && Array.isArray(data) && data.length > 0,
            },
            6: {
                key: 'bequests',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            7: {
                key: 'residue',
                check: (data) => data && data.selected && data.selected.trim() !== '',
            },
            8: {
                key: 'wipeout',
                check: (data) => data && data.wipeout && Object.keys(data.wipeout).length > 0,
            },
            9: {
                key: 'trusting',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            10: {
                key: 'guardians',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            11: {
                key: 'pets',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            12: {
                key: 'poaProperty',
                check: (data) => data && Object.keys(data).length > 0,
            },
            13: {
                key: 'poaHealth',
                check: (data) => data && Object.keys(data).length > 0,
            },
            14: {
                key: 'additional',
                check: (data) => {
                    return data &&
                        (
                            (data.customClauseText && data.customClauseText.trim().length > 0) ||
                            (data.otherWishes && data.otherWishes.trim().length > 0) ||
                            Object.values(data.checkboxes || {}).some(value => value === true)
                        );
                },
            },

            15: {
                key: 'finalDetails',
                check: (data) => data && Object.keys(data).length > 0,
            },
            16: {
                key: 'documentDOM',
                check: (data) => true,
            },
        };

        // Usar getObjectStatus para obtener los datos del perfil correcto
        const profileData = getObjectStatus(objectStatus, currentProfile);

        const { key, check } = stepDataMap[step] || {};
        if (!key || !check) return false;

        // Buscar los datos en el perfil correspondiente
        for (const obj of profileData) {
            if (obj.hasOwnProperty(key)) {
                const data = obj[key];
                if (check(data)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Helper function to find the first incomplete step within visibleSteps
    const findFirstIncompleteStep = () => {
        for (let i = 0; i < visibleSteps.length; i++) {
            if (!stepHasData(visibleSteps[i].step)) {
                return visibleSteps[i].step;
            }
        }
        return null; // All steps are complete
    };

    // Function to determine if a step is clickable in the breadcrumb navigation
    const isStepClickable = (index) => {
        // Si el índice es 0, siempre permitimos hacer clic
        if (index === 0) return true;

        // Verificamos si el paso 0 tiene datos completos
        const step0Data = getObjectStatus(objectStatus, currentProfile).find(obj => obj.hasOwnProperty('personal'));
        const step1Data = getObjectStatus(objectStatus, currentProfile).find(obj => obj.hasOwnProperty('marriedq'));

        // Si no existe step0Data o falta el nombre completo o el correo electrónico, no se puede hacer clic en otros pasos
        if (!step0Data || !step0Data.personal.fullName || !step0Data.personal.email || !step1Data?.marriedq?.selection) {
            return false;
        }

        // Si el paso 0 está completo, permitimos hacer clic en otros pasos
        return true;
    };






    const currentStepIndex = visibleSteps !== null ? visibleSteps.findIndex((step) => step.step === pointer) : 16

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {visibleSteps[currentStepIndex]?.title || ''}
                    </h2>
                    <BreadcrumbNavigation
                        steps={visibleSteps}
                        currentStep={currentStepIndex}
                        onStepClick={(index) => {
                            if (!isStepClickable(index)) {
                                // Optionally, show a message or do nothing
                                alert("Please complete the Personal Information step first.");
                                return;
                            }
                            const actualStep = visibleSteps[index].step;
                            setPointer(actualStep);
                            localStorage.setItem('currentPointer', actualStep.toString());
                        }}
                        stepHasData={stepHasData}
                        isStepClickable={isStepClickable}
                    />
                </>
            }
        >
            <Head title={`Welcome, ${username}`} />
            <div className="py-12 h-[100%]" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: 'inherit' }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: 'inherit' }}>
                        {/* Render components based on the value of pointer */}
                        {pointer === 0 && <FormCity errors={validationErrors} />}
                        {pointer === 1 && <Married humanSelector="spouse" />}
                        {pointer === 2 && <AddHuman married={true} errors={validationErrors} />}
                        {pointer === 3 && <Married humanSelector="children" />}
                        {pointer === 4 && <AddRelative relative="children" errors={validationErrors} datas={getObjectStatus(objectStatus, currentProfile)} />}
                        {pointer === 5 && <HumanTable datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 6 && <Bequest datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 7 && <Residue datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 8 && <Wipeout datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 9 && <Trusting datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 10 && <GuardianForMinors datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 11 && <Pets datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 12 && <PoaProperty datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 13 && <PoaHealth datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 14 && <Additional datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 15 && <FinalDetails datas={getObjectStatus(objectStatus, currentProfile)} />}
                        {pointer === 16 && (
                            <DocumentSelector
                                errors={validationErrors}
                                objectStatus={objectStatus}
                                currentProfile={currentProfile}
                                currIdObjDB={currIdObjDB}
                                onSelect={(doc) => {
                                    setValidationErrors({});
                                }}
                                setPointer={setPointer}
                                setCurrentProfile={setCurrentProfile}
                                setCurrentDocument={setCurrentDocument}
                                setObjectStatus={setObjectStatus}
                                backStep={backStep}
                                stepHasData={stepHasData}
                                visibleSteps={visibleSteps}
                                setVisibleSteps={setVisibleSteps}
                            />
                        )}

                        <div className='p-5 flex justify-center mt-28'>
                            <Container fluid="md">
                                <Row>
                                    <Col xs={6} className="d-flex justify-content-start">
                                        {pointer > 0 && pointer < 15 && (
                                            <Button
                                                onClick={backStep}
                                                variant="outline-dark"
                                                size="lg"
                                                style={{ width: '100%' }}
                                            >
                                                Back
                                            </Button>
                                        )}
                                    </Col>
                                    <Col xs={6} className="d-flex justify-content-end">
                                        {pointer < 16 ? (
                                            <Button
                                                onClick={async () => {
                                                    const canAdvance = await nextStep(pointer + 1);
                                                    if (!canAdvance) {
                                                        console.log('Cannot advance due to validation errors');
                                                    }
                                                }}
                                                variant="outline-success"
                                                size="lg"
                                                style={{ width: '100%' }}
                                            >
                                                Continue
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleExit}
                                                variant="outline-success"
                                                size="lg"
                                                style={{ width: '100%' }}
                                            >
                                                Exit
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </Container>
                            <SelectPackageModal
                                show={showSelectPackageModal}
                                onSelect={(pkg) => handleSelectPackage(pkg)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

