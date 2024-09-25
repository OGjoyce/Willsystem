<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ContractController;

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
