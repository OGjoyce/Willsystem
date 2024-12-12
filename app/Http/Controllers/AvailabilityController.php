<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Availability;

class AvailabilityController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'day_of_week' => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
        ]);

        $availability = Availability::create($validated);
        return response()->json($availability, 201);
    }

    public function show(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
        ]);

        $dayOfWeek = date('l', strtotime($request->date));

        $availability = Availability::where('user_id', $request->user_id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$availability) {
            return response()->json(['available_slots' => []]);
        }

        return response()->json([
            'day_of_week' => $dayOfWeek,
            'start_time' => $availability->start_time,
            'end_time' => $availability->end_time,
        ]);
    }
}
