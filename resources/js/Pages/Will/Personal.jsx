import FormCity from '@/Components/FormCity';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
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
import PDFComponent from '@/Components/PDF/PDFComponent';

import { PDFViewer } from '@react-pdf/renderer';
import { getPetInfo } from '@/Components/Pets';
import PDFEditor from '@/Components/PDFEditor';

var object_status = [];
var objectState = [];
var dupMarried = false;
var dupKids = false;
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
            "title": "Review and Download your file"
        }



    ]




    let username = auth.user.name;
    var [pointer, setPointer] = useState(0);
    var lastPointer = 0;
    const pushInfo = function (step) {


        var object_to_push = {};
        var dupFlag = false;

        switch (step) {

            case 0:
                object_to_push.personal = { ...stepper[step], ...getFormData(), "timestamp": Date.now() };
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



            default:
                break;
        }
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        if (!dupFlag) {
            object_status.push(object_to_push);
        }
        localStorage.setItem('fullData', JSON.stringify(object_status));
        console.log(object_status);
        return object_status;

    }

    const popInfo = function () {
        objectState = object_status;
        const objectStateFreezed = JSON.parse(JSON.stringify(object_status));
        object_status.pop()

        localStorage.setItem('fullData', JSON.stringify(object_status));
        console.log(objectStateFreezed);
        return objectStateFreezed;

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
        return true;

    }



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {stepper[pointer].title}
                    <div>
                        {/* BUTTONS ADDED FOR DEBBUGING: Will remove them soon */}
                        <Button onClick={exportData} size='sm' variant="outline-success">Export current Data</Button>
                        <Button onClick={deleteData} size='sm' variant="outline-danger">Delete LocalStorage Data</Button>
                    </div>
                </h2>
            }
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

                                <WillEditor object_status={object_status} />
                                :
                                null
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

                                        <Button onClick={() => nextStep(pointer + 1)} variant="outline-success" size="lg" style={{ width: "100%" }}>Continue</Button>
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