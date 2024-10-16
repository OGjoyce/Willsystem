<?php

namespace App\Http\Controllers;

use App\Models\ObjStatus;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ObjStatusController extends Controller
{
    // Método para obtener todos los registros
    public function index()
    {
        return ObjStatus::all();
    }

    // Método para obtener los 256 más recientes
    public function getRecentStatuses()
    {
        try {
            $statuses = ObjStatus::orderBy('created_at', 'desc')
                                 ->take(256)
                                 ->get();
            return response()->json($statuses, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener los object statuses recientes.'], 500);
        }
    }

    // Método para obtener por rango de fechas
    public function getStatusesByDateRange(Request $request)
    {
        $request->validate([
            'from_date' => 'required|date_format:Y-m-d H:i:s',
            'to_date' => 'required|date_format:Y-m-d H:i:s|after_or_equal:from_date',
        ]);

        try {
            $fromDate = $request->input('from_date');
            $toDate = $request->input('to_date');

            $statuses = ObjStatus::whereBetween('created_at', [$fromDate, $toDate])
                                 ->orderBy('created_at', 'desc')
                                 ->get();

            return response()->json($statuses, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al obtener los object statuses por rango de fechas.'], 500);
        }
    }

    public function store(Request $request)
    {
        // \Log::info('THIS IS THE REQUEST ' . $request);

        $validatedData = $request->validate([
            'information' => 'required|string',
            'related_id' => 'required|integer',
        ]);

        // Decode the JSON string
        $information = json_decode($validatedData['information'], true);
        if (is_array($information) && isset($information['data'])) {
            $information = $information['data'];
        }

        $objStatus = ObjStatus::create([
            'information' => $information,
            'related_id' => $validatedData['related_id'],
        ]);

        return response()->json($objStatus, 201);
    }

    public function show(ObjStatus $objStatus)
    {
        return $objStatus;
    }

    public function update(Request $request, ObjStatus $objStatus)
    {
        $validatedData = $request->validate([
            'information' => 'required|string',
            'related_id' => 'required|integer',
        ]);

        $information = json_decode($validatedData['information'], true);
        if (is_array($information) && isset($information['data'])) {
            $information = $information['data'];
        }

        $objStatus->update([
            'information' => $information,
            'related_id' => $validatedData['related_id'],
        ]);

        return response()->json($objStatus);
    }

    // Método corregido para obtener toda la información
    public function getAllInformation(): JsonResponse
    {
        // Obtén todos los registros de la tabla `obj_statuses`
        $information = ObjStatus::all();

        // Retorna los registros como una respuesta JSON
        return response()->json($information, 200);
    }

    public function destroy(ObjStatus $objStatus)
    {
        $objStatus->delete();

        return response()->noContent();
    }

    public function searchByEmail(Request $request)
    {
        $owner = $request->input('owner');
       
        $files = ObjStatus::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(information, '$[0][0].owner')) = ?", [$owner])->get();
        \Log::info('Search results: ' . $files);
        return response()->json($files);
    }

    public function searchById(Request $request)
    {
        $id = $request->input('id');
       
        $files = ObjStatus::where('id', $id)->get();

        \Log::info('Search results by ID: ' . $files);
        return response()->json($files);
    }
}
