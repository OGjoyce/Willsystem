import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
//Import needed components
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
import PDFEditor from '@/Components/PDF/PDFEditor';
import WillContent from '@/Components/PDF/Content/WillContent';
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';
import { ProfileSelector } from '@/Components/ProfileSelector';
import DocumentSelector from '@/Components/PDF/DocumentSelector';
import SelectPackageModal from '../Admin/SelectPackageModal';
import BreadcrumbNavigation from '@/Components/AdditionalComponents/BreadcrumbNavigation';
import PaymentModal from '@/Components/PaymentModal';
import ProfileSidebar from '@/Components/ProfileSidebar';
//Import utility functions
import { handleProfileData, handleSelectProfile } from '@/utils/profileUtils';
import { getObjectStatus, initializeObjectStructure, initializeSpousalWill } from '@/utils/objectStatusUtils';
import { packageDocuments, initializePackageDocuments } from '@/utils/packageUtils'
import { getVisibleSteps, stepHasData, findFirstIncompleteStep } from '@/utils/stepUtils';
import { assignDocuments } from '@/utils/documentsUtils';
import { storeDataObject, updateDataObject } from '@/Components/ObjStatusForm';
import { validate } from '@/Components/Validations';
//Import form handlers
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

const contentComponents = {
    primaryWill: WillContent,
    spousalWill: WillContent,
    secondaryWill: WillContent,
    poaProperty: POA1Content,
    poaHealth: POA2Content
};

export default function Personal({ auth }) {
    // Component state
    const [objectStatus, setObjectStatus] = useState([]);
    const [currIdObjDB, setCurrIdObjDB] = useState(null);
    const [currentProfile, setCurrentProfile] = useState(null)
    const [currentDocument, setCurrentDocument] = useState();
    const [showSelectPackageModal, setShowSelectPackageModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showSelectProfileModal, setShowSelectProfileModal] = useState(false)
    const [showPDFEditor, setShowPDFEditor] = useState(false)
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

    //Set the visible steps for breadcrumb after changing profile or document
    useEffect(() => {
        setVisibleSteps(getVisibleSteps(getObjectStatus(objectStatus, currentProfile), currentDocument))
    }, [objectStatus, currentProfile, currentDocument, pointer])


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
        setShowPaymentModal(true)
    };

    const handleSelectDocument = (docObj) => {
        let owner = docObj.owner || 'unknown';
        const document = docObj.docType;

        setCurrentDocument(document);

        if (owner !== 'unknown') {
            const newVisibleSteps = getVisibleSteps(getObjectStatus(objectStatus, owner), document)
            console.log(newVisibleSteps)
            const firstIncompleteStep = findFirstIncompleteStep(objectStatus, owner, newVisibleSteps)
            if (firstIncompleteStep) {
                setPointer(firstIncompleteStep);
            } else {
                setPointer(16);
                setShowPDFEditor(true);
            }

        }


        if (document === 'secondaryWill' && owner == 'unknown') {
            setCurrentDocument(document);
            setCurrentProfile(null);
            setPointer(0);
            return;
        } else if (document === 'secondaryWill' && owner !== 'unknown') {
            setCurrentDocument(document);
            setCurrentProfile(owner);

        }
        if (document === 'spousalWill' && owner == 'unknown') {
            setCurrentDocument(document);
            setCurrentProfile(null);
            setPointer(3);
            return;
        } else if (document === 'spousalWill' && owner !== 'unknown') {
            setCurrentDocument(document);
            setCurrentProfile(owner);
        }



        // Verificar si el documento tiene un associatedWill
        if (docObj.associatedWill) {
            const associatedWillId = docObj.associatedWill;

            // Buscar el Will asociado en los documentos
            const associatedWill = objectStatus[0]?.[0]?.packageInfo?.documents?.find(will => will.willIdentifier === associatedWillId);

            // Si el Will asociado tiene un owner, asignarlo automáticamente
            if (associatedWill && associatedWill.owner) {
                owner = associatedWill.owner;
                setCurrentProfile(owner);
                setCurrentDocument(document);

            }
        }

        // Si no hay associatedWill o el owner es 'unknown', mostrar el modal para seleccionar un email
        if (owner === 'unknown') {
            setShowPDFEditor(false)
            setCurrentProfile(null)
            setCurrentDocument(document)
            setShowSelectProfileModal(true);
            return;
        }

        // Si el documento ya tiene un owner, continuar con la lógica habitual
        if (document === currentDocument && owner === currentProfile) {

            setCurrentDocument(currentDocument)
            setCurrentProfile(currentProfile)
            return;
        }




        setCurrentDocument(document);
        setCurrentProfile(owner);
        console.log(owner)
        console.log(document)


    };

    const handleCreateNewProfile = () => {
        setPointer(0);
        setCurrentProfile(null);
        setShowSelectProfileModal(false)
    };


    const selectProfile = (objectStatus, email) => {
        setShowPDFEditor(false)
        const updatedObjectStatus = handleSelectProfile(objectStatus, email, currentProfile)
        setObjectStatus(updatedObjectStatus)
        setCurrentProfile(email)
        setShowSelectProfileModal(false)
        const newVisibleSteps = getVisibleSteps(getObjectStatus(objectStatus, owner), document)

        const firstIncompleteStep = findFirstIncompleteStep(objectStatus, owner, newVisibleSteps)
        firstIncompleteStep
            ? setPointer(firstIncompleteStep)
            : setShowPDFEditor(true)
    }
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

                if (objectStatus.find((data) => data[0].personal?.email == personalData.email)) {
                    console.log('return')
                    const errors = {}
                    errors.email = "Email taken. Please choose another"
                    setValidationErrors(errors)
                    return null
                }
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
                console.log(humanData)
                if (objectStatus.find((data) => data[0].personal?.email == humanData.email)) {
                    console.log('return')
                    const errors = {}
                    errors.email = "Email taken. Please choose another"
                    setValidationErrors(errors)
                    return null
                }

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
                console.log("pets", petsData)
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
        const firstIncompleteStep = findFirstIncompleteStep(objectStatus, currentProfile, visibleSteps);

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

        if (nextVisibleStep) {
            setPointer(nextVisibleStep.step);
            localStorage.setItem('currentPointer', nextVisibleStep.step.toString());
            localStorage.setItem('fullData', JSON.stringify(objectStatusResult));
        } else {
            console.log('No more visible steps');
        }

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
                        objectStatus={objectStatus}
                        currentProfile={currentProfile}
                        currentDocument={currentDocument}
                        steps={visibleSteps}
                        currentStep={currentStepIndex}
                        onStepClick={(index) => {
                            const actualStep = visibleSteps[index].step;
                            setPointer(actualStep);
                            localStorage.setItem('currentPointer', actualStep.toString());
                        }}

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
                        {pointer === 16 && <DocumentSelector objectStatus={objectStatus} handleSelectDocument={handleSelectDocument} currIdObjDB={currIdObjDB} />}
                        {pointer === 16 && showPDFEditor && (
                            <div className="fixed inset-0 flex justify-center items-center bg-gray-100 z-50 overflow-auto">
                                <div className="relative w-full max-w-5xl bg-white shadow-lg rounded-lg p-6 mt-12 mb-12">
                                    <PDFEditor
                                        documentType={currentDocument}
                                        objectStatus={objectStatus}
                                        documentOwner={currentProfile}
                                        backendId={currIdObjDB}
                                        ContentComponent={contentComponents[currentDocument]}
                                        onBack={() => { setShowPDFEditor(false) }}
                                    />
                                </div>
                            </div>
                        )
                        }
                        {showSelectProfileModal && <ProfileSelector objectStatus={objectStatus} handleCreateNewProfile={handleCreateNewProfile} selectProfile={selectProfile} />}
                        <ProfileSidebar
                            objectStatus={objectStatus}
                            currentProfile={currentProfile}
                            handleSelectDocument={handleSelectDocument}
                        />
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
                            {pointer === 0 && !currIdObjDB && (
                                <SelectPackageModal
                                    show={showSelectPackageModal}
                                    onHide={() => { }}
                                    onSelect={(pkg) => handleSelectPackage(pkg)}
                                />
                            )}
                            <PaymentModal show={showPaymentModal} handleClose={() => { setShowPaymentModal(false) }} />

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

