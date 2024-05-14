import FormCity from '@/Components/FormCity';
 
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Married from '@/Components/Married';
import {getFormData} from '@/Components/FormCity';
import {getMarriedData} from '@/Components/Married';
import AddHuman from '@/Components/AddHuman';
import ModalAddHuman from '@/Components/ModalAddHuman';
import {getRelatives, getExecutors} from '@/Components/HumanTable';
import Bequest from '@/Components/Bequest';
import {getBequestArrObj } from '@/Components/Bequest';
import { openModal, closeModal } from '@/Components/ModalAddHuman';
import { getHumanData } from '@/Components/AddHuman';
import HumanTable from '@/Components/HumanTable';
import Residue from '@/Components/Residue';
import Wipeout from '@/Components/Wipeout';
import { getWipeoutData } from '@/Components/Wipeout';

import Trusting from '@/Components/Trusting';
import { getTableData } from '@/Components/Trusting';



var object_status = [];
export default function Personal({ auth }) {
    var stepper = [
        {
            "step": 0,
            "title": "Personal"
        },
        {
            "step": 1,
            "title": "Married1"
        },
        {
            "step": 2,
            "title": "Married2"
        },
        {
            "step": 3,
            "title": "Childs1"
        },
        {
            "step": 4,
            "title": "Childs2"
        },
        {
            "step": 5,
            "title": "Executos"
        },
        {
            "step": 6,
            "title": "Bequest"
        },
        {
            "step": 7,
            "title": "Residue"
        },
        {
            "step": 8,
            "title": "Residue"
        },
        {
            "step": 9,
            "title": "Wipeout"
        },
        {
            "step": 10,
            "title": "Testamentery Trust"
        },
        {
            "step": 11,
            "title": "Additional"
        },



    ]




    let username = auth.user.name;
    var [pointer, setPointer] = useState(9);
    const pushInfo = function(step){
        
        var object_to_push = {};
        switch (step) {
            case 0:
                object_to_push.personal = {...stepper[step], ...getFormData()};
                break;
            case 1:
                object_to_push.marriedq = {"selection" : getMarriedData()};
                break;
            case 2:
                object_to_push.married = {...getHumanData()};
                break;
            case 3:
                object_to_push.kidsq = {"selection" : getMarriedData()};
                break;
            case 4:
                object_to_push.kids = {...getHumanData()};
                break;

            case 5:
                object_to_push.relatives = {...getRelatives()} ;
                object_to_push.executors = {...getExecutors()};
                break;
            case 6:
                object_to_push.bequests = { ...getBequestArrObj()};
                break;
            case 7:
                break;
            case 8:
                object_to_push.wipeout = { ...getWipeoutData()};
                break;

        
            default:
                break;
        }
       
        object_status.push(object_to_push);
        console.log(object_status);
        return object_status;

    }

    const popInfo = function(){
        object_status.pop();
        console.log(object_status);
        return object_status;

    }
    const nextStep = function(nextStep){
        pushInfo(pointer);
        setPointer(nextStep);
        return true;

    }
    const backStep = function(nextStep){
        popInfo();
        setPointer(nextStep);
        return true;

    }



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Creating will</h2>}
        >
            <Head title={"Welcome, " + username} />

            <div className="py-12" style={{ height: "100%", overflow:"hidden" }}>
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
                            pointer == 2?
                            <AddHuman married={true} />
                            :
                            null
                        }
                        {
                            pointer == 3?
                            <Married humanSelector={"children"} />
                            :
                            null
                        }
                        {
                            pointer == 4?
                            <AddHuman married={false} childrens={true} />
                            :
                            null
                            

                        }
                        {
                            pointer == 5?

                            <HumanTable datas={object_status} />
                            :
                            null
                        }
                        {
                            pointer == 6?
                            <Bequest datas={object_status}/>
                            :
                            null
                        }
                        {
                            pointer == 7?
                            <Residue />
                            :
                            null
                        }
                        {
                            pointer == 8?
                            <Wipeout datas={object_status}/>
                            :
                            null
                        }
                        {
                            pointer == 9?
                            <Trusting datas={object_status}/>
                            :
                            null
                        }
                        

                        <div style={{position: "relative", bottom:"1px", width:"80%", margin: "100px"}}>
                            <Container fluid="md">  
                                <Row>
                                    <Col xs={6} >
                                        <Button onClick={() => backStep(pointer - 1)} variant="outline-dark" size="lg" style={{width: "100%"}}>Back</Button>{' '}
                                    </Col>
                                    <Col xs={6}>
                                       
                                        <Button onClick={() => nextStep(pointer + 1)} variant="outline-success" size="lg" style={{width: "100%"}}>Continue</Button>{' '}
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
