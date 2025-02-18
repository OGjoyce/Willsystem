<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\GoogleCalendar\Event;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class GoogleCalendarController extends Controller
{
    /**
     * Crear un nuevo evento en Google Calendar
     */
    public function createEvent()
    {
        try {
            // Crear un evento
            $event = new Event;
            $event->name = 'Prueba de Evento desde Laravel';
            $event->description = 'Este evento se creó desde una app Laravel con Google Calendar API.';
            $event->startDateTime = Carbon::now()->addMinutes(5); // 5 minutos después de ahora
            $event->endDateTime = Carbon::now()->addHour(); // Durará 1 hora
            $event->addMeetLink(); // Agregar Google Meet
            $event->save();

            Log::info('Evento creado con éxito', ['event_id' => $event->id]);

            return response()->json([
                'message' => 'Evento creado exitosamente',
                'event_id' => $event->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error creando evento:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Ocurrió un error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los eventos futuros
     */
    public function getEvents()
    {
        try {
            $events = Event::get();

            return response()->json([
                'message' => 'Eventos obtenidos exitosamente',
                'events' => $events
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo eventos:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Ocurrió un error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un evento por ID
     */
    public function deleteEvent($eventId)
    {
        try {
            $event = Event::find($eventId);

            if (!$event) {
                return response()->json(['error' => 'Evento no encontrado'], 404);
            }

            $event->delete();

            return response()->json([
                'message' => 'Evento eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error eliminando evento:', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => 'Ocurrió un error: ' . $e->getMessage()
            ], 500);
        }
    }
}
