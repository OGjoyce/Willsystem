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
    $request->validate([
        'law_firm_id' => 'required|exists:law_firms,id',
        'date' => 'required|date',
        'start_time' => 'required|date_format:H:i',
        'duration' => 'required|integer|min:1',
        'client_name' => 'required|string',
        'client_email' => 'required|email',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'link' => 'nullable|url',
    ]);

    $requestedStartTime = strtotime($request->date . ' ' . $request->start_time);
    $requestedEndTime = $requestedStartTime + ($request->duration * 60);

    // Obtener abogados disponibles
    $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
        ->whereHas('availabilitySlots', function ($query) use ($request) {
            $query->where('day_of_week', date('l', strtotime($request->date)))
                  ->where('start_time', '<=', $request->start_time)
                  ->where('end_time', '>', date('H:i', strtotime($request->start_time) + ($request->duration * 60)));
        })->with(['reservations' => function ($query) use ($request) {
            $query->whereDate('start_date', $request->date);
        }])->get();

    $availableLawyer = null;

    // Verificar disponibilidad de cada abogado
    foreach ($lawyers as $lawyer) {
        $isAvailable = true;

        foreach ($lawyer->reservations as $reservation) {
            $reservationStart = strtotime($reservation->start_date);
            $reservationEnd = strtotime($reservation->end_date);

            if (($requestedStartTime >= $reservationStart && $requestedStartTime < $reservationEnd) ||
                ($requestedEndTime > $reservationStart && $requestedEndTime <= $reservationEnd)) {
                $isAvailable = false;
                break;
            }
        }

        if ($isAvailable) {
            $availableLawyer = $lawyer;
            break;
        }
    }

    if (!$availableLawyer) {
        return response()->json(['message' => 'No lawyers available for the requested time'], 400);
    }

    // Crear la reserva
    $reservation = Reservation::create([
        'lawyer_id' => $availableLawyer->id,
        'lawyer_email' => $availableLawyer->email,
        'client_name' => $request->client_name,
        'client_email' => $request->client_email,
        'title' => $request->title,
        'description' => $request->description,
        'start_date' => date('Y-m-d H:i:s', $requestedStartTime),
        'end_date' => date('Y-m-d H:i:s', $requestedEndTime),
        'duration' => $request->duration,
        'link' => $request->link,
        'object_status_id' => 1, // Siempre 1 durante pruebas
    ]);

    return response()->json([
        'message' => 'Reservation created successfully',
        'reservation' => $reservation
    ]);
}


public function getAvailableSlots(Request $request)
{
    $request->validate([
        'law_firm_id' => 'required|exists:law_firms,id',
        'date' => 'required|date'
    ]);

    $dayOfWeek = date('l', strtotime($request->date));

    // Obtener abogados con disponibilidad
    $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
        ->with(['availabilitySlots' => function ($query) use ($dayOfWeek) {
            $query->where('day_of_week', $dayOfWeek);
        }, 'reservations' => function ($query) use ($request) {
            $query->whereDate('start_date', $request->date);
        }])->get();

    $availableSlots = [];

    foreach ($lawyers as $lawyer) {
        foreach ($lawyer->availabilitySlots as $slot) {
            $startTime = strtotime($request->date . ' ' . $slot->start_time);
            $endTime = strtotime($request->date . ' ' . $slot->end_time);

            while ($startTime < $endTime) {
                $isReserved = false;
                $slotEndTime = $startTime + 3600; // 1 hora de duración

                foreach ($lawyer->reservations as $reservation) {
                    $reservationStart = strtotime($reservation->start_date);
                    $reservationEnd = strtotime($reservation->end_date);

                    if (($startTime >= $reservationStart && $startTime < $reservationEnd) ||
                        ($slotEndTime > $reservationStart && $slotEndTime <= $reservationEnd)) {
                        $isReserved = true;
                        break;
                    }
                }

                if (!$isReserved) {
                    $availableSlots[] = [
                        'lawyer_id' => $lawyer->id,
                        'lawyer_name' => $lawyer->name,
                        'start_time' => date('H:i', $startTime),
                        'end_time' => date('H:i', $slotEndTime)
                    ];
                }

                $startTime += 3600; // Incrementar en 1 hora
            }
        }
    }

    return response()->json($availableSlots);
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
