<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Appointment;

class AppointmentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'time' => 'required',
            'duration' => 'required|integer',
        ]);

        // Validar conflictos de horario
        $conflicts = Appointment::where('user_id', $request->user_id)
            ->where('date', $request->date)
            ->where('time', '<=', $request->time)
            ->whereRaw("ADDTIME(time, SEC_TO_TIME(duration * 60)) > ?", [$request->time])
            ->exists();

        if ($conflicts) {
            return response()->json(['message' => 'Time slot not available'], 409);
        }

        $appointment = Appointment::create($validated);
        return response()->json($appointment, 201);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $appointments = Appointment::where('user_id', $request->user_id)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->get();

        return response()->json($appointments);
    }
}
