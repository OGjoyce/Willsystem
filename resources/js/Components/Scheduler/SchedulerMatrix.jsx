import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { AppointmentModal } from './AppointmentModal';
import { CreateAppointmentModal } from './CreateAppointmentModal';
import axios from 'axios';

import './schedulerMatrix.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export function SchedulerMatrix() {
    const [userSchedule, setUserSchedule] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [newAppointment, setNewAppointment] = useState({
        date: '',
        time: '',
        title: '',
        description: '',
        duration: 60,
        email: ''
    });

    // Guardar nueva cita
    const handleSaveAppointment = async () => {
        try {
            const [hour, minute] = newAppointment.time.split(':');
            const formattedTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;

            const [month, day, year] = newAppointment.date.split('/');
            const formattedDate = `${year}-${month}-${day}`;

            const response = await axios.post('http://localhost:8000/api/appointments', {
                ...newAppointment,
                date: formattedDate,
                time: formattedTime
            });

            setUserSchedule((prev) => [
                ...prev,
                {
                    ...response.data,
                    date: newAppointment.date
                }
            ]);

            setShowCreateModal(false);
            setNewAppointment({
                date: '',
                time: '',
                title: '',
                description: '',
                duration: 60,
                email: ''
            });
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    const handleCreateAppointment = (date, time) => {
        setNewAppointment({ ...newAppointment, date, time });
        setShowCreateModal(true);
    };

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('/api/appointments/all');
                const formattedData = response.data.map((item) => {
                    const [year, month, day] = item.date.split('-');
                    const formattedDate = `${month}/${day}/${year}`;

                    // Normaliza el nombre del campo y asegura que siempre exista un título
                    return {
                        ...item,
                        date: formattedDate,
                        time: item.time?.substring(0, 5),
                        title: item.title || item.Title || "Untitled", // Normaliza el título
                    };
                });
                setUserSchedule(formattedData);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };

        fetchAppointments();
    }, []);

    const handleClickDate = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const getWeekDates = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const weekDates = {};

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            weekDates[daysOfWeek[i]] = currentDay.toLocaleDateString("en-US");
        }

        return weekDates;
    };

    const generateRows = (dayName) => {
        const daysOfTheWeek = getWeekDates();
        const currentDate = daysOfTheWeek[dayName];

        return Array.from({ length: 24 }).map((_, hour) => {
            const formattedHour = `${hour.toString().padStart(2, '0')}:00`;
            const matchingAppointment = userSchedule?.find(
                (appointment) => appointment.date === currentDate && appointment.time === formattedHour
            );

            if (matchingAppointment) {
                const truncatedTitle = matchingAppointment.title?.length > 5
                    ? `${matchingAppointment.title.substring(0, 5)}...`
                    : matchingAppointment.title;

                return (
                    <>
                        <Row
                            key={formattedHour}
                            className="custom-row"
                            onClick={() => handleClickDate(matchingAppointment)}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="bi bi-eye-fill">{truncatedTitle}</i>

                        </Row>
                        <hr></hr>
                    </>

                );
            } else {
                return (
                    <>
                        <Row
                            key={formattedHour}
                            className="custom-row"
                            onClick={() => handleCreateAppointment(currentDate, formattedHour)}
                            style={{ cursor: 'pointer' }}
                        />
                        <hr></hr></>
                );
            }
        });
    };

    const datesWeek = getWeekDates();

    const data = [
        { day: "Time", color: "dark" },
        { day: "Monday", color: "dark" },
        { day: "Tuesday", color: "info" },
        { day: "Wednesday", color: "warning" },
        { day: "Thursday", color: "danger" },
        { day: "Friday", color: "success" },
        { day: "Saturday", color: "secondary" },
        { day: "Sunday", color: "primary" }
    ];

    const daysOfTheWeek = data.map((day) => (
        <Col key={day.day} style={{ background: day.color }}>
            <h1>{day.day}</h1>
            <h4><Badge bg={day.color}>{datesWeek[day.day]}</Badge></h4>

            {day.day === "Time" ? (
                <>
                    <h4><Badge bg={day.color}>0 - 23 hours</Badge></h4>
                    {Array.from({ length: 24 }).map((_, hour) => (
                        <Row key={hour}><h4>{hour.toString().padStart(2, '0')}:00</h4> <hr></hr></Row>
                    ))}
                </>
            ) : (
                generateRows(day.day)
            )}
        </Col>
    ));

    return (
        <>
            <Container className="bg-gray">
                <Row>
                    {daysOfTheWeek}
                </Row>
            </Container>

            <AppointmentModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                appointment={selectedAppointment}
            />

            <CreateAppointmentModal
                show={showCreateModal}
                handleClose={() => setShowCreateModal(false)}
                newAppointment={newAppointment}
                setNewAppointment={setNewAppointment}
                handleSave={handleSaveAppointment}
            />
        </>
    );
}

export default SchedulerMatrix;
