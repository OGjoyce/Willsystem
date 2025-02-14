<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\GoogleCalendar\Event;
use Carbon\Carbon;

class GoogleCalendarController extends Controller
{
    public function createMeeting(Request $request)
{
    $validator = \Validator::make($request->all(), [
        'client_email' => 'required|email',
        'title' => 'required|string',
        'description' => 'nullable|string',
        'start_date' => 'required|date_format:Y-m-d\TH:i:s',
        'end_date' => 'required|date_format:Y-m-d\TH:i:s|after:start_date',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation Error',
            'errors' => $validator->errors(),
        ], 422);
    }

    try {
        // Crear el evento en Google Calendar
        $event = new Event;
        $event->name = $request->title;
        $event->description = $request->description;
        $event->startDateTime = Carbon::parse($request->start_date);
        $event->endDateTime = Carbon::parse($request->end_date);
        $event->addAttendee(['email' => $request->client_email]);

        // Habilitar Google Meet
        $event->conferenceData = [
            'createRequest' => [
                'requestId' => uniqid(),
                'conferenceSolutionKey' => ['type' => 'hangoutsMeet'],
            ],
        ];

        $event = $event->save();

        return response()->json([
            'meet_link' => $event->hangoutLink,
            'event_id' => $event->id,
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error creating meeting',
            'error' => $e->getMessage(),
        ], 500);
    }
}

    public function updateMeeting(Request $request)
    {
        $request->validate([
            'event_id' => 'required|string',
            'lawyer_email' => 'required|email',
        ]);

        try {
            $event = Event::find($request->event_id);

            if (!$event) {
                return response()->json(['message' => 'Event not found'], 404);
            }

            $event->addAttendee(['email' => $request->lawyer_email]);
            $event->save();

            return response()->json(['message' => 'Meeting updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating meeting', 'error' => $e->getMessage()], 500);
        }
    }
}
