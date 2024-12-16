<?php
namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Models\BusinessAvailability;


class AppointmentController extends Controller
{
    // Crear una cita
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',                     // Email del cliente
            'title' => 'required|string|max:255',           // Título
            'description' => 'nullable|string',             // Descripción
            'date' => 'required|date',                      // Fecha
            'time' => 'required|date_format:H:i',           // Hora de inicio
            'duration' => 'required|integer|min:1',         // Duración en minutos
        ]);

        $appointment = Appointment::create($request->all());
        return response()->json($appointment, 201);
    }

    // Obtener todas las citas para una fecha específica
    public function index(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $appointments = Appointment::where('date', $request->date)->get();
        return response()->json($appointments);
    }

    public function getAvailableSlots(Request $request)
{
    // Validar que la fecha es requerida
    $request->validate([
        'date' => 'required|date',
    ]);

    $date = $request->date;
    $dayOfWeek = date('l', strtotime($date)); // Convertir la fecha a nombre del día (ej: Monday)

    // 1. Obtener los horarios empresariales para ese día
    $businessAvailability = BusinessAvailability::where('day_of_week', $dayOfWeek)->first();

    if (!$businessAvailability) {
        return response()->json(['error' => 'No business hours set for this day.'], 404);
    }

    // 2. Generar todas las franjas horarias disponibles (en intervalos de 1 hora)
    $startTime = strtotime($businessAvailability->start_time);
    $endTime = strtotime($businessAvailability->end_time);
    $allSlots = [];
    while ($startTime < $endTime) {
        $allSlots[] = date('H:i', $startTime);
        $startTime += 3600; // Incremento de 1 hora
    }

    // 3. Obtener las citas ocupadas para esa fecha
    $appointments = Appointment::where('date', $date)->get();

    $occupiedSlots = [];
    foreach ($appointments as $appointment) {
        $occupiedStart = strtotime($appointment->time);
        $occupiedEnd = $occupiedStart + ($appointment->duration * 60);

        // Marcar cada hora ocupada dentro de la duración
        while ($occupiedStart < $occupiedEnd) {
            $occupiedSlots[] = date('H:i', $occupiedStart);
            $occupiedStart += 3600; // Incremento de 1 hora
        }
    }

    // 4. Calcular las franjas libres
    $availableSlots = array_diff($allSlots, $occupiedSlots);

    // 5. Devolver la respuesta
    return response()->json([
        'date' => $date,
        'available_slots' => array_values($availableSlots),
        'occupied_slots' => array_values($occupiedSlots),
    ]);
}

public function getAllAppointments()
{
    // Obtener todas las citas
    $appointments = Appointment::all();

    // Formatear la respuesta para cumplir con tu estructura específica
    $formattedAppointments = $appointments->map(function ($appointment) {
        return [
            'date' => $appointment->date,
            'time' => $appointment->time,
            'duration' => $appointment->duration . ":00", // Formato de duración (ej: 60:00)
            'Title' => $appointment->title,
            'Description' => $appointment->description,
            'owner' => $appointment->email, // Usar el email como propietario
        ];
    });

    return response()->json($formattedAppointments);
}

public function getAppointmentsByEmail(Request $request)
{
    // Validar que el email es requerido y tiene formato correcto
    $request->validate([
        'email' => 'required|email',
    ]);

    // Obtener todas las citas para el email especificado
    $appointments = Appointment::where('email', $request->email)->get();

    // Formatear las citas en el formato requerido
    $formattedAppointments = $appointments->map(function ($appointment) {
        return [
            'date' => $appointment->date,
            'time' => $appointment->time,
            'duration' => $appointment->duration . ":00",
            'Title' => $appointment->title,
            'Description' => $appointment->description,
            'owner' => $appointment->email,
        ];
    });

    return response()->json($formattedAppointments);
}


}
