import React, { useState, useEffect } from "react";
import axios from "axios";
import CustomToast from '../AdditionalComponents/CustomToast';

const ReservationScheduler = ({ profilesArray, setShowScheduler, fixedDuration, disableDurationSelection }) => {
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [weeks, setWeeks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(15);
    const [disabledDurations, setDisabledDurations] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [warning, setWarning] = useState("");
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [timePeriod, setTimePeriod] = useState('morning');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const today = new Date();

    useEffect(() => {
        if (profilesArray?.length) {
            setProfiles(profilesArray);
        }
    }, [profilesArray]);

    useEffect(() => {
        setSelectedDuration(fixedDuration || 5);
    }, [fixedDuration]);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
    };

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

            const uniqueSlots = Array.from(
                new Map(response.data.map(slot => [slot.start_time, slot])).values()
            ).sort((a, b) => a.start_time.localeCompare(b.start_time));

            setAvailableSlots(uniqueSlots);
        } catch (error) {
            console.error("Error fetching slots:", error);
            showToast("Failed to fetch available slots. Please try again.", "error");
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const getFilteredSlots = () => {
        if (timePeriod === 'all') return availableSlots;

        return availableSlots.filter(slot => {
            const hour = parseInt(slot.start_time.split(':')[0]);
            return timePeriod === 'morning'
                ? hour >= 6 && hour < 12
                : hour >= 12 && hour < 23;
        });
    };

    const findMaxAvailableDuration = (selectedSlot) => {
        const slotTimeInMinutes = 5; // Ajustar a 5 minutos
        const maxDuration = 60;
        let accumulatedMinutes = 0;

        const allSlots = availableSlots
            .filter(slot => slot.start_time >= selectedSlot.start_time)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));

        const availableStartTimes = new Set(allSlots.map(slot => slot.start_time));
        let currentTime = selectedSlot.start_time;

        while (accumulatedMinutes < maxDuration) {
            if (availableStartTimes.has(currentTime)) {
                accumulatedMinutes += slotTimeInMinutes;
            } else {
                break;
            }

            const [hours, minutes] = currentTime.split(":").map(Number);
            const nextTime = new Date();
            nextTime.setHours(hours);
            nextTime.setMinutes(minutes + slotTimeInMinutes);
            currentTime = nextTime.toTimeString().substring(0, 5);
        }

        return accumulatedMinutes;
    };

    const handleSlotSelection = (slot) => {
        const maxDuration = findMaxAvailableDuration(slot);
        const allowedDurations = [5, 15, 30, 45, 60].filter(duration => duration <= maxDuration);

        setDisabledDurations([5, 15, 30, 45, 60].filter(duration => !allowedDurations.includes(duration)));

        if (maxDuration < selectedDuration) {
            setWarning(`Duration adjusted to ${maxDuration} min. Choose another time for full availability`);
            setSelectedDuration(maxDuration);
        } else {
            setWarning("");
        }
        setSelectedSlot(slot);
    };

    const confirmReservation = async () => {
        if (!selectedSlot) {
            showToast("Please select a time slot before confirming.", "error");
            return;
        }

        if (!selectedProfile) {
            showToast("Please select a participant for the meeting.", "error");
            return;
        }

        try {
            const response = await axios.post(
                "/api/reservations",
                {
                    law_firm_id: 1,
                    date: selectedDay,
                    start_time: selectedSlot.start_time,
                    duration: selectedDuration,
                    client_name: selectedProfile?.fullName,
                    client_email: selectedProfile?.email,
                    title: "Legal Consultation",
                    description: "Contract Review",
                    link: `https://meet.example.com/legal-consultation`,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            showToast("Reservation created successfully!", "success");
            setTimeout(() => setShowScheduler(false), 1500);
        } catch (error) {
            console.error("Reservation error:", error);
            showToast(
                error.response?.status === 400
                    ? "Invalid reservation request. Please check your inputs."
                    : "Failed to create reservation. Please try again.",
                "error"
            );
        }
    };

    const currentMonth = () => {
        const daysInView = weeks[currentWeekIndex] || [];
        const uniqueMonths = [...new Set(daysInView.map(day => day.monthLabel))];
        return uniqueMonths.length > 1
            ? `${uniqueMonths[0]} / ${uniqueMonths[1]}`
            : uniqueMonths[0];
    };

    useEffect(() => {
        setDisabledDurations([]);
    }, [selectedDay]);

    return (
        <div className="p-4 max-w-lg mx-auto bg-white rounded-lg shadow-md">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Book a Meeting</h3>
                <p className="text-gray-500 text-sm">Choose a date and time slot</p>
            </div>

            <div className="flex justify-center space-x-2 mb-4">
                {!disableDurationSelection && [5, 15, 30, 45, 60].map((duration) => (
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

            {warning && (
                <div className="text-yellow-600 text-sm text-center mb-4">{warning}</div>
            )}

            <div className="flex justify-between items-center mb-2">
                <button
                    disabled={currentWeekIndex === 0}
                    onClick={() => setCurrentWeekIndex((prev) => prev - 1)}
                    className="text-gray-500 disabled:opacity-50"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <span className="font-bold">{currentMonth()}</span>
                <button
                    disabled={currentWeekIndex === weeks.length - 1}
                    onClick={() => setCurrentWeekIndex((prev) => prev + 1)}
                    className="text-gray-500 disabled:opacity-50"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>

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
                        <h1>hola</h1>
                    </div>
                ))}
            </div>

            {selectedDay && (
                <div className="mb-4">
                    <div className="flex justify-center space-x-2">
                        <button
                            className={`px-4 py-2 rounded-md ${timePeriod === 'morning'
                                ? "bg-gray-800 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick={() => setTimePeriod('morning')}
                        >
                            <i className="bi bi-brightness-alt-high"></i> Morning
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${timePeriod === 'evening'
                                ? "bg-gray-800 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            onClick={() => setTimePeriod('evening')}
                        >
                            <i className="bi bi-sun"></i> Evening
                        </button>
                    </div>
                </div>
            )}

            {loadingSlots ? (
                <p className="text-center text-gray-500">Loading slots...</p>
            ) : selectedDay ? (
                getFilteredSlots().length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {getFilteredSlots().map((slot, index) => (
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
                    <p className="text-center text-gray-500">No slots available for the selected time period.</p>
                )
            ) : (
                <p className="text-center text-gray-500">Select a date to see slots.</p>
            )}

            {selectedSlot && (
                <div className="space-y-2 m-6">
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assign Meeting To
                        </label>
                        <p className="text-sm text-gray-500">Select the person who will attend this meeting</p>
                    </div>
                    <select
                        value={selectedProfile ? JSON.stringify(selectedProfile) : ""}
                        onChange={(e) => setSelectedProfile(e.target.value ? JSON.parse(e.target.value) : null)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-colors"
                    >
                        <option value="">Select participant</option>
                        {profiles.map((profile) => (
                            <option key={profile.email} value={JSON.stringify(profile)}>
                                {profile.fullName} ({profile.email})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="text-center mt-4">
                <button
                    className={`w-full px-4 py-2 rounded-md ${selectedSlot
                        ? "bg-gray-800 text-white hover:bg-gray-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    onClick={confirmReservation}
                    disabled={!selectedSlot}
                >
                    Confirm
                </button>
            </div>

            <CustomToast
                show={toast.show}
                onClose={() => setToast({ show: false, message: '', type: 'info' })}
                message={toast.message}
                type={toast.type}
            />
        </div>
    );
};

export default ReservationScheduler;
