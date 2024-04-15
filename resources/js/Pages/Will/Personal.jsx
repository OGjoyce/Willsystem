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

var object_status = [];
export default function Personal({ auth }) {
    var stepper = [
        {
            "step": 0,
            "title": "Personal"
        },
        {
            "step": 1,
            "title": "Married"
        },
        {
            "step": 2,
            "title": "Childs"
        },
        {
            "step": 3,
            "title": "Executor"
        },
        {
            "step": 4,
            "title": "Guardians"
        },
        {
            "step": 5,
            "title": "Personal"
        },
        {
            "step": 6,
            "title": "Personal"
        },
        {
            "step": 7,
            "title": "Personal"
        },
        {
            "step": 8,
            "title": "Personal"
        },
        {
            "step": 9,
            "title": "Personal"
        },



    ]

    

    let username = auth.user.name;
    var [pointer, setPointer] = useState(0);
    const pushInfo = function(step){
        var object_to_push = {};
        object_to_push.step = stepper[step];
        switch (step) {
            case 0:
                object_to_push.personal = getFormData();
                break;
            case 1:
                object_to_push.married = getMarriedData();
                break;
        
            default:
                break;
        }
       
        object_status.push(object_to_push);
        console.log(object_status);
        return object_status;

    }
    const nextStep = function(nextStep){
        pushInfo(pointer);
        setPointer(nextStep);
        return true;

    }



    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Let us know more about you... Information</h2>}
        >
            <Head title={"Welcome, " + username} />

            <div className="py-12" style={{ height: "90vh", overflow:"hidden" }}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" style={{ height: "inherit" }} >
                    <div className="bg-white overflow-visible shadow-sm sm:rounded-lg container" style={{ height: "inherit" }}>

                        {pointer == 0 ?
                            <FormCity />
                            :
                            null
                        }
                        {pointer == 1 ?
                            <Married/>
                            :
                            null
                        }
                        {
                            pointer == 2?
                            <AddHuman married={true} />
                            :
                            null
                        }

                        <div style={{position: "absolute", bottom:"15px"}}>
                            <Container>
                                <Row>
                                    <Col>
                                        <Button onClick={() => setPointer(pointer - 1)} variant="outline-dark" size="lg">Back1</Button>{' '}
                                    </Col>
                                    <Col>
                                       
                                        <Button onClick={() => nextStep(pointer + 1)} variant="outline-success" size="lg">Continue</Button>{' '}
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
