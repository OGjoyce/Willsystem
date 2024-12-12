import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';

export function SchedulerMatrix() {
    const data = [
        {"day":"Time", "color":"light"},
        {"day":"Monday", "color":"dark"},
        {"day":"Tuesday", "color":"info"},
        {"day":"Wednesday", "color":"warning"},
        {"day":"Thrusday", "color":"danger"},
        {"day":"Friday", "color":"success"},
        {"day":"Saturday", "color":"secondary"},
        {"day":"Sunday", "color":"primary"},

    
    ];
    let arr = [];
    for (let i=0; i < 24; i++) {
        for (let j=0; j < 1; j++) {
            arr.push(`${i}:${j === 0 ? `00` : 1*j}`);
        }
    }

    let dataHours = arr.map((hour, index) => {
        return(
            <><h4>{hour}</h4><hr></hr></>
        )
    });
    

    const daysOfTheWeek = data.map((day, index) => {
      return (
        <><Col style={{"background": day.color}}>
              <Row>
              <h1>{day.day}</h1>
              <br>
              </br>
              <h4><Badge bg={day.color}>12/11/2024</Badge></h4>
              <hr></hr>
                {
                    day.day =="Time"?
                    <>
                    {dataHours}
                    </>
                    :
                    <><br></br><hr></hr></>
                }
             


              </Row>

          </Col>
          </>
    );
    });
  return (
    <Container className="bg-gray">
        <Row >

            {daysOfTheWeek}
            


        </Row>
      
      
    </Container>
  );
};

export default SchedulerMatrix;
