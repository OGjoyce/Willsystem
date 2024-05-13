
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { useState } from 'react'

import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

import AddHuman from './AddHuman';
import { getHumanData } from './AddHuman';
import Modal from 'react-bootstrap/Modal';

import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import DropdownButton from 'react-bootstrap/DropdownButton';
import { Row, Col, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';



export function getBequestArrObj() {
    return bequestArrObj;
}

function Residue({ id, datas }) {

 





    var options = [' Have the residue go to children per stirpes',
        'Have the residue go to children per capita',
        'Have the residue go to parents then siblings per stirpes',
        'Have the residue go to siblings per sirpes',
        'Specific Beneficiaries',
        'CUSTOM CLAUSE (will override every other option)'

     ]
     var obj = {
        options: options, // Your array of string values
        selectedOption: null,
      };
      
      var [selected ,setSelected ] = useState(obj);
      var [custom ,setCustom ] = useState(false);
      var [specific ,setSpecific ] = useState(false);
      console.log(selected);
      const handleSelect = (key, eventKey) => {
        setSelected({ ...selected, selectedOption: eventKey });
        if(key==4){
            setSpecific(true);
            setCustom(false);
        }
        if(key==5){
            setCustom(true);
            setSpecific(false);
        }
      }
      
    return (
        <>

<DropdownButton
        id="dropdown-basic-button"
        title={selected.selectedOption ? selected.selectedOption : 'Select an option'}
        onSelect={handleSelect}
      >
        {selected.options.map((option, index) => (
          <Dropdown.Item key={index} eventKey={option}>
            {option}
          </Dropdown.Item>
        ))}
      </DropdownButton>
           {
            specific?
            <p>Question for Dale, what should I do here? by the legal part I cannot do a custom? or you just can select 1 option? How could this be better?</p>
            :
            null
           }
           {
            custom? 
            <Form>
                <Form.Group className="mb-3" controlId="customTextArea">
                    <Form.Label>Custom Clause</Form.Label>
                    <Form.Control as="textarea" rows={8}  />
                </Form.Group>
            </Form>
            :
            null
           }






        </>




    );
}
export default Residue;
