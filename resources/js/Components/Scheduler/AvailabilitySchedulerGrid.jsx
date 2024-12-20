import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

const AvailabilitySchedulerGrid = ({ lawyer, setShowScheduler }) => {
    const [availability, setAvailability] = useState([]);
    const [grid, setGrid] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [draggedCells, setDraggedCells] = useState([]);
    const [removingCells, setRemovingCells] = useState([]);
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

    const generateHalfHourSlots = (start, end, breakStart, breakEnd) => {
        const slots = [];
        let [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        const [breakStartHour, breakStartMinute] = breakStart.split(":").map(Number);
        const [breakEndHour, breakEndMinute] = breakEnd.split(":").map(Number);

        while (
            startHour < endHour ||
            (startHour === endHour && startMinute < endMinute)
        ) {
            const nextMinute = startMinute + 30;
            const nextHour = startHour + Math.floor(nextMinute / 60);

            const slotStart = `${startHour.toString().padStart(2, "0")}:${startMinute
                .toString()
                .padStart(2, "0")}`;
            const slotEnd = `${(nextHour % 24).toString().padStart(2, "0")}:${(nextMinute % 60)
                .toString()
                .padStart(2, "0")}`;

            // Excluir el horario de almuerzo
            if (
                !(startHour >= breakStartHour && startHour < breakEndHour) ||
                (startHour === breakStartHour && startMinute < breakStartMinute)
            ) {
                slots.push({
                    start_time: slotStart,
                    end_time: slotEnd,
                });
            }

            startMinute = nextMinute % 60;
            startHour = nextHour % 24;
        }

        return slots;
    };

    const handleLoadDefaultSchedule = () => {
        const workDays = ["Mon", "Tue", "Wed", "Thu", "Fri"]; // Días laborales por defecto
        const includeSaturday = false; // Cambiar a true si se desea incluir el sábado

        if (includeSaturday) {
            workDays.push("Sat");
        }

        const defaultSlots = generateHalfHourSlots("08:00", "16:00", "12:00", "13:00");
        const defaultSchedule = workDays.map((day) => ({
            day_of_week: day,
            slots: [...defaultSlots],
        }));

        setAvailability(defaultSchedule);
    };





    const toggleSlot = (day, time) => {
        setAvailability((prev) => {
            const updated = [...prev];
            const dayIndex = updated.findIndex((d) => d.day_of_week === day);

            if (dayIndex === -1) {
                updated.push({ day_of_week: day, slots: [{ start_time: time, end_time: addThirtyMinutes(time) }] });
            } else {
                const slotIndex = updated[dayIndex].slots.findIndex((slot) => slot.start_time === time);
                if (slotIndex === -1) {
                    updated[dayIndex].slots.push({ start_time: time, end_time: addThirtyMinutes(time) });
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

    const addThirtyMinutes = (time) => {
        let [hour, minute] = time.split(":").map(Number);
        minute += 30;
        if (minute >= 60) {
            minute -= 60;
            hour += 1;
        }
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    };


    const handleMouseDown = (day, time) => {
        const isSelected = availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time);
        setDragging(true);
        setRemovingCells(isSelected ? [{ day, time }] : []);
        setDraggedCells([{ day, time }]);
    };

    const handleMouseEnter = (day, time) => {
        if (dragging) {
            const isSelected = availability.find((d) => d.day_of_week === day)?.slots.some((slot) => slot.start_time === time);

            setDraggedCells((prev) => {
                if (!prev.some((cell) => cell.day === day && cell.time === time)) {
                    return [...prev, { day, time }];
                }
                return prev;
            });

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
            const sortedSlots = day.slots.sort((a, b) => a.start_time.localeCompare(b.start_time));
            const mergedSlots = sortedSlots.reduce((acc, curr) => {
                if (acc.length === 0) {
                    acc.push(curr);
                } else {
                    const lastSlot = acc[acc.length - 1];
                    if (lastSlot.end_time === curr.start_time) {
                        lastSlot.end_time = curr.end_time;
                    } else {
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


    const renderSlotText = (day, time) => {
        const dayAvailability = availability.find((d) => d.day_of_week === day);
        if (!dayAvailability) return "";

        // Ordenar los slots por hora de inicio
        const slots = dayAvailability.slots.sort((a, b) =>
            a.start_time.localeCompare(b.start_time)
        );

        // Buscar el índice del bloque actual
        const currentSlotIndex = slots.findIndex((slot) => slot.start_time === time);
        if (currentSlotIndex === -1) return ""; // No hay un slot seleccionado en este bloque

        // Definir el inicio y el final del rango consecutivo
        let rangeStart = slots[currentSlotIndex].start_time;
        let rangeEnd = slots[currentSlotIndex].end_time;

        // Buscar hacia adelante para determinar el rango consecutivo
        for (let i = currentSlotIndex + 1; i < slots.length; i++) {
            if (slots[i].start_time === rangeEnd) {
                rangeEnd = slots[i].end_time;
            } else {
                break; // No es consecutivo, termina
            }
        }

        // Verificar si es el inicio de un rango
        const isFirstInRange =
            currentSlotIndex === 0 || slots[currentSlotIndex - 1].end_time !== rangeStart;

        if (isFirstInRange) {
            return `${rangeStart} - ${rangeEnd}`;
        }

        return ""; // Si no es el primer bloque del rango, no mostrar texto
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
                    onClick={handleLoadDefaultSchedule}
                >
                    <i className="bi bi-calendar3"></i> Load Default Schedule
                </Button>
                <Button
                    variant="outline-success"
                    className="px-4"
                    onClick={handleSubmit}
                    disabled={!lawyer}
                >
                    <i className="bi bi-floppy"></i> Save Availability
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

                                    const slotText = renderSlotText(day, time);

                                    return (
                                        <td
                                            key={day}
                                            className={`text-center cursor-pointer ${isRemoving
                                                ? "bg-red-500 text-white"
                                                : isSelected
                                                    ? "border-l bg-sky-700 text-white"
                                                    : isDragged
                                                        ? "bg-sky-200 border-slate-950"
                                                        : "hover:bg-sky-100 border"
                                                }`}
                                            onMouseDown={() => handleMouseDown(day, time)}
                                            onMouseEnter={() => handleMouseEnter(day, time)}
                                        >
                                            {slotText}
                                        </td>
                                    );
                                })}






                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AvailabilitySchedulerGrid;
