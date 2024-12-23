import React, { useState, useEffect } from "react";
import axios from "axios";

const ReservationScheduler = () => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [weeks, setWeeks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(15);
    const [disabledDurations, setDisabledDurations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [warning, setWarning] = useState("");

    const today = new Date();

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

    const fetchSlots = async (date, isPast) => {
        if (isPast) return;
        setSelectedDay(date);
        setSelectedSlot(null);
        setWarning("");
        setLoadingSlots(true);

        try {
            const response = await axios.get(`/api/law-firms/available-slots`, {
                params: { law_firm_id: 1, date: date },
            });

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

            const sortedSlots = uniqueSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
            setAvailableSlots(sortedSlots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleSlotSelection = (slot) => {
        setSelectedSlot(slot);
    };

    const confirmReservation = async () => {
        if (!selectedSlot) {
            alert("Please select a time slot before confirming.");
            return;
        }

        const payload = {
            law_firm_id: 1,
            date: selectedDay,
            start_time: selectedSlot.start_time,
            duration: selectedDuration,
            client_name: "Carlos Ramos",
            client_email: "carlos.ramos@example.com",
            title: "Consulta Legal",
            description: "Revisión de contrato",
            link: `https://meet.example.com/carlos-ramos`,
        };

        try {
            await axios.post("/api/reservations", payload);
            alert("Reservation created successfully!");
        } catch (error) {
            console.error("Error creating reservation:", error.response?.data || error.message);
            alert("Failed to create reservation. Please try again.");
        }
    };

    return (
        <div className="reservation-scheduler">
            <div className="p-4 max-w-md bg-white rounded-lg shadow-lg border-sky-700">
                <h3 className="text-lg font-bold text-center mb-2">Book a Meeting</h3>

                {/* Duración */}
                <div className="flex justify-center space-x-2 mb-3">
                    {[15, 30, 45, 60].map((duration) => (
                        <button
                            key={duration}
                            className={`px-4 py-2 rounded-md ${selectedDuration === duration
                                ? "bg-gray-800 text-white"
                                : disabledDurations.includes(duration)
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick={() => setSelectedDuration(duration)}
                            disabled={disabledDurations.includes(duration)}
                        >
                            {duration} min
                        </button>
                    ))}
                </div>

                {/* Días */}
                <div className="flex justify-between mb-3">
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
                ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mb-3">
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
                )}

                {/* Confirmar */}
                <button
                    className="w-full px-4 py-2 rounded-md bg-gray-800 text-white mt-2"
                    onClick={confirmReservation}
                    disabled={!selectedSlot}
                >
                    Confirm
                </button>
            </div>

            {/* Estilos en línea */}
            <style jsx>{`
                .reservation-scheduler {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                    max-width: 400px;
                }
            `}</style>
        </div>
    );
};

export default ReservationScheduler;
