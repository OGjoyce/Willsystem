import React from "react";
import ReservationScheduler from "./ReservationScheduler";
import AvailabilityScheduler from "./AvailabilityScheduler";
import AvailabilitySchedulerGrid from "./AvailabilitySchedulerGrid";

export function SchedulerMatrix() {
    return (
        <div className="bg-gray-100 min-h-screen flex flex-col gap-96">
            <ReservationScheduler />
            <AvailabilityScheduler />
            <AvailabilitySchedulerGrid />
        </div>
    );
}
