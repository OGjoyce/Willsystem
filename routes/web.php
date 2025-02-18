<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\AllFilesController;
use App\Http\Controllers\FilesReviewController;
use App\Http\Controllers\PackageStatusController;
use App\Http\Controllers\DocumentsApprovalController;
use App\Http\Controllers\GoogleCalendarController;
use App\Http\Controllers\GoogleAuthController;


Route::get('/auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

// Ruta para crear un evento
Route::get('/google-calendar/create', [GoogleCalendarController::class, 'createEvent']);

// Ruta para obtener eventos futuros
Route::get('/google-calendar/events', [GoogleCalendarController::class, 'getEvents']);

// Ruta para eliminar un evento por ID
Route::delete('/google-calendar/delete/{eventId}', [GoogleCalendarController::class, 'deleteEvent']);



Route::apiResource('obj-statuses', ObjStatusController::class);
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/personal', function () {
    return Inertia::render('Will/Personal');
})->middleware(['auth', 'verified'])->name('personal');

Route::get('/landing', function () {
    return Inertia::render('Landing/Landing');
});


Route::get('/view', function () {
    return Inertia::render('Admin/View');
})->name("view");

Route::get('/packages', function () {
    return Inertia::render('Admin/Packages');
})->name("packages");

Route::get('/all-files', function () {
    return Inertia::render('Admin/AllFiles');
})->name("all-files");

Route::get('/files-review', function () {
    return Inertia::render('Admin/FilesReview');
})->name("files-review");

Route::get('/package-status/{id}', function ($id) {
    return Inertia::render('Admin/PackageStatus', [
        'id' => $id
    ]);
})->name("package-status");

Route::get('/statitics', function () {
    return Inertia::render('Admin/Statitics');
})->name("statitics");

Route::get('/scheduler', function () {
    return Inertia::render('Admin/Scheduler');
})->name("scheduler");

Route::get('/lawyers-management', function () {
    return Inertia::render('Admin/LawyersManagement');
})->name("lawyers-management");

Route::get('/users-management', function () {
    return Inertia::render('Admin/UsersManagement');
})->name("users-management");

Route::get('/documents-approval', [DocumentsApprovalController::class, 'show'])->name('documents-approval');



Route::get('/create', function () {
    return Inertia::render('Will/Create');
});

Route::get('/profile-info/{email?}', function (Request $request, $email = null) {
    return Inertia::render('Profile/ProfileInfo', [
        'auth' => [
            'user' => auth()->user(),
        ],
        'requestedEmail' => $email,
    ]);
})->middleware(['auth', 'verified'])->name('profile.info');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
