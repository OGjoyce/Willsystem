import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

const AvailabilitySchedulerGrid = ({ lawyer, setShowScheduler }) => {
    const [availability, setAvailability] = useState([]);
    const [grid, setGrid] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [draggedCells, setDraggedCells] = useState([]);
    const [removingCells, setRemovingCells] = useState([]); // Lista de celdas que se eliminarán
    const [warning, setWarning] = useState("");

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        const initializeGrid = () => {
            const timeSlots = [];
            for (let hour = 8; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
                }
            }
            setGrid(timeSlots);
        };

        setAvailability([
            { day_of_week: "Mon", slots: [{ start_time: "08:00", end_time: "09:00" }] },
            { day_of_week: "Wed", slots: [{ start_time: "10:00", end_time: "11:30" }] },
        ]);

        initializeGrid();
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
            return updated;
        });
    };

    const handleMouseDown = (day, time) => {
        const isSelected = availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time);
        setDragging(true);
        setRemovingCells(isSelected ? [{ day, time }] : []); // Marca la celda como eliminada si está seleccionada
        setDraggedCells([{ day, time }]);
    };

    const handleMouseEnter = (day, time) => {
        if (dragging) {
            const isSelected = availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time);

            // Actualiza las celdas arrastradas
            setDraggedCells((prev) => {
                if (!prev.some((cell) => cell.day === day && cell.time === time)) {
                    return [...prev, { day, time }];
                }
                return prev;
            });

            // Actualiza las celdas que se eliminarán
            setRemovingCells((prev) => {
                if (isSelected && !prev.some((cell) => cell.day === day && cell.time === time)) {
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
        setRemovingCells([]);
    };

    const handleSubmit = () => {
        if (!lawyer) {
            setWarning("Please select a lawyer before submitting.");
            return;
        }

        const formattedAvailability = availability.map((day) => {
            // Ordena los bloques por tiempo de inicio
            const sortedSlots = day.slots
                .map((slot) => {
                    const startTime = slot.start_time;
                    const [hours, minutes] = startTime.split(":").map(Number);
                    const endTime = new Date(0, 0, 0, hours, minutes + 30) // Media hora después
                        .toTimeString()
                        .slice(0, 5); // Formato HH:mm
                    return {
                        start_time: startTime,
                        end_time: endTime,
                    };
                })
                .sort((a, b) => a.start_time.localeCompare(b.start_time)); // Asegura orden por start_time

            // Realiza el merge de slots consecutivos
            const mergedSlots = sortedSlots.reduce((acc, curr) => {
                if (acc.length === 0) {
                    // Si no hay grupos, agrega el primer bloque
                    acc.push(curr);
                } else {
                    const lastSlot = acc[acc.length - 1];
                    // Verifica si es consecutivo
                    if (lastSlot.end_time === curr.start_time) {
                        // Extiende el último slot
                        lastSlot.end_time = curr.end_time;
                    } else {
                        // Crea un nuevo slot
                        acc.push(curr);
                    }
                }
                return acc;
            }, []);

            return {
                day_of_week: day.day_of_week,
                slots: mergedSlots,
            };
        });

        console.log(JSON.stringify({ availability: formattedAvailability }, null, 2));
        alert("Availability merged and updated successfully!");
    };




    return (
        <div
            className="p-4 max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ userSelect: "none" }}
        >
            <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                    Editing Weekly Schedule for {lawyer?.name || "Unknown Lawyer"}
                </h1>
                <p className="text-sm text-gray-600">Set and manage availability easily.</p>
            </div>

            {warning && <div className="alert alert-warning">{warning}</div>}


            {/* Contenedor de botones alineados a la izquierda */}
            <div className="d-flex justify-content-start gap-2 mb-4">
                <Button
                    variant="outline-dark"
                    className="px-4"
                    onClick={() => setShowScheduler(false)}
                    disabled={!lawyer}
                >
                    <i className="bi bi-arrow-left"></i> Go Back
                </Button>
                <Button
                    variant="outline-primary"
                    className="px-4"

                >
                    <i class="bi bi-calendar3"></i> Load Default Schedule
                </Button>
                <Button
                    variant="outline-success"
                    className="px-4"
                    onClick={handleSubmit}
                    disabled={!lawyer}
                >
                    <i class="bi bi-floppy"></i> Save Availability
                </Button>
            </div>


            <div className="overflow-x-auto relative">
                <table className="w-full table-auto border-collapse border border-gray-200 text-sm">
                    <thead>
                        <tr>
                            <th className="sticky top-0 bg-gray-100 border border-gray-200 px-2 py-1">Time</th>
                            {daysOfWeek.map((day) => (
                                <th key={day} className="sticky top-0 bg-gray-100 border border-gray-200 px-2 py-1 text-center">
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {grid.map((time) => (
                            <tr key={time}>
                                <td
                                    className={`px-2 text-left h-6 ${time.includes("30") ? "border-b border-gray-300" : ""}`}
                                >
                                    {!time.includes("30") ? time : ""}
                                </td>
                                {daysOfWeek.map((day) => {
                                    const isSelected = availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time);
                                    const isDragged = draggedCells.some((cell) => cell.day === day && cell.time === time);
                                    const isRemoving = removingCells.some((cell) => cell.day === day && cell.time === time);

                                    return (
                                        <td
                                            key={day}
                                            className={` text-center cursor-pointer ${isRemoving
                                                ? "bg-red-500 text-white" // Eliminando
                                                : isSelected
                                                    ? "border-l bg-sky-700 text-white" // Seleccionado
                                                    : isDragged
                                                        ? "bg-sky-200 border-slate-950" // Arrastrando para agregar
                                                        : "hover:bg-sky-100 border"
                                                }`}
                                            onMouseDown={() => handleMouseDown(day, time)}
                                            onMouseEnter={() => handleMouseEnter(day, time)}
                                        >
                                            {isSelected ? "" : ""}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};

export default AvailabilitySchedulerGrid;
