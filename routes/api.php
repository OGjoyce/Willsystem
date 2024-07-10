<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ObjStatusController;

Route::middleware('api')->group(function () {
    Route::apiResource('obj-statuses', ObjStatusController::class);
});
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
