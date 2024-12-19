import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailabilitySchedulerGrid = () => {
    const [lawyers, setLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [grid, setGrid] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [draggedCells, setDraggedCells] = useState([]);
    const [warning, setWarning] = useState("");

    // Days of the week
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        // Fetch the list of lawyers
        const fetchLawyers = async () => {
            try {
                const response = await axios.get("/api/lawyers");
                setLawyers(response.data);
            } catch (error) {
                console.error("Error fetching lawyers:", error);
            }
        };
        fetchLawyers();

        // Initialize the grid
        const timeSlots = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
            }
        }
        setGrid(timeSlots);
    }, []);

    const toggleSlot = (day, time) => {
        setAvailability((prev) => {
            const updated = [...prev];
            const dayIndex = updated.findIndex((d) => d.day_of_week === day);

            if (dayIndex === -1) {
                updated.push({ day_of_week: day, slots: [{ start_time: time, end_time: time }] });
            } else {
                const slotIndex = updated[dayIndex].slots.findIndex((slot) => slot.start_time === time);
                if (slotIndex === -1) {
                    updated[dayIndex].slots.push({ start_time: time, end_time: time });
                } else {
                    updated[dayIndex].slots.splice(slotIndex, 1);
                    if (updated[dayIndex].slots.length === 0) {
                        updated.splice(dayIndex, 1);
                    }
                }
            }
            logFormattedAvailability(updated);
            return updated;
        });
    };

    const handleMouseDown = (day, time) => {
        setDragging(true);
        setDraggedCells([{ day, time }]);
    };

    const handleMouseEnter = (day, time) => {
        if (dragging) {
            setDraggedCells((prev) => {
                if (!prev.some((cell) => cell.day === day && cell.time === time)) {
                    return [...prev, { day, time }];
                }
                return prev;
            });
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
        draggedCells.forEach(({ day, time }) => toggleSlot(day, time));
        setDraggedCells([]);
    };

    const logFormattedAvailability = (availabilityData) => {
        const formatted = availabilityData.map((day) => {
            const sortedSlots = day.slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
            const mergedSlots = [];

            sortedSlots.forEach((slot) => {
                if (
                    mergedSlots.length > 0 &&
                    mergedSlots[mergedSlots.length - 1].end_time === slot.start_time
                ) {
                    mergedSlots[mergedSlots.length - 1].end_time = slot.end_time;
                } else {
                    mergedSlots.push({ ...slot });
                }
            });

            return {
                day_of_week: day.day_of_week,
                slots: mergedSlots,
            };
        });

        console.log("Formatted Availability:", { availability: formatted });
    };

    const handleSubmit = async () => {
        if (!selectedLawyer) {
            setWarning("Please select a lawyer before submitting.");
            return;
        }

        try {
            const formattedAvailability = availability.map((day) => {
                const sortedSlots = day.slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
                const mergedSlots = [];

                sortedSlots.forEach((slot) => {
                    if (
                        mergedSlots.length > 0 &&
                        mergedSlots[mergedSlots.length - 1].end_time === slot.start_time
                    ) {
                        mergedSlots[mergedSlots.length - 1].end_time = slot.end_time;
                    } else {
                        mergedSlots.push({ ...slot });
                    }
                });

                return {
                    day_of_week: day.day_of_week,
                    slots: mergedSlots,
                };
            });

            const response = await axios.post(
                `/api/lawyers/${selectedLawyer}/availability`,
                { availability: formattedAvailability },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Availability updated successfully!");
        } catch (error) {
            console.error("Error updating availability:", error);
            alert("Failed to update availability. Please try again.");
        }
    };

    return (
        <div
            className="p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-md"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ userSelect: "none" }}
        >
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Lawyer Availability Scheduler</h1>
                <p className="text-gray-600">Easily set and manage lawyer availability.</p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Lawyer</label>
                <select
                    className="w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={selectedLawyer || ""}
                    onChange={(e) => {
                        setSelectedLawyer(e.target.value);
                        setWarning("");
                    }}
                >
                    <option value="" disabled>
                        Choose a lawyer
                    </option>
                    {lawyers.map((lawyer) => (
                        <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.name}
                        </option>
                    ))}
                </select>
            </div>

            {warning && <p className="text-red-500 text-sm mb-4">{warning}</p>}

            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 px-4 py-2 text-left">Time</th>
                            {daysOfWeek.map((day) => (
                                <th key={day} className="border border-gray-200 px-4 py-2 text-center">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((time) => (
                            <tr key={time}>
                                <td
                                    className={`px-2  text-left h-12 ${time.includes("30") ? "border-b border-gray-300" : ""
                                        }`}
                                >
                                    {!time.includes("30") ? time : ""}
                                </td>
                                {daysOfWeek.map((day) => (
                                    <td
                                        key={day}
                                        className={`border border-gray-200 px-4 py-2 text-center cursor-pointer ${availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time)
                                            ? "bg-sky-700 text-white"
                                            : "hover:bg-sky-100"
                                            }`}
                                        onMouseDown={() => handleMouseDown(day, time)}
                                        onMouseEnter={() => handleMouseEnter(day, time)}
                                    >
                                        {availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time) ? "✔" : ""}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 text-center">
                <button
                    className={`px-6 py-2 text-white font-medium rounded-md ${selectedLawyer
                        ? "bg-sky-600 hover:bg-sky-700"
                        : "bg-gray-400 cursor-not-allowed"
                        }`}
                    onClick={handleSubmit}
                    disabled={!selectedLawyer}
                >
                    Save Availability
                </button>
            </div>
        </div>
    );
};

export default AvailabilitySchedulerGrid;
