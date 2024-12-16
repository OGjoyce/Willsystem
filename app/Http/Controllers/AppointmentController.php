<?php
namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

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
}
