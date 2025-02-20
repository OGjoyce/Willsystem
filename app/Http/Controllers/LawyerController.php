<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LawFirm; // Importa el modelo
use App\Models\Lawyer;
use App\Models\AvailabilitySlot;
use App\Models\Reservation;
use Spatie\GoogleCalendar\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LawyerController extends Controller
{

    public function index(Request $request)
{
    $query = Lawyer::query();

    if ($request->has('search')) {
        $search = $request->get('search');
        $query->where('first_name', 'LIKE', "%{$search}%")
              ->orWhere('last_name', 'LIKE', "%{$search}%")
              ->orWhere('email', 'LIKE', "%{$search}%");
    }

    if ($request->has('law_firm_id')) {
        $query->where('law_firm_id', $request->get('law_firm_id'));
    }

    $lawyers = $query->paginate(10);

    return response()->json($lawyers);
}

public function show($id)
{
    $lawyer = Lawyer::find($id);

    if (!$lawyer) {
        return response()->json(['message' => 'Lawyer not found'], 404);
    }

    return response()->json($lawyer);
}

public function store(Request $request)
{
    $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'date_of_birth' => 'required|date',
        'email' => 'required|email|unique:lawyers,email',
        'law_firm_id' => 'required|exists:law_firms,id',
    ]);

    $lawyer = Lawyer::create([
        'first_name' => $request->first_name,
        'last_name' => $request->last_name,
        'date_of_birth' => $request->date_of_birth,
        'email' => $request->email,
        'law_firm_id' => $request->law_firm_id,
    ]);

    return response()->json(['message' => 'Lawyer created successfully', 'lawyer' => $lawyer], 201);
}

public function update(Request $request, $id)
{
    $lawyer = Lawyer::find($id);

    if (!$lawyer) {
        return response()->json(['message' => 'Lawyer not found'], 404);
    }

    $request->validate([
        'first_name' => 'sometimes|required|string|max:255',
        'last_name' => 'sometimes|required|string|max:255',
        'date_of_birth' => 'sometimes|required|date',
        'email' => 'sometimes|required|email|unique:lawyers,email,' . $lawyer->id,
        'law_firm_id' => 'sometimes|required|exists:law_firms,id',
    ]);

    $lawyer->update($request->only(['first_name', 'last_name', 'date_of_birth', 'email', 'law_firm_id']));

    return response()->json(['message' => 'Lawyer updated successfully', 'lawyer' => $lawyer]);
}

public function destroy($id)
{
    $lawyer = Lawyer::find($id);

    if (!$lawyer) {
        return response()->json(['message' => 'Lawyer not found'], 404);
    }

    $lawyer->delete();

    return response()->json(['message' => 'Lawyer deleted successfully']);
}



public function setAvailability(Request $request, $lawyerId)
{
    // Validar la solicitud
    $request->validate([
        'availability' => 'required|array',
        'availability.*.day_of_week' => 'required|string',
        'availability.*.slots' => 'required|array',
        'availability.*.slots.*.start_time' => 'required|date_format:H:i',
        'availability.*.slots.*.end_time' => 'required|date_format:H:i|after:availability.*.slots.*.start_time',
    ]);

    try {
        // Eliminar toda la disponibilidad anterior del abogado
        AvailabilitySlot::where('lawyer_id', $lawyerId)->delete();

        // Insertar la nueva disponibilidad
        foreach ($request->availability as $day) {
            foreach ($day['slots'] as $slot) {
                AvailabilitySlot::create([
                    'lawyer_id' => $lawyerId,
                    'day_of_week' => $day['day_of_week'],
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                ]);
            }
        }

        return response()->json(['message' => 'Availability updated successfully'], 200);
    } catch (\Exception $e) {
        \Log::error($e);

        return response()->json([
            'message' => 'An error occurred while updating availability',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function createReservation(Request $request)
{
    try {
        $request->validate([
            'law_firm_id' => 'required|exists:law_firms,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:5|max:60',
            'client_name' => 'required|string',
            'client_email' => 'required|email',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $requestedStartTime = strtotime($request->date . ' ' . $request->start_time);
        $requestedEndTime = $requestedStartTime + ($request->duration * 60);

        // Obtener abogados disponibles
        $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
            ->with(['availabilitySlots' => function ($query) use ($request) {
                $query->where('day_of_week', date('l', strtotime($request->date)));
            }, 'reservations' => function ($query) use ($request) {
                $query->whereDate('start_date', $request->date);
            }])->get();

        foreach ($lawyers as $lawyer) {
            $slots = $lawyer->availabilitySlots->filter(function ($slot) use ($request) {
                return $slot->day_of_week === date('l', strtotime($request->date));
            })->sortBy('start_time');

            $isAvailable = $this->checkConsecutiveSlots($slots, $lawyer->reservations, $requestedStartTime, $requestedEndTime, $request->date);

            if ($isAvailable) {
                // Crear la reserva en la base de datos
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
                    'object_status_id' => 1,
                ]);

                // Crear el evento en Google Calendar
                $event = new Event;
                $event->name = $request->title;
                $event->description = $request->description;
                $startDateTime = Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->start_time, 'America/Toronto')->toIso8601String();
                $endDateTime = Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->start_time, 'America/Toronto')->addMinutes($request->duration)->toIso8601String();




                // Agregar participantes (cliente y abogado)
                $event->addAttendee([
                    'email' => $request->client_email,
                    'name' => $request->client_name,
                    'responseStatus' => 'needsAction',
                ]);

                $event->addAttendee([
                    'email' => $lawyer->email,
                    'name' => $lawyer->first_name . ' ' . $lawyer->last_name,
                    'responseStatus' => 'needsAction',
                ]);

                // Intentar agregar Google Meet
                try {
                    $event->addMeetLink();
                } catch (\Exception $e) {
                    Log::error("Error añadiendo Google Meet Link: " . $e->getMessage());
                }

                $savedEvent = $event->save();

                // Agregar logs para depuración
                Log::info("Evento creado en Google Calendar", [
                    'event_id' => $savedEvent->id ?? 'N/A',
                    'meet_link' => $savedEvent->hangoutLink ?? 'N/A'
                ]);

                // Confirmar si se obtuvo el enlace de Meet
                $meetLink = $savedEvent->hangoutLink ?? null;

                // Actualizar la reserva con el link del evento si existe
                if ($meetLink) {
                    $reservation->update(['link' => $meetLink]);
                }

                return response()->json([
                    'message' => 'Reservation created successfully',
                    'reservation' => $reservation,
                    'google_event' => [
                        'event_id' => $savedEvent->id ?? null,
                        'meet_link' => $meetLink
                    ]
                ], 201);
            }
        }

        return response()->json(['message' => 'No lawyers available for the requested time'], 400);
    } catch (\Exception $e) {
        Log::error('Error creating reservation: ' . $e->getMessage());

        return response()->json([
            'message' => 'An error occurred',
            'error' => $e->getMessage()
        ], 500);
    }
}


private function checkConsecutiveSlots($slots, $reservations, $requestedStartTime, $requestedEndTime, $date)
{
    $currentStartTime = $requestedStartTime;

    while ($currentStartTime < $requestedEndTime) {
        $currentEndTime = $currentStartTime + 300; // 5 minutos

        $isSlotAvailable = $slots->contains(function ($slot) use ($currentStartTime, $currentEndTime, $date) {
            $slotStart = strtotime($date . ' ' . $slot->start_time);
            $slotEnd = strtotime($date . ' ' . $slot->end_time);
            return $slotStart <= $currentStartTime && $slotEnd >= $currentEndTime;
        });

        if (!$isSlotAvailable) {
            return false;
        }

        $isSlotReserved = $reservations->contains(function ($reservation) use ($currentStartTime, $currentEndTime) {
            $reservationStart = strtotime($reservation->start_date);
            $reservationEnd = strtotime($reservation->end_date);
            return ($currentStartTime >= $reservationStart && $currentStartTime < $reservationEnd) ||
                   ($currentEndTime > $reservationStart && $currentEndTime <= $reservationEnd);
        });

        if ($isSlotReserved) {
            return false;
        }

        $currentStartTime += 300; // Incrementar 5 minutos
    }

    return true;
}





public function getAvailability($lawyerId)
{
    // Buscar el abogado
    $lawyer = Lawyer::find($lawyerId);

    if (!$lawyer) {
        return response()->json(['message' => 'Lawyer not found'], 404);
    }

    // Obtener la disponibilidad del abogado
    $availability = AvailabilitySlot::where('lawyer_id', $lawyerId)
        ->orderBy('day_of_week')
        ->orderBy('start_time')
        ->get()
        ->groupBy('day_of_week')
        ->map(function ($slots) {
            return [
                'day_of_week' => $slots->first()->day_of_week,
                'slots' => $slots->map(function ($slot) {
                    return [
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                    ];
                })->values()
            ];
        })
        ->values();

    return response()->json([
        'lawyer_id' => $lawyer->id,
        'lawyer_name' => $lawyer->first_name . ' ' . $lawyer->last_name,
        'availability' => $availability,
    ], 200);
}



public function getAvailableSlots(Request $request)
{
    $request->validate([
        'law_firm_id' => 'required|exists:law_firms,id',
        'date' => 'required|date'
    ]);

    $dayOfWeek = date('l', strtotime($request->date));

    $lawyers = Lawyer::where('law_firm_id', $request->law_firm_id)
        ->with(['availabilitySlots' => function ($query) use ($dayOfWeek) {
            $query->where('day_of_week', $dayOfWeek);
        }, 'reservations' => function ($query) use ($request) {
            $query->whereDate('start_date', $request->date);
        }])->get();

    $availableSlots = [];

    foreach ($lawyers as $lawyer) {
        $slots = $lawyer->availabilitySlots->sortBy('start_time');

        foreach ($slots as $slot) {
            $startTime = strtotime($request->date . ' ' . $slot->start_time);
            $endTime = strtotime($request->date . ' ' . $slot->end_time);

            while ($startTime < $endTime) {
                $slotEndTime = $startTime + 300; // Incremento de 5 minutos (300 segundos)
                $isReserved = false;

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
                    $availableSlots[$lawyer->id][] = [
                        'lawyer_id' => $lawyer->id,
                        'lawyer_name' => $lawyer->first_name . ' ' . $lawyer->last_name,
                        'start_time' => date('H:i', $startTime),
                        'end_time' => date('H:i', $slotEndTime)
                    ];
                }

                $startTime += 300; // Incrementar en 5 minutos
            }
        }
    }

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



}
