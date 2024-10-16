<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Http\Controllers\ObjStatusController;
use App\Http\Controllers\AllFilesController;
use App\Http\Controllers\FilesReviewController;
use App\Http\Controllers\PackageStatusController;
use App\Http\Controllers\DocumentsApprovalController;



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

Route::get('/documents-approval', [DocumentsApprovalController::class, 'show'])->name('documents-approval');


Route::get('/generate-token', function (Request $request) {
    // Obtener los parámetros de la solicitud
    $email = $request->query('email');
    $id = $request->query('id');

    // Validar los parámetros
    if (empty($email) || empty($id)) {
        return response()->json(['error' => 'user email and object status id is required.'], 400);
    }

    // Establecer el tiempo de expiración
    $expiresAt = Carbon::now()->addHours(1); // Token expira en 1 hora

    // Crear el payload con fecha de expiración
    $payload = json_encode([
        'email' => $email,
        'id' => $id,
        'expires_at' => $expiresAt->timestamp,
    ]);

    // Encriptar el token
    $token = Crypt::encryptString($payload);

    return response()->json(['token' => $token]);
});

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
