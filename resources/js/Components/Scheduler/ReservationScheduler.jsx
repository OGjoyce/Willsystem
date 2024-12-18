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
            setAvailableSlots(response.data);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Verificar solapamientos y duración
    const findMaxAvailableDuration = (slot) => {
        const durations = [60, 45, 30, 15];
        let maxDuration = 15;

        for (const duration of durations) {
            const requiredSlots = duration / 15;
            let isValid = true;

            for (let i = 0; i < requiredSlots; i++) {
                const nextTime = new Date(
                    new Date(`${selectedDay}T${slot.start_time}`).getTime() + i * 15 * 60000
                )
                    .toISOString()
                    .split("T")[1]
                    .substring(0, 5);

                const hasSlot = availableSlots.some(
                    (s) => s.lawyer_id === slot.lawyer_id && s.start_time === nextTime
                );

                if (!hasSlot) {
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                maxDuration = duration;
                break;
            }
        }

        return maxDuration;
    };

    // Seleccionar slot
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
