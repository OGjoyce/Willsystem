// Necessary imports
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
import StepRedirect from '@/Components/AdditionalComponents/StepRedirect';
import { handleProfileData, getObjectStatus } from '@/Components/ProfileDataHandler';
// Import functions and data from FormHandlers
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
} from '@/Components/FormHandlers';

import { storeDataObject, updateDataObject } from '@/Components/ObjStatusForm';
import { validate } from '@/Components/Validations';

export default function Personal({ auth }) {
    // Component state
    const [objectStatus, setObjectStatus] = useState([]);
    const [dupMarried, setDupMarried] = useState(false);
    const [dupKids, setDupKids] = useState(false);
    const [currIdObjDB, setCurrIdObjDB] = useState(null);
    const [pointer, setPointer] = useState(0);
    const [validationErrors, setValidationErrors] = useState({});
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [availableDocuments, setAvailableDocuments] = useState([]);
    const [currentDocument, setCurrentDocument] = useState();
    const [currentProfile, setCurrentProfile] = useState(null)

    const stepper = [
        { step: 0, title: 'Personal Information' },
        { step: 1, title: 'Married Status' },
        { step: 2, title: "Spouse's Information" },
        { step: 3, title: 'Children' },
        { step: 4, title: 'Children Information' },
        { step: 5, title: 'Will Executors' },
        { step: 6, title: 'Bequest Information' },
        { step: 7, title: 'Select Residue' },
        { step: 8, title: 'Wipeout Information' },
        { step: 9, title: 'Testamentary Trust' },
        { step: 10, title: 'Guardian For Minors' },
        { step: 11, title: 'Guardian For Pets' },
        { step: 12, title: 'Power Of Attorney Property' },
        { step: 13, title: 'Power Of Attorney Health' },
        { step: 14, title: 'Additional Information' },
        { step: 15, title: 'Final Details' },
        { step: 16, title: 'Review, Edit and Download your Documents' },
    ];

    const packageDocuments = {
        'One will only': ['primaryWill'],
        'One will and one POA (property)': ['primaryWill', 'poaProperty'],
        'One will and one POA (health)': ['primaryWill', 'poaHealth'],
        'One will and two POAs': ['primaryWill', 'poaProperty', 'poaHealth'],
        'One will and one secondary will': ['primaryWill', 'secondaryWill'],
        'One will and one secondary will and one POA (property)': ['primaryWill', 'secondaryWill', 'poaProperty'],
        'One will and one secondary will and one POA (health)': ['primaryWill', 'secondaryWill', 'poaHealth'],
        'One will and one secondary will and two POAs': ['primaryWill', 'secondaryWill', 'poaProperty', 'poaHealth'],  // POAS?
        'Two spousal wills only': ['primaryWill', 'spousalWill'],
        'Two spousal wills and two POAs (property)': ['primaryWill', 'spousalWill', 'poaProperty', 'poaPropery'],
        'Two spousal wills and two POAs (health)': ['primaryWill', 'spousalWill', 'poaHealth', 'poaHealth'],
        'Two spousal wills and four POAs': ['primaryWill', 'spousalWill', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'],
        'Two spousal wills and one secondary will': ['primaryWill', 'spousalWill', 'secondaryWill'],
        'Two spousal wills and one secondary will and two POAs (property)': ['primaryWill', 'spousalWill', 'secondaryWill', 'poaProperty', 'poaProperty'], //POAS?
        'Two spousal wills and one secondary will and two POAs (health)': ['primaryWill', 'spousalWill', 'secondaryWill', 'poaHealth', 'poaHealth'], //POAS?
        'Two spousal wills and one secondary will and four POAs': ['primaryWill', 'spousalWill', 'secondaryWills', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'], // POAS?
        'Two spousal wills and two secondary wills': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill'],
        'Two spousal wills and two secondary wills and two POAs (property)': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaProperty', 'poaProperty'], //POAS?
        'Two spousal wills and two secondary wills and two POAs (health)': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaHealth', 'poaHealth'], //POAS?
        'Two spousal wills and two secondary wills and four POAs': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'], //POAS?
        '1 X POA health only (no will)': ['poaHealth'],
        '1 X POA property only (no will)': ['poaProperty'],
        '1 X POA health and POA property (no will)': ['poaProperty', 'poaHealth'],
        '2 X POA health only (no will)': ['poaHealth', 'poaHealth'],
        '2 X POA property only (no will)': ['poaProperty', 'poaProperty'],
        '2 X POA health and POA property (no will)': ['poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'],
    };


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
                const documents = packageInfo?.documents ? Object.keys(packageInfo.documents) : [];
                setAvailableDocuments(documents);

                // Establecer currentDocument con el primer documento disponible, si existe
                setCurrentDocument(documents.length > 0 ? documents[0] : null);

                // Restaurar otros estados necesarios
                setDupMarried(parsedData.some((obj) => obj.hasOwnProperty('married')));
                setDupKids(parsedData.some((obj) => obj.hasOwnProperty('kids')));

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


    useEffect(() => {
        if (pointer == 0 && objectStatus.length > 0) {
            backStep()
        }
    }, [pointer, currentProfile])

    useEffect(() => {
        if (!currentProfile || !currentDocument) return;

        // Acceder al packageInfo del primer elemento de objectStatus
        const packageInfo = objectStatus[0]?.[0]?.packageInfo;

        if (packageInfo && packageInfo.documents) {
            // Buscar el índice del documento que coincide con currentDocument y tiene owner 'unknown'
            const documentIndex = packageInfo.documents.findIndex(
                (docObj) =>
                    docObj.docType === currentDocument && docObj.owner === 'unknown'
            );

            // Si encontramos un documento que coincide y tiene "unknown" como owner
            if (documentIndex !== -1) {
                // Clonar objectStatus para no mutar el estado original directamente
                const updatedObjectStatus = [...objectStatus];

                // Clonar el packageInfo y los documentos
                const updatedPackageInfo = {
                    ...packageInfo,
                    documents: [...packageInfo.documents],
                };

                // Asignar el currentProfile como owner del documento específico
                updatedPackageInfo.documents[documentIndex] = {
                    ...updatedPackageInfo.documents[documentIndex],
                    owner: currentProfile,
                };

                // Actualizar el packageInfo en updatedObjectStatus
                updatedObjectStatus[0][0] = {
                    ...updatedObjectStatus[0][0],
                    packageInfo: updatedPackageInfo,
                };

                // Actualizar el estado global (objectStatus)
                setObjectStatus(updatedObjectStatus);

                // Guardar en localStorage o actualizar la base de datos si es necesario
                localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));
                if (currIdObjDB) {
                    updateDataObject(updatedObjectStatus, currIdObjDB);
                }
            }
        }
    }, [currentProfile, currentDocument]);



    useEffect(() => {
        // Inicializa la estructura por defecto si no está presente
        if (pointer == 1 && !getObjectStatus(objectStatus, currentProfile).some(obj => obj.hasOwnProperty('marriedq'))) {
            const initialObjectStructure = [
                { name: 'marriedq', data: {} },
                { name: 'married', data: {} },
                { name: 'kidsq', data: {} },
                { name: 'kids', data: [] },
                { name: 'executors', data: [] },
                { name: 'relatives', data: [] },
                { name: 'bequests', data: {} },
                { name: 'residue', data: {} },
                { name: 'wipeout', data: {} },
                { name: 'trusting', data: {} },
                { name: 'guardians', data: {} },
                { name: 'pets', data: {} },
                { name: 'additional', data: {} },
                { name: 'poaProperty', data: {} },
                { name: 'poaHealth', data: {} },
                { name: 'finalDetails', data: {} },
                { name: 'documentDOM', data: {} }
            ];

            // Iterar sobre cada propiedad de la estructura inicial y enviarla una por una a handleProfileData
            let updatedObjectStatus = objectStatus; // Mantener el objectStatus actualizado
            initialObjectStructure.forEach(item => {
                updatedObjectStatus = handleProfileData(currentProfile, [item], updatedObjectStatus);
            });

            // Establecer el nuevo objectStatus
            setObjectStatus(updatedObjectStatus);
            localStorage.setItem('fullData', JSON.stringify(updatedObjectStatus));
        }
    }, [objectStatus, currentDocument, pointer, currentProfile]);


    // Show or hide the Select Package Modal based on the current step
    useEffect(() => {
        if (pointer === 0) {
            setShowSelectModal(true);
        } else {
            setShowSelectModal(false);
        }
    }, [pointer]);

    const handleHideSelectModal = () => {
        if (selectedPackage !== null) {
            setShowSelectModal(false);
        }
    };

    const handleSelectPackage = (pkg) => {
        setSelectedPackage(pkg);
        setShowSelectModal(false);
        setAvailableDocuments(packageDocuments[pkg.description] || []);
        setCurrentDocument((packageDocuments[pkg.description] && packageDocuments[pkg.description][0]) || null);
    };




    const handleDocumentChange = (newDocument) => {
        setSelectedDoc(newDocument);
        onSelect(newDocument); // Esto también actualizará en el componente padre si es necesario
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
                    const dataObj = {
                        personal: {
                            ...stepper[step],
                            ...personalData,
                            timestamp: Date.now(),
                        },
                        owner: personalData.email,
                        packageInfo: {
                            ...selectedPackage,
                            documents: availableDocuments.map((docType, index) => ({
                                id: index + 1,
                                docType,
                                owner: index === 0 ? personalData.email : "unknown",
                                dataStatus: "incomplete"
                            })),
                        },
                    };

                    propertiesAndData = [
                        { name: 'personal', data: dataObj.personal },
                        { name: 'owner', data: dataObj.owner },
                        {
                            name: 'packageInfo', data: currIdObjDB === null ? dataObj.packageInfo : { 'undefined': "not a onwner of any package" }
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
            const currentIndex = visibleSteps.findIndex(step => step.step === pointer);
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
        setDupMarried(false);
        setDupKids(false);
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
        const newVisibleSteps = getVisibleSteps(getObjectStatus(objectStatusResult, currentProfile));
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
            const updatedVisibleSteps = getVisibleSteps(updatedObjectStatus);
            nextVisibleStep = updatedVisibleSteps.find((step) => step.step > pointer);
        }

        if (pointer === 3 && noKids) {
            const propertiesAndData = [{ name: 'kids', data: [] }];
            const updatedObjectStatus = handleProfileData(currentProfile, propertiesAndData, objectStatusResult);
            setObjectStatus(updatedObjectStatus);
            // Recalculate visible steps
            const updatedVisibleSteps = getVisibleSteps(updatedObjectStatus);
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



    // Function to get the list of visible steps based on current data
    const getVisibleSteps = (objectStatusToUse = getObjectStatus(objectStatus, currentProfile)) => {
        const hasSpouse = objectStatusToUse.some(
            (obj) => obj.marriedq && (obj.marriedq.selection === 'true' || obj.marriedq.selection === 'soso')
        );
        const hasKids = objectStatusToUse.some((obj) => obj.kidsq && obj.kidsq.selection === 'true');

        return stepper.filter((step, index) => {

            if (index != 0 && currentDocument == null) return false
            // Ocultar pasos basados en la información de spouse y kids
            if (index === 2 && !hasSpouse) return false; // Spouse Information
            if (index === 4 && !hasKids) return false; // Children Information
            if (index === 10 && !hasKids) return false; // Guardian For Minors

            // Lógica basada en currentDocument
            if (currentDocument === 'primaryWill') {
                // Ocultar pasos 12 (POA Property) y 13 (POA Health) si es un primaryWill
                if (index === 12 || index === 13) return false;
            } else if (currentDocument === 'poaProperty') {
                // Ocultar todos menos el paso 12 para POA Property
                if (index === 5 || index === 6 || index === 7 || index === 8 || index === 9 ||
                    index === 10 || index === 11 || index === 13 || index === 14 || index === 15) {
                    return false;
                }
            } else if (currentDocument === 'poaHealth') {
                if (index === 5 || index === 6 || index === 7 || index === 8 || index === 9 ||
                    index === 10 || index === 11 || index === 12 || index === 14 || index === 15) {
                    return false;
                }
            }

            return true;
        });
    };

    const visibleSteps = getVisibleSteps();
    const currentStepIndex = visibleSteps.findIndex((step) => step.step === pointer);

    // Data for StepRedirect
    const hasSpouse = getObjectStatus(objectStatus, currentProfile).some(
        (obj) => obj.marriedq && (obj.marriedq.selection === 'true' || obj.marriedq.selection === 'soso')
    );
    const hasKids = getObjectStatus(objectStatus, currentProfile).some((obj) => obj.kidsq && obj.kidsq.selection === 'true');
    const hasSpouseData = getObjectStatus(objectStatus, currentProfile).some((obj) => obj.married);
    const hasKidsData = getObjectStatus(objectStatus, currentProfile).some((obj) => obj.kids && obj.kids.length > 0);
    const stepBack = !hasSpouseData ? 1 : !hasKidsData ? 3 : null;

    const spouseData = getObjectStatus(objectStatus, currentProfile).some((obj) => obj.married) ? getObjectStatus(objectStatus, currentProfile).find((obj) => obj.married) : null;
    const kidsData = getObjectStatus(objectStatus, currentProfile).some((obj) => obj.kids) ? getObjectStatus(objectStatus, currentProfile).find((obj) => obj.kids) : null;

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
            <div className="py-12" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: 'inherit' }}>
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: 'inherit' }}>
                        {/* Render components based on the value of pointer */}
                        {pointer === 0 && <FormCity errors={validationErrors} />}
                        {pointer === 1 && <Married humanSelector="spouse" />}
                        {pointer === 2 && hasSpouse && <AddHuman married={true} errors={validationErrors} />}
                        {pointer === 3 && <Married humanSelector="children" />}
                        {pointer === 4 && hasKids && <AddRelative relative="children" errors={validationErrors} datas={getObjectStatus(objectStatus, currentProfile)} />}
                        {pointer === 5 && <HumanTable datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {
                            pointer === 6 && spouseData !== null && kidsData !== null ?
                                <Bequest datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />
                                : (
                                    pointer === 6
                                        ? <StepRedirect onGoToStep={setPointer} missingStep={stepBack} />
                                        : null
                                )
                        }
                        {
                            pointer === 7 && spouseData !== null && kidsData !== null ?
                                <Residue datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />
                                : (
                                    pointer === 7
                                        ? <StepRedirect onGoToStep={setPointer} missingStep={stepBack} />
                                        : null
                                )
                        }
                        {
                            pointer === 8 && spouseData !== null && kidsData !== null ?
                                <Wipeout datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />
                                : (
                                    pointer === 8
                                        ? <StepRedirect onGoToStep={setPointer} missingStep={stepBack} />
                                        : null
                                )
                        }
                        {pointer === 9 && <Trusting datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {pointer === 10 && hasKids && <GuardianForMinors datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />}
                        {
                            pointer === 11 && spouseData !== null && kidsData !== null ?
                                <Pets datas={getObjectStatus(objectStatus, currentProfile)} errors={validationErrors} />
                                : (
                                    pointer === 11
                                        ? <StepRedirect onGoToStep={setPointer} missingStep={stepBack} />
                                        : null
                                )
                        }
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
                            />
                        )}

                        <div
                            style={{
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '100px',
                            }}
                        >
                            <Container fluid="md">
                                <Row>
                                    <Col xs={6} className="d-flex justify-content-start">
                                        {pointer > 0 && pointer < 15 && (
                                            <Button
                                                onClick={backStep} // Updated to use the modified backStep function
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
                            {pointer === 0 && objectStatus.length == 0 && (
                                <SelectPackageModal
                                    show={showSelectModal}
                                    onHide={handleHideSelectModal}
                                    onSelect={(pkg) => handleSelectPackage(pkg)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

