import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';
import './schedulerMatrix.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function SchedulerMatrix() {
    function getWeekDates() {
        const today = new Date(); // Get today's date
        const dayOfWeek = today.getDay(); // Get day of the week (0 - Sunday, 6 - Saturday)
        const startOfWeek = new Date(today); // Clone today date to calculate Monday
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday

        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const weekDates = {};

        // Populate the weekDates object
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i); // Add days to get each day of the week
            weekDates[daysOfWeek[i]] = currentDay.toLocaleDateString("en-US"); // Format as MM/DD/YYYY
        }

        return weekDates;
    }

    const data = [
        { "day": "Time", "color": "dark" },
        { "day": "Monday", "color": "dark" },
        { "day": "Tuesday", "color": "info" },
        { "day": "Wednesday", "color": "warning" },
        { "day": "Thursday", "color": "danger" },
        { "day": "Friday", "color": "success" },
        { "day": "Saturday", "color": "secondary" },
        { "day": "Sunday", "color": "primary" },


    ];
    const userSchedule =
        [
            {
                "date": "12/18/2024",
                "time": "14:00",
                "duration": "60:00",
                "Title": "Sgn Document for Client",
                "Description": "Important information such links on the same system",
                "owner": "ownstrpk4@gmail.com",

            },
            {
                "date": "12/19/2024",
                "time": "15:00",
                "duration": "60:00",
                "Title": "mario@gmail.com",
                "Description": "Important information such links on the same system",
                "owner": "ownstrpk4@gmail.com",

            },
            {
                "date": "12/21/2024",
                "time": "11:00",
                "duration": "60:00",
                "Title": "See details",
                "Description": "Important information such links on the same system",
                "owner": "ownstrpk4@gmail.com",

            }

        ]
    let arr = [];
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 1; j++) {
            arr.push(`${i}:${j === 0 ? `00` : 1 * j}`);
        }
    }

    let dataHours = arr.map((hour, index) => {
        return (
            <><Row><h4>{hour}</h4></Row><hr></hr></>
        )
    });
    const generateRows = (dayName) => {
        const daysOfTheWeek = getWeekDates();
        const currentDate = daysOfTheWeek[dayName];
        const userScheduleScoped = userSchedule;

        //verify on user schedule whats going on 
        //this variable userschedule should be taken from a https get from the user that is watching 

        return arr.map((hour, index) => {
            const matchingSchedules = userScheduleScoped.filter(item => item.date === currentDate);
            let currTitle;
            if (matchingSchedules.length > 0) {

                let flagForReturn = false;

                matchingSchedules.forEach((schedule, index) => {
                    if (schedule.time == hour) {
                        console.log("MATCHS " + schedule.Title);

                        flagForReturn = true;
                        currTitle = schedule.Title;




                    }
                });
                if (flagForReturn) {
                    const truncatedString = currTitle.length > 5 ? currTitle.substring(0, 5) + "..." : originalString;
                    currTitle = truncatedString;
                    return (

                        <><Row className="custom-row"><i class="bi bi-eye-fill">{currTitle}</i></Row><hr></hr></>
                    )



                }
                else {
                    return (

                        <><Row className="custom-row"></Row><hr></hr></>
                    )
                }
            } else {
                return (

                    <><Row className="custom-row"></Row><hr></hr></>
                )
            }


        });

    }




    const datesWeek = getWeekDates();

    const daysOfTheWeek = data.map((day, index) => {
        return (
            <><Col style={{ "background": day.color }}>

                <h1>{day.day}</h1>
                <br>
                </br>

                <h4><Badge bg={day.color}>{datesWeek[day.day]}</Badge></h4>

                {
                    day.day == "Time" ?
                        <>
                            <h4><Badge bg={day.color}>0 - 23 hours</Badge></h4>
                            <hr></hr>
                            {dataHours}
                        </>
                        :
                        <>
                            {generateRows(day.day)}

                        </>
                }






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
