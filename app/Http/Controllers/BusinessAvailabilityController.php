<?php

namespace App\Http\Controllers;

use App\Models\BusinessAvailability;
use Illuminate\Http\Request;

class BusinessAvailabilityController extends Controller
{
    // Actualizar horarios empresariales
    public function update(Request $request)
    {
        $request->validate([
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $availability = BusinessAvailability::updateOrCreate(
            ['day_of_week' => $request->day_of_week],
            ['start_time' => $request->start_time, 'end_time' => $request->end_time]
        );

        return response()->json($availability);
    }

    // Obtener horarios empresariales
    public function index()
    {
        return response()->json(BusinessAvailability::all());
    }
}
