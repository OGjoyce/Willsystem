<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ContractController;

Route::middleware('api')->group(function () {
    Route::apiResource('obj-statuses', ObjStatusController::class);
    Route::apiResource('/obj-status/all',ObjStatusController::class);
    Route::apiResource('packages', PackageController::class);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/files/search', [ObjStatusController::class, 'searchByEmail']);
Route::get('/obj-status/search', [ObjStatusController::class, 'searchById']);

// Ruta específica para obtener contratos
Route::get('/contracts', [ContractController::class, 'index']);
