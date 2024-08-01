import FormCity from '@/Components/FormCity';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head, router } from '@inertiajs/react';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Married from '@/Components/Married';
import { getFormData } from '@/Components/FormCity';
import { getMarriedData } from '@/Components/Married';
import AddHuman from '@/Components/AddHuman';
import ModalAddHuman from '@/Components/ModalAddHuman';
import { getRelatives, getExecutors } from '@/Components/HumanTable';
import Bequest from '@/Components/Bequest';
import { getBequestArrObj } from '@/Components/Bequest';
import { openModal, closeModal } from '@/Components/ModalAddHuman';
import { getHumanData } from '@/Components/AddHuman';
import HumanTable from '@/Components/HumanTable';
import Residue from '@/Components/Residue';
import Wipeout from '@/Components/Wipeout';
import { getWipeoutData } from '@/Components/Wipeout';
import AddRelative from '@/Components/AddRelative';
import Trusting from '@/Components/Trusting';
import { getTableData } from '@/Components/Trusting';
import { getChildRelatives } from '@/Components/AddRelative';
import { getOptObject } from '@/Components/Residue';
import GuardianForMinors from '@/Components/GuardianForMinors';
import { getGuardiansForMinors } from '@/Components/GuardianForMinors';
import Pets from '@/Components/Pets';
import Additional from '@/Components/Additional';
import { getAdditionalInformation } from '@/Components/Additional';
import Poa from '@/Components/Poa';
import { getPoa } from '@/Components/Poa';
import FinalDetails from '@/Components/FinalDetails';
import { getFinalDetails } from '@/Components/FinalDetails';
import PDFEditor from '@/Components/PDF/PDFEditor';
import WillContent from '@/Components/PDF/Content/WillContent'
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';
import { PDFViewer } from '@react-pdf/renderer';
import { getPetInfo } from '@/Components/Pets';
import { getDocumentDOMInfo } from '@/Components/PDF/PDFEditor';
import { storeDataObject } from '@/Components/ObjStatusForm';
import { updateDataObject } from '@/Components/ObjStatusForm';
import { validateFormData, validateAddHumanData, validate } from '@/Components/Validations.jsx';
import { document } from 'postcss';

var object_status = [];
var objectState = [];
var dupMarried = false;
var dupKids = false;
let currIdObjDB = null;
export default function Personal({ auth }) {
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
            "title": "Review, Edit and Download your Will"
        },
        {
            "step": 16,
            "title": "Review, Edit or Download your Documents"
        },
        {
            "step": 17,
            "title": "Review, Edit or Download your Will"
        },
        {
            "step": 18,
            "title": "Review, Edit or Download your POA1"
        },
        {
            "step": 19,
            "title": "Review, Edit or Download your POA2"
        }

    ]




    let username = auth.user.name;
    var [pointer, setPointer] = useState(0);
    var [validationErrors, setValidationErrors] = useState({})
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [formData, setFormData] = useState({});
    var lastPointer = 0;


    useEffect(() => {
        const savedData = localStorage.getItem('fullData');
        const savedPointer = localStorage.getItem('currentPointer');
        const savedCurrIdObjDB = localStorage.getItem('currIdObjDB');

        if (savedData && savedPointer) {
            object_status = JSON.parse(savedData);
            setPointer(parseInt(savedPointer, 10));

            // Restore other necessary state
            dupMarried = object_status.some(obj => obj.hasOwnProperty('married'));
            dupKids = object_status.some(obj => obj.hasOwnProperty('kids'));

            // If there's a stored ID, restore it
            if (savedCurrIdObjDB) {
                currIdObjDB = savedCurrIdObjDB;
            }

            // If there's stored data, update it in the database
            if (currIdObjDB) {
                updateDataObject(object_status, currIdObjDB);
            }
        }
    }, []);

    const pushInfo = async function (step) {


        var object_to_push = {};
        var dupFlag = false;

        switch (step) {

            case 0:

                localStorage.removeItem('fullData');
                localStorage.removeItem('currentPointer');
                setValidationErrors({})
                const personalData = getFormData();

                var errors = await validateFormData(personalData);

                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                }

                object_to_push.personal = { ...stepper[step], ...personalData, "timestamp": Date.now() };
                object_to_push.owner = personalData.email
                const dataFirstStore = await storeDataObject(object_to_push);
                currIdObjDB = dataFirstStore.id;
                break;
            case 1:

                object_to_push.marriedq = { "selection": getMarriedData(), "timestamp": Date.now() };


                break;
            case 2:
                setValidationErrors({})
                const humanData = getHumanData()

                var errors = await validateAddHumanData(humanData);

                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                }


                object_to_push.married = { ...getHumanData(), "timestamp": Date.now() };
                object_to_push.married = { ...humanData, "timestamp": Date.now() };
                setFormData(prevData => ({ ...prevData, married: humanData }));
                break;


            case 3:
                object_to_push.kidsq = { "selection": getMarriedData() };


                break;
            case 4:
                setValidationErrors({})
                if (!dupKids) {


                    const kidsData = getChildRelatives()

                    var errors = await validate.kids(kidsData);

                    if (Object.keys(errors).length > 0) {

                        setValidationErrors(errors)
                        console.log(validationErrors)
                        return null;
                    } else {
                        object_to_push.kids = { ...getChildRelatives() };
                    }

                }
                else {
                    dupFlag = true;
                }


                break;

            case 5:
                setValidationErrors({})
                const executorsData = getExecutors()
                var errors = await validate.executors(executorsData)
                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.relatives = { ...getRelatives() };
                    object_to_push.executors = { ...getExecutors() };
                }

                break;
            case 6:

                setValidationErrors({})
                const bequestData = getBequestArrObj()
                var errors = await validate.bequest(bequestData);
                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.bequests = { ...getBequestArrObj(), "timestamp": Date.now() };
                }

                break;
            case 7:
                setValidationErrors({})
                const residueData = getOptObject()

                var errors = await validate.residue(residueData);
                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.residue = { ...getOptObject(), "timestamp": Date.now() };
                }


                break;
            case 8:
                const wipeoutData = getWipeoutData()

                var errors = await validate.wipeout(wipeoutData);
                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.wipeout = { ...getWipeoutData(), "timestamp": Date.now() };
                }

                break;
            case 9:
                //DATA
                const trustingData = getTableData()

                var errors = await validate.trusting(trustingData);
                if (Object.keys(errors).length > 0) {

                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.trusting = { ...getTableData(), "timestamp": Date.now() };
                }

                break;
            case 10:

                const guardiansData = getGuardiansForMinors()

                var errors = await validate.guardians(guardiansData);
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.guardians = { ...getGuardiansForMinors(), "timestamp": Date.now() }
                }
                break;
            case 11:

                const petsData = getPetInfo()

                var errors = await validate.pets(petsData);
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.pets = { ...getPetInfo(), "timestamp": Date.now() };
                }


                break;

            case 12:

                const additionalData = getAdditionalInformation()

                var errors = await validate.additional(additionalData);
                console.log('data', additionalData)
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.additional = { ...getAdditionalInformation(), "timestamp": Date.now() };
                }

                break;
            case 13:


                const poaData = getPoa()

                var errors = await validate.poa(poaData);
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.poa = { ...getPoa(), "timestamp": Date.now() }

                }

                break;
            case 14:
                object_to_push.finalDetails = { ...getFinalDetails(), "timestamp": Date.now() }
                break;
            case 15:

                const documentDOMData = getDocumentDOMInfo()

                var errors = await validate.documentDOM(documentDOMData);
                if (Object.keys(errors).length > 0) {
                    setValidationErrors(errors)
                    console.log(validationErrors)
                    return null;
                } else {
                    object_to_push.documentDOM = { ...getDocumentDOMInfo(), "timestamp": Date.now() }

                }


                break;




            default:
                break;
        }
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        if (!dupFlag) {
            object_status.push(object_to_push);
            if (step != 0) {
                updateDataObject(object_status, currIdObjDB);

            }
            localStorage.setItem('fullData', JSON.stringify(object_status));
            localStorage.setItem('currentPointer', step.toString());
            localStorage.setItem('currIdObjDB', currIdObjDB);


        }
        console.log(object_status);
        return object_status;

    }

    const popInfo = function () {
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        object_status.pop()
        localStorage.setItem('fullData', JSON.stringify(object_status));

    }
    const pushMarried = function () {

        var emptyObject = {};
        emptyObject.married = {};
        object_status.push(emptyObject);
        dupMarried = true;


    }
    const pushKid = function () {

        var emptyObject = {};
        emptyObject.kids = {};
        object_status.push(emptyObject);
        dupKids = true;


    }
    const nextStep = async function (nextStep) {
        console.log("na." + nextStep);

        const objectStatus = await pushInfo(pointer);
        if (!objectStatus) {
            return false;
        }

        const marriedqObject = objectStatus.find(obj => obj.marriedq !== undefined && (obj.marriedq.selection === "false" || obj.marriedq.selection === ""));
        const kidsqObject = objectStatus.find(obj => obj.kidsq !== undefined && (obj.kidsq.selection === "false" || obj.kidsq.selection === ""));
        try {// Encuentra el objeto que contiene 'marriedq' con la selección deseada


            if (pointer === 1 && marriedqObject) {
                pushMarried()
                nextStep = 3; // Saltar a la pregunta sobre hijos
                setPointer(3);
            }


            // Skip children information if no kids
            if (pointer === 3 && kidsqObject) {
                pushKid()
                nextStep = 5; // Skip to executors step
                setPointer(5)
            }

        } catch (error) {
            console.error("Error in nextStep:", error);
        }

        console.log("nb." + nextStep);
        setPointer(nextStep);

        if (pointer === 15) {
            setValidationErrors({})
            setPointer(16);
        } else {
            setPointer(nextStep);
        }

        if (nextStep === 0) {
            // Reset everything
            object_status = [];
            objectState = [];
            dupMarried = false;
            dupKids = false;

            localStorage.removeItem('fullData');
            localStorage.removeItem('currentPointer');

            setPointer(0);
            return true;
        }
        localStorage.setItem('currentPointer', nextStep.toString());
        localStorage.setItem('fullData', JSON.stringify(object_status));
        return true;
    }
    const backStep = function (nextStep) {
        console.log("ab." + nextStep);
        console.log("pointer --" + pointer);

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

        // Instead of popping the last item, we'll keep it
        // const objectStatus = popInfo();
        var dupFlag = true;

        console.log("bb." + nextStep);

        setPointer(nextStep);
        localStorage.setItem('currentPointer', nextStep.toString());

        // Update the UI to reflect the data from the previous step
        // This assumes you have a state variable to hold form data
        // setFormData(object_status[nextStep] || {});

        return true;
    }

    const DocumentSelector = ({ onSelect }) => {
        return (
            <Container>
                <h3>Select a Document to View, Edit or Download</h3>
                <Row className="mt-3">
                    <Col>
                        <Button onClick={() => onSelect('Will')} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-file-text"></i> Will</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => onSelect('POA1')} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-house"></i> POA1 Property</Button>
                    </Col>
                    <Col>
                        <Button onClick={() => onSelect('POA2')} style={{ width: "100%" }} variant="outline-dark"> <i class="bi bi-hospital"></i> POA2 Health</Button>
                    </Col>

                </Row>
                {validationErrors.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{validationErrors.documentDOM}</p>}
            </Container >
        );
    };

    const handleExit = () => {

        // Check if the necessary documents are present
        const documentsNeeded = ["Will", "POA1", "POA2"];
        const missingDocuments = documentsNeeded.filter(doc =>
            !object_status.some(obj => obj.hasOwnProperty('documentDOM') && obj['documentDOM'][doc])
        );

        if (missingDocuments.length > 0) {
            // Set validation error for documentDOM
            setValidationErrors({
                documentDOM: `Please save the following documents before exiting: ${missingDocuments.join(', ')}`
            });
            return;
        }
        object_status = [];
        objectState = [];
        dupMarried = false;
        dupKids = false;
        localStorage.removeItem('fullData');
        router.get(route('dashboard'));
    }


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{stepper[pointer].title}</h2>}
        >
            <Head title={"Welcome, " + username} />
            <div className="py-12" style={{ height: "100%", overflow: "hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }} >
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>

                        {pointer == 0 ?
                            <FormCity errors={validationErrors} />
                            :
                            null
                        }
                        {pointer == 1 ?
                            <Married humanSelector={"spouse"} />
                            :
                            null
                        }
                        {
                            pointer == 2 ?
                                <AddHuman
                                    married={true}
                                    errors={validationErrors}
                                    data={formData.married || {}}
                                    onDataChange={(newData) => setFormData(prevData => ({ ...prevData, married: newData }))}
                                />
                                :
                                null
                        }
                        {
                            pointer == 3 ?
                                <Married humanSelector={"children"} />
                                :
                                null
                        }
                        {
                            pointer == 4 ?
                                <><AddRelative relative={"children"} datas={object_status} errors={validationErrors} /></>
                                :
                                null


                        }
                        {
                            pointer == 5 ?

                                <HumanTable datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 6 ?
                                <Bequest datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 7 ?
                                <Residue datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 8 ?
                                <Wipeout datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 9 ?
                                <Trusting datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 10 ?
                                <GuardianForMinors datas={object_status} errors={validationErrors} />

                                :
                                null
                        }
                        {
                            pointer == 11 ?
                                <Pets datas={object_status} errors={validationErrors} />

                                :
                                null
                        }
                        {
                            pointer == 12 ?
                                <Additional datas={object_status} errors={validationErrors} />
                                : null

                        }
                        {
                            pointer == 13 ?
                                <Poa datas={object_status} errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 14 ?
                                <FinalDetails datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 15 ?

                                <PDFEditor ContentComponent={WillContent} datas={object_status} documentType='Will' errors={validationErrors} />
                                :
                                null
                        }
                        {
                            pointer == 16 ? (
                                <DocumentSelector
                                    errors={validationErrors}
                                    onSelect={(doc) => {
                                        setSelectedDocument(doc);
                                        if (doc === "Will") { setPointer(17); }
                                        if (doc === "POA1") { setPointer(18) }
                                        if (doc === "POA2") { setPointer(19) }
                                        setValidationErrors({})
                                    }} />
                            ) : pointer == 17 || pointer == 18 || pointer == 19 ? (
                                selectedDocument ? (
                                    <PDFEditor
                                        ContentComponent={
                                            selectedDocument === 'Will' ? WillContent :
                                                selectedDocument === 'POA1' ? POA1Content :
                                                    POA2Content
                                        }
                                        datas={object_status}
                                        documentType={selectedDocument}
                                        errors={validationErrors}
                                    />
                                ) : null
                            ) : null
                        }




                        <div style={{ position: "relative", bottom: "1px", width: "80%", margin: "100px" }}>
                            <Container fluid="md">
                                <Row>
                                    <Col xs={6} >
                                        {
                                            pointer == 0 ?
                                                null
                                                :
                                                <Button
                                                    onClick={() => backStep(pointer - 1)}
                                                    variant="outline-dark"
                                                    size="lg"
                                                    style={{ width: "100%" }}
                                                >
                                                    Back
                                                </Button>
                                        }
                                    </Col>
                                    <Col xs={6}>
                                        {
                                            pointer < 16 ?
                                                <Button
                                                    onClick={async () => {
                                                        const canAdvance = await nextStep(pointer + 1);
                                                        if (!canAdvance) {
                                                            // Optionally, you can show an error message here
                                                            console.log("Cannot advance due to validation errors");
                                                        }
                                                    }}
                                                    variant="outline-success"
                                                    size="lg"
                                                    style={{ width: "100%" }}
                                                >
                                                    Continue
                                                </Button>
                                                :
                                                null
                                        }
                                        {
                                            pointer === 16 ?
                                                <Button
                                                    onClick={handleExit}
                                                    variant="outline-success"
                                                    size="lg"
                                                    style={{ width: "100%" }}
                                                >
                                                    Exit
                                                </Button>
                                                :
                                                null
                                        }
                                    </Col>
                                </Row>
                            </Container>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}