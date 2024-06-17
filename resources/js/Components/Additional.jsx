
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, Head } from '@inertiajs/react';
import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Image from 'react-bootstrap/Image';
import donorIcon from '../../organdonation.png'
import customIcon from '../../customicon.png'
import blendedFamily from '../../blendedfamily.png'
import dualHanded from '../../dualhands.png'
import OrganDonation from '@/Components/AdditionalComponents/OrganDonation';
import ClauseArea from '@/Components/AdditionalComponents/ClauseArea';
import OtherWishes from '@/Components/AdditionalComponents/ClauseArea';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
var selected_value = "";
var objSelector = [];
var objToReturn = {
    "blended": false
};
var checkedFamily = false;
export function getAdditionalInformation() {
    objSelector.push(checkedFamily)
    return objSelector;
}
var firstRender = 0;

function Additional({ datas }) {


    var [dataPointer2, setDataPointer2] = useState(null);
    const [updatePointerSelector, setUpdatePointerSelector] = useState({});
    const [checkedState, setCheckedState] = useState({
        blendedFamily: false
    });
    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setCheckedState({
            ...checkedState,
            [name]: checked
        });
        checkedFamily = checkedState;
        objToReturn.blended = checkedState;
        
    };

    const callFunction = (obj) => {
        if (obj === false) {
            setDataPointer2(null);
        }
        else {
            setDataPointer2(null);
            setUpdatePointerSelector(obj);
            var objExport = {
                "Master": dataPointer2==0? "standard": dataPointer2==1? "custom": dataPointer2==3? "otherWishes": "",
                ...obj
            }
            objToReturn = {
                ...objToReturn,
                "Master": dataPointer2==0? "standard": dataPointer2==1? "custom": dataPointer2==3? "otherWishes": "",
                ...obj
                
            }
          
            
            objSelector.push(objExport);
           

        }

    }

    const handleSwitch = (pointer) => {





        setDataPointer2(pointer);





    }
    if (firstRender == 0) {
        firstRender == 1;
    }




    return (
        <><>



            {dataPointer2 == null ?

                <Container>

                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={donorIcon} rounded />
                        </Col>
                        <Col sm={4}>

                            <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(0) }} style={{ width: "100%", position: "relative", top: "40%" }} >Standard Clause</Button>


                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={customIcon} rounded />
                        </Col>
                        <Col sm={4}>
                            <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(1) }} style={{ width: "100%", position: "relative", top: "40%" }} >Custom Clause</Button>


                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={blendedFamily} rounded />
                        </Col>
                        <Col sm={4}>
                           
                            <Form.Check
                                 
                                 style={{ position: "relative", top: "40%" }}
                                type="checkbox"
                                id="blendedFamily"
                                name="blendedFamily"
                                label="Blended Family"
                                checked={checkedState.option2}
                                onChange={handleCheckboxChange}
                            />


                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}>
                            <Image style={{ position: "relative", left: "30%", width: "100px", height: "110px" }} src={dualHanded} rounded />
                        </Col>
                        <Col sm={4}>
                        <Button variant="outline-dark" type="submit" onClick={() => { handleSwitch(3) }} style={{ width: "100%", position: "relative", top: "40%" }} >Other Wishes</Button>


                        </Col>
                    </Row>
                </Container>
                :
                dataPointer2 == 0 ?
                    <><OrganDonation callFunction={callFunction} />
                    </>
                    :
                    dataPointer2 == 1 ?
                        <>
                            <ClauseArea callFunction={callFunction} />

                        </>
                        :
                        // <span>{console.log('no case' + dataPointer2)}</span>
                        dataPointer2 == 3 ?
                            <>
                            <OtherWishes callFunction={callFunction} clause={"other"} />
                            </>
                            :
                            null


            }

        </><>









            </></>



    );
}
export default Additional;