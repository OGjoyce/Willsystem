import React, { useState, useEffect } from "react";
import axios from "axios";

const AvailabilityScheduler = () => {
    const [lawyers, setLawyers] = useState([]);
    const [selectedLawyer, setSelectedLawyer] = useState(null);
    const [availability, setAvailability] = useState([]);
    const [warning, setWarning] = useState("");

    // Días de la semana
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        // Fetch the list of lawyers
        const fetchLawyers = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/api/lawyers");
                setLawyers(response.data);
            } catch (error) {
                console.error("Error fetching lawyers:", error);
            }
        };
        fetchLawyers();
    }, []);

    const handleAddSlot = (day) => {
        setAvailability((prev) => {
            const updated = [...prev];
            const dayIndex = updated.findIndex((d) => d.day_of_week === day);

            if (dayIndex === -1) {
                // Si el día aún no tiene slots
                updated.push({ day_of_week: day, slots: [{ start_time: "", end_time: "" }] });
            } else {
                // Agregar un slot vacío a un día existente
                updated[dayIndex].slots.push({ start_time: "", end_time: "" });
            }
            return updated;
        });
    };

    const handleSlotChange = (day, slotIndex, field, value) => {
        setAvailability((prev) => {
            const updated = [...prev];
            const dayIndex = updated.findIndex((d) => d.day_of_week === day);

            if (dayIndex !== -1) {
                updated[dayIndex].slots[slotIndex][field] = value;
            }
            return updated;
        });
    };

    const handleRemoveSlot = (day, slotIndex) => {
        setAvailability((prev) => {
            const updated = [...prev];
            const dayIndex = updated.findIndex((d) => d.day_of_week === day);

            if (dayIndex !== -1) {
                updated[dayIndex].slots.splice(slotIndex, 1);
                if (updated[dayIndex].slots.length === 0) {
                    updated.splice(dayIndex, 1);
                }
            }
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!selectedLawyer) {
            setWarning("Please select a lawyer before submitting.");
            return;
        }

        try {
            const response = await axios.post(
                `http://127.0.0.1:8000/api/lawyers/${selectedLawyer}/availability`,
                { availability },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Availability updated successfully!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error updating availability:", error.response?.data || error.message);
            alert("Failed to update availability. Please try again.");
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
            <div className="text-center mb-4">
                <h3 className="text-lg font-bold">Set Lawyer Availability</h3>
                <p className="text-gray-500 text-sm">Select a lawyer and configure their availability</p>
            </div>

            {/* Select Lawyer */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Lawyer:</label>
                <select
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
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

            {/* Availability Configuration */}
            {daysOfWeek.map((day) => (
                <div key={day} className="mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{day}</span>
                        <button
                            className="text-pink-500 text-sm"
                            onClick={() => handleAddSlot(day)}
                        >
                            + Add Slot
                        </button>
                    </div>

                    {availability.find((d) => d.day_of_week === day)?.slots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-2 mt-2">
                            <input
                                type="time"
                                className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                value={slot.start_time}
                                onChange={(e) =>
                                    handleSlotChange(day, index, "start_time", e.target.value)
                                }
                            />
                            <input
                                type="time"
                                className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                value={slot.end_time}
                                onChange={(e) =>
                                    handleSlotChange(day, index, "end_time", e.target.value)
                                }
                            />
                            <button
                                className="text-red-500 text-sm"
                                onClick={() => handleRemoveSlot(day, index)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            ))}

            {/* Warning */}
            {warning && <div className="text-red-500 text-sm text-center mb-4">{warning}</div>}

            {/* Submit Button */}
            <div className="text-center">
                <button
                    className={`w-full px-4 py-2 rounded-md ${selectedLawyer
                        ? "bg-pink-600 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
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

export default AvailabilityScheduler;
