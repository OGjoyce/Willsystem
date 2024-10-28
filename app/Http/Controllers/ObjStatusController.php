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

    // Decodificar la información que viene del JSON
    $information = json_decode($validatedData['information'], true);

    // Verificar si es un array anidado y extraer los datos
    if (is_array($information) && isset($information['data'])) {
        $information = $information['data'];

        // Procesar cada conjunto de datos anidados
        foreach ($information as $dataSet) {
            // Aquí puedes manejar cada conjunto de datos individualmente según tu lógica
            // Por ejemplo, puedes actualizar varios registros en la base de datos si es necesario
        }
    }

    // Actualizar el registro de `ObjStatus` con el primer conjunto de datos, si aplica
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

public function searchByInput(Request $request)
{
    $input = $request->input('owner');

    $files = ObjStatus::where(function($query) use ($input) {
        // Trim and escape the input to prevent SQL injection
        $input = trim($input);

        // Check if the input is numeric, assuming it's an ID
        if (is_numeric($input)) {
            $query->where('id', $input);
        }

        // Prepare the input for partial matching
        $likeInput = '%' . $input . '%';

        // Search by owner email with partial match
        $query->orWhereRaw(
            "JSON_UNQUOTE(JSON_EXTRACT(information, '$[0][0].owner')) LIKE ?",
            [$likeInput]
        );

        // Search by full name with partial match
        $query->orWhereRaw(
            "JSON_UNQUOTE(JSON_EXTRACT(information, '$[0][0].personal.fullName')) LIKE ?",
            [$likeInput]
        );
    })->get();

    \Log::info('Search results: ' . $files);
    return response()->json($files);
}


}
