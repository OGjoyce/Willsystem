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
import PDFEditor from '@/Components/PDF/PDFEditor';
import WillContent from '@/Components/PDF/Content/WillContent'
import POA1Content from '@/Components/PDF/Content/POA1Content';
import POA2Content from '@/Components/PDF/Content/POA2Content';
import { PDFViewer } from '@react-pdf/renderer';
import { getPetInfo } from '@/Components/Pets';
import { getDocumentDOMInfo } from '@/Components/PDF/PDFEditor';
import { storeDataObject } from '@/Components/ObjStatusForm';
import { updateDataObject } from '@/Components/ObjStatusForm';

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
            "title": "Child Status"
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
            "title": "Review, Edit or Download your Document"
        }

    ]




    let username = auth.user.name;
    var [pointer, setPointer] = useState(0);
    const [selectedDocument, setSelectedDocument] = useState(null);
    var lastPointer = 0;
    const pushInfo = async function (step) {


        var object_to_push = {};
        var dupFlag = false;

        switch (step) {

            case 0:
                const personalData = getFormData();
                object_to_push.personal = { ...stepper[step], ...personalData, "timestamp": Date.now() };
                object_to_push.owner = personalData.email
                const dataFirstStore = await storeDataObject(object_to_push);
                currIdObjDB = dataFirstStore.id;
                //Call DB and SAVE DATA
                break;
            case 1:
                object_to_push.marriedq = { "selection": getMarriedData(), "timestamp": Date.now() };
                

                break;
            case 2:
                if (!dupMarried) {
                    object_to_push.married = { ...getHumanData(), "timestamp": Date.now() };

                }
                else {
                    dupFlag = true;

                }
                break;
            case 3:
                object_to_push.kidsq = { "selection": getMarriedData() };


                break;
            case 4:
                if (!dupKids) {
                    object_to_push.kids = { ...getChildRelatives() };
                }
                else {
                    dupFlag = true;
                }


                break;

            case 5:
                object_to_push.relatives = { ...getRelatives() };
                object_to_push.executors = { ...getExecutors() };
                break;
            case 6:
                object_to_push.bequests = { ...getBequestArrObj(), "timestamp": Date.now() };
                break;
            case 7:
                object_to_push.residue = { ...getOptObject(), "timestamp": Date.now() };
                break;
            case 8:
                object_to_push.wipeout = { ...getWipeoutData(), "timestamp": Date.now() };
                break;
            case 9:
                //DATA
                object_to_push.trusting = { ...getTableData(), "timestamp": Date.now() };
                break;
            case 10:
                object_to_push.guardians = { ...getGuardiansForMinors(), "timestamp": Date.now() }

            case 11:
                //DATA
                object_to_push.pets = { ...getPetInfo(), "timestamp": Date.now() };
                break;

            case 12:
                object_to_push.additional = { ...getAdditionalInformation(), "timestamp": Date.now() };
                break;
            case 13:
                object_to_push.poa = { ...getPoa(), "timestamp": Date.now() }
                break;
            case 14:
                break;
            case 15:
                object_to_push.documentDOM = { ...getDocumentDOMInfo(), "timestamp": Date.now() }
                break;



            default:
                break;
        }
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        if (!dupFlag) {
            object_status.push(object_to_push);
            if(step != 0 ){
                updateDataObject(object_status, currIdObjDB);

            }
            
            
        }
        localStorage.setItem('fullData', JSON.stringify(object_status));
        console.log(object_status);
        return object_status;

    }

    const popInfo = function () {
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        object_status.pop()


    }
    const pushMarried = function () {
        console.log("1. pushMarried:" + object_status);
        var object_to_push = {};
        object_to_push.married = { ...getHumanData(false) };
        object_status.push(object_to_push);
        dupMarried = true;
        console.log("2. pushMarried:" + object_status);

    }
    const pushKid = function () {
        console.log("1. pushKid:" + object_status);
        var object_to_push = {};
        object_to_push.kids = { ...getHumanData(false) };
        object_status.push(object_to_push);
        dupKids = true;
        console.log("2. pushKid:" + object_status);

    }
    const nextStep = async function (nextStep) {
        console.log("na." + nextStep);


        const objectStatus = await pushInfo(pointer);

        //recordatorio : validar si hizo que no tienia esposa ni hijos de todas formas agregar el campo a objectstatus para que siempre sea [3]
        try {

            if (pointer <= 2 && objectStatus[1].marriedq != undefined && objectStatus[1].marriedq.selection == "false") {
                lastPointer = nextStep;
                nextStep = nextStep + 1;
                pushMarried();



            }
            if (pointer >= 3 && pointer <= 4 && objectStatus[3].kidsq != undefined && objectStatus[3].kidsq.selection == "false") {

                lastPointer = nextStep;
                nextStep = nextStep + 1;
                pushKid();


            }

        } catch (error) {

        }

        console.log("nb." + nextStep);
        setPointer(nextStep);


        if (pointer === 15) {
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
            setPointer(0);
            return true;
        }

        return true;

    }
    const backStep = function (nextStep) {
        console.log("ab." + nextStep);
        console.log("pointer --" + pointer);
        const objectStatus = popInfo();
        var dupFlag = true;


        try {
            if (pointer <= 3 && objectStatus[1].marriedq != undefined && objectStatus[1].marriedq.selection == "false") {

                nextStep = nextStep - 1;

                popInfo();

            }
            if (pointer >= 4 && pointer <= 5 && objectStatus[3].kidsq != undefined && objectStatus[3].kidsq.selection == "false") {

                nextStep = nextStep - 1;
                popInfo();

            }

        } catch (error) {

        }
        console.log("bb." + nextStep);

        setPointer(nextStep);


        if (pointer === 16 || pointer === 17 || pointer === 18) {
            setSelectedDocument(null);
            setPointer(16);
        } else {
            setPointer(nextStep);
        }
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
            </Container >
        );
    };

    const handleExit = () => {
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
                            <FormCity />
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
                                <AddHuman married={true} />
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
                                <><AddRelative relative={"children"} datas={object_status} /></>
                                :
                                null


                        }
                        {
                            pointer == 5 ?

                                <HumanTable datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 6 ?
                                <Bequest datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 7 ?
                                <Residue datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 8 ?
                                <Wipeout datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 9 ?
                                <Trusting datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 10 ?
                                <GuardianForMinors datas={object_status} />

                                :
                                null
                        }
                        {
                            pointer == 11 ?
                                <Pets datas={object_status} />

                                :
                                null
                        }
                        {
                            pointer == 12 ?
                                <Additional datas={object_status} />
                                : null

                        }
                        {
                            pointer == 13 ?
                                <Poa datas={object_status} />
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

                                <PDFEditor ContentComponent={WillContent} datas={object_status} />
                                :
                                null
                        }
                        {
                            pointer == 16 ? (
                                <DocumentSelector onSelect={(doc) => {
                                    setSelectedDocument(doc);
                                    setPointer(17); // Move to the next pointer when a document is selected
                                }} />
                            ) : pointer == 17 || pointer == 18 ? (
                                selectedDocument ? (
                                    <PDFEditor
                                        ContentComponent={
                                            selectedDocument === 'Will' ? WillContent :
                                                selectedDocument === 'POA1' ? POA1Content :
                                                    POA2Content
                                        }
                                        datas={object_status}
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
                                                <Button onClick={() => backStep(pointer - 1)} variant="outline-dark" size="lg" style={{ width: "100%" }}>Back</Button>
                                        }
                                    </Col>
                                    <Col xs={6}>
                                        {
                                            pointer < 16 ?
                                                <Button onClick={() => nextStep(pointer + 1)} variant="outline-success" size="lg" style={{ width: "100%" }}>Continue</Button>
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