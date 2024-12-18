import React, { useState, useEffect } from "react";
import axios from "axios";

const ReservationScheduler = () => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [weeks, setWeeks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(60);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [warning, setWarning] = useState("");

    const today = new Date();

    // Generar semanas dinámicas
    const generateWeeks = () => {
        const weeksArray = [];
        for (let week = 0; week < 4; week++) {
            const days = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(today);
                date.setDate(today.getDate() + week * 7 + day);
                days.push({
                    date: date.toISOString().split("T")[0],
                    dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
                    dateLabel: date.getDate(),
                    monthLabel: date.toLocaleDateString("en-US", { month: "long" }),
                    isPast: date < today.setHours(0, 0, 0, 0),
                });
            }
            weeksArray.push(days);
        }
        setWeeks(weeksArray);
    };

    useEffect(() => {
        generateWeeks();
    }, []);

    // Fetch slots
    const fetchSlots = async (date, isPast) => {
        if (isPast) return;
        setSelectedDay(date);
        setSelectedSlot(null);
        setWarning("");
        setLoadingSlots(true);

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/law-firms/available-slots`, {
                params: { law_firm_id: 1, date: date },
            });

            // Obtener slots únicos y ordenarlos por start_time
            const uniqueSlots = [];
            const slotMap = new Map();

            response.data.forEach((slot) => {
                if (!slotMap.has(slot.start_time)) {
                    slotMap.set(slot.start_time, true);
                    uniqueSlots.push({
                        start_time: slot.start_time,
                        lawyer_id: slot.lawyer_id,
                        lawyer_name: slot.lawyer_name,
                    });
                }
            });

            // Ordenar los slots por start_time ascendente
            const sortedSlots = uniqueSlots.sort((a, b) => {
                return a.start_time.localeCompare(b.start_time);
            });

            setAvailableSlots(sortedSlots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };



    const findMaxAvailableDuration = (selectedSlot) => {
        const slotTimeInMinutes = 15; // Duración de cada slot
        const maxDuration = 60; // Máximo tiempo consecutivo
        let accumulatedMinutes = 0;

        // Filtrar y ordenar los slots del mismo abogado
        const lawyerSlots = availableSlots
            .filter(slot => slot.lawyer_id === selectedSlot.lawyer_id)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        // Convertir a un Set para acceso rápido
        const availableStartTimes = new Set(lawyerSlots.map(slot => slot.start_time));

        // Tiempo inicial seleccionado
        let currentTime = selectedSlot.start_time;

        while (accumulatedMinutes < maxDuration) {
            // Verificar si el tiempo actual está disponible
            if (availableStartTimes.has(currentTime)) {
                accumulatedMinutes += slotTimeInMinutes;
            } else {
                break; // Si no está disponible, detener el bucle
            }

            // Calcular el siguiente tiempo esperado
            const [hours, minutes] = currentTime.split(":").map(Number);
            const nextTime = new Date();
            nextTime.setHours(hours);
            nextTime.setMinutes(minutes + slotTimeInMinutes);

            currentTime = nextTime.toTimeString().substring(0, 5); // Actualizar al siguiente tiempo
        }

        return accumulatedMinutes;
    };






    const handleSlotSelection = (slot) => {
        const maxDuration = findMaxAvailableDuration(slot);
        if (maxDuration < selectedDuration) {
            setWarning(`Adjusted duration to ${maxDuration} minutes due to a conflict.`);
            setSelectedDuration(maxDuration);
        } else {
            setWarning("");
        }
        setSelectedSlot(slot);
    };



    // useEffect para validar duración y slot seleccionados
    useEffect(() => {
        console.log("slot: ", selectedSlot)
        console.log("duration: ", selectedDuration)
        if (selectedSlot && selectedDuration) {
            const maxDuration = findMaxAvailableDuration(selectedSlot);
            console.log("maxDuration", maxDuration)
            if (maxDuration === 0) {
                setWarning("Selected slot does not have enough availability.");
                setSelectedDuration(15);
            } else if (maxDuration < selectedDuration) {
                setWarning(`Adjusted duration to ${maxDuration} minutes due to limited availability.`);
                setSelectedDuration(maxDuration);
            } else {
                setWarning("");
            }
        }
    }, [selectedSlot, selectedDuration]);

    // Crear reserva
    const confirmReservation = async () => {
        if (!selectedSlot) return;

        const payload = {
            law_firm_id: 1,
            date: selectedDay,
            start_time: selectedSlot.start_time,
            duration: selectedDuration,
            client_name: "Carlos Ramos",
            client_email: "carlos.ramos@example.com",
            title: "Legal Consultation",
            description: "Revisión de contrato",
            link: `https://meet.example.com/carlos-ramos`,
        };

        try {
            await axios.post("http://127.0.0.1:8000/api/reservations", payload);
            alert("Reservation created successfully!");
        } catch (error) {
            console.error("Error creating reservation:", error);
            alert("Failed to create reservation. Please try again.");
        }
    };

    const currentMonth = weeks[currentWeekIndex]?.[0]?.monthLabel || "";

    return (
        <div className="p-4 max-w-lg mx-auto bg-white rounded-lg shadow-md">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Book a Meeting</h3>
                <p className="text-gray-500 text-sm">Choose a date, duration, and time slot</p>
            </div>

            {/* Duración */}
            <div className="flex justify-center space-x-2 mb-4">
                {[15, 30, 45, 60].map((duration) => (
                    <button
                        key={duration}
                        className={`px-4 py-2 rounded-md ${selectedDuration === duration
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200"
                            }`}
                        onClick={() => setSelectedDuration(duration)}
                    >
                        {duration} min
                    </button>
                ))}
            </div>

            {/* Advertencia */}
            {warning && <div className="text-yellow-600 text-sm text-center mb-4">{warning}</div>}

            {/* Week Slider */}
            <div className="flex justify-between items-center mb-2">
                <button
                    disabled={currentWeekIndex === 0}
                    onClick={() => setCurrentWeekIndex((prev) => prev - 1)}
                    className="text-gray-500 disabled:opacity-50"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <span className="font-bold">{currentMonth}</span>
                <button
                    disabled={currentWeekIndex === weeks.length - 1}
                    onClick={() => setCurrentWeekIndex((prev) => prev + 1)}
                    className="text-gray-500 disabled:opacity-50"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>

            {/* Días */}
            <div className="flex justify-between mb-4">
                {weeks[currentWeekIndex]?.map((day) => (
                    <div
                        key={day.date}
                        className={`text-center cursor-pointer p-2 rounded-md ${day.isPast
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : selectedDay === day.date
                                ? "bg-pink-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                        onClick={() => fetchSlots(day.date, day.isPast)}
                    >
                        <div className="text-sm font-bold">{day.dayLabel}</div>
                        <div className="text-lg">{day.dateLabel}</div>
                    </div>
                ))}
            </div>

            {/* Slots */}
            {loadingSlots ? (
                <p className="text-center text-gray-500">Loading slots...</p>
            ) : selectedDay ? (
                availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot, index) => (
                            <button
                                key={index}
                                className={`px-2 py-1 rounded-md ${selectedSlot?.start_time === slot.start_time
                                    ? "bg-gray-800 text-white"
                                    : "bg-gray-100 hover:bg-gray-300"
                                    }`}
                                onClick={() => handleSlotSelection(slot)}
                            >
                                {slot.start_time}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">No slots available.</p>
                )
            ) : (
                <p className="text-center text-gray-500">Select a date to see slots.</p>
            )}

            {/* Confirmar */}
            <div className="text-center mt-4">
                <button
                    className={`w-full px-4 py-2 rounded-md ${selectedSlot
                        ? "bg-gray-800 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    onClick={confirmReservation}
                    disabled={!selectedSlot}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};

export default ReservationScheduler;
