<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ContractController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CityController;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

// Rutas de recursos existentes
Route::apiResource('obj-statuses', ObjStatusController::class);
Route::apiResource('packages', PackageController::class);

// Rutas personalizadas para ObjStatus
Route::get('/obj-status/all', [ObjStatusController::class, 'getRecentStatuses']);
Route::get('/obj-status/date-range', [ObjStatusController::class, 'getStatusesByDateRange']);

// Rutas adicionales
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/files/search', [ObjStatusController::class, 'searchByEmail']);
Route::get('/obj-status/search', [ObjStatusController::class, 'searchById']);

// Ruta específica para obtener contratos
Route::get('/contracts', [ContractController::class, 'index']);

// routes/api.php
Route::get('/cities', [CityController::class, 'search']);


Route::post('/validate-email', [ProfileController::class, 'validateEmail']);

Route::post('/generate-token', function (Request $request) {
    // Obtener los parámetros del cuerpo de la solicitud
    $email = $request->input('email');
    $id = $request->input('id');

    // Validar los parámetros
    if (empty($email) || empty($id)) {
        return response()->json(['error' => 'user email and object status id is required.'], 400);
    }

    // Establecer el tiempo de expiración


    // Crear el payload con fecha de expiración
    $payload = json_encode([
        'email' => $email,
        'id' => $id,
    ]);

    // Encriptar el token
    $token = Crypt::encryptString($payload);

    return response()->json(['token' => $token]);
});
