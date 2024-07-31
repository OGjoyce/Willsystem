<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\PackageController;

Route::middleware('api')->group(function () {
    Route::apiResource('obj-statuses', ObjStatusController::class);
    Route::apiResource('packages', PackageController::class);
});
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/files/search', [ObjStatusController::class, 'searchByEmail']);
