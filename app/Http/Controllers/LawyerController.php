<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LawFirm; // Importa el modelo
use App\Models\Lawyer;
use App\Models\AvailabilitySlot;
use App\Models\Reservation;


class LawyerController extends Controller
{
    public function setAvailability(Request $request, $lawyerId)
{
    $request->validate([
        'availability' => 'required|array',
        'availability.*.day_of_week' => 'required|string',
        'availability.*.slots' => 'required|array',
        'availability.*.slots.*.start_time' => 'required|date_format:H:i',
        'availability.*.slots.*.end_time' => 'required|date_format:H:i|after:availability.*.slots.*.start_time',
    ]);

    foreach ($request->availability as $day) {
        foreach ($day['slots'] as $slot) {
            AvailabilitySlot::updateOrCreate(
                [
                    'lawyer_id' => $lawyerId,
                    'day_of_week' => $day['day_of_week'],
                    'start_time' => $slot['start_time']
                ],
                ['end_time' => $slot['end_time']]
            );
        }
    }

    return response()->json(['message' => 'Availability updated successfully']);
}

public function createReservation(Request $request)
{
    try {
        $request->validate([
            'law_firm_id' => 'required|exists:law_firms,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:60',
            'client_name' => 'required|string',
            'client_email' => 'required|email',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'link' => 'nullable|url',
        ]);

        $requestedStartTime = strtotime($request->date . ' ' . $request->start_time);
        $requestedEndTime = $requestedStartTime + ($request->duration * 60);

        // Buscar abogados disponibles
        $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
            ->whereHas('availabilitySlots', function ($query) use ($request, $requestedEndTime) {
                $query->where('day_of_week', date('l', strtotime($request->date)))
                    ->where('start_time', '<=', $request->start_time)
                    ->where('end_time', '>=', date('H:i', $requestedEndTime));
            })->get();

        foreach ($lawyers as $lawyer) {
            $isAvailable = !$lawyer->reservations()->whereDate('start_date', $request->date)
                ->where(function ($query) use ($requestedStartTime, $requestedEndTime) {
                    $query->whereBetween('start_date', [
                        date('Y-m-d H:i:s', $requestedStartTime),
                        date('Y-m-d H:i:s', $requestedEndTime)
                    ])->orWhereBetween('end_date', [
                        date('Y-m-d H:i:s', $requestedStartTime),
                        date('Y-m-d H:i:s', $requestedEndTime)
                    ]);
                })->exists();

            if ($isAvailable) {
                $reservation = Reservation::create([
                    'lawyer_id' => $lawyer->id,
                    'lawyer_email' => $lawyer->email,
                    'client_name' => $request->client_name,
                    'client_email' => $request->client_email,
                    'title' => $request->title,
                    'description' => $request->description,
                    'start_date' => date('Y-m-d H:i:s', $requestedStartTime),
                    'end_date' => date('Y-m-d H:i:s', $requestedEndTime),
                    'duration' => $request->duration,
                    'link' => $request->link,
                    'object_status_id' => 1,
                ]);

                return response()->json([
                    'message' => 'Reservation created successfully',
                    'reservation' => $reservation
                ], 201);
            }
        }

        return response()->json(['message' => 'No lawyers available for the requested time'], 400);
    } catch (\Exception $e) {
        // Loguear el error
        \Log::error($e);

        // Devolver una respuesta JSON con el error
        return response()->json([
            'message' => 'An error occurred',
            'error' => $e->getMessage()
        ], 500);
    }
}





public function getAvailableSlots(Request $request)
{
    $request->validate([
        'law_firm_id' => 'required|exists:law_firms,id',
        'date' => 'required|date'
    ]);

    $dayOfWeek = date('l', strtotime($request->date));

    // Obtener abogados con disponibilidad para el día especificado
    $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
        ->with(['availabilitySlots' => function ($query) use ($dayOfWeek) {
            $query->where('day_of_week', $dayOfWeek);
        }, 'reservations' => function ($query) use ($request) {
            $query->whereDate('start_date', $request->date);
        }])->get();

    $availableSlots = [];

    foreach ($lawyers as $lawyer) {
        // Obtener disponibilidad ordenada del abogado
        $slots = $lawyer->availabilitySlots->sortBy('start_time');

        foreach ($slots as $slot) {
            $startTime = strtotime($request->date . ' ' . $slot->start_time);
            $endTime = strtotime($request->date . ' ' . $slot->end_time);

            while ($startTime < $endTime) {
                $isReserved = false;
                $slotEndTime = $startTime + 900; // Incremento de 15 minutos

                // Verificar si el bloque está reservado
                foreach ($lawyer->reservations as $reservation) {
                    $reservationStart = strtotime($reservation->start_date);
                    $reservationEnd = strtotime($reservation->end_date);

                    if (($startTime >= $reservationStart && $startTime < $reservationEnd) ||
                        ($slotEndTime > $reservationStart && $slotEndTime <= $reservationEnd)) {
                        $isReserved = true;
                        break;
                    }
                }

                // Agregar slot si no está reservado
                if (!$isReserved) {
                    $availableSlots[$lawyer->id][] = [
                        'lawyer_id' => $lawyer->id,
                        'lawyer_name' => $lawyer->name,
                        'start_time' => date('H:i', $startTime),
                        'end_time' => date('H:i', $slotEndTime)
                    ];
                }

                $startTime += 900; // Incrementar en 15 minutos
            }
        }
    }

    // Flatten de los resultados finales agrupados por lawyer
    $flattenedSlots = [];
    foreach ($availableSlots as $lawyerSlots) {
        foreach ($lawyerSlots as $slot) {
            $flattenedSlots[] = $slot;
        }
    }

    return response()->json($flattenedSlots);
}


public function getReservations(Request $request)
{
    $request->validate([
        'law_firm_id' => 'required|exists:law_firms,id',
        'date' => 'required|date'
    ]);

    $reservations = Reservation::whereHas('lawyer', function ($query) use ($request) {
        $query->where('law_firm_id', $request->law_firm_id);
    })->whereDate('start_date', $request->date)->get();

    return response()->json($reservations);
}


public function createLawFirm(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255|unique:law_firms,name',
    ]);

    $lawFirm = LawFirm::create([
        'name' => $request->name
    ]);

    return response()->json(['message' => 'Law firm created successfully', 'law_firm' => $lawFirm], 201);
}


public function createLawyer(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:lawyers,email',
        'law_firm_id' => 'required|exists:law_firms,id'
    ]);

    $lawyer = Lawyer::create([
        'name' => $request->name,
        'email' => $request->email,
        'law_firm_id' => $request->law_firm_id
    ]);

    return response()->json(['message' => 'Lawyer created successfully', 'lawyer' => $lawyer], 201);
}

}
