<?php
// app/Http/Controllers/DocumentsApprovalController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use App\Models\ObjStatus;

class DocumentsApprovalController extends Controller
{
    public function show(Request $request)
    {
        if (!Auth::check()) {
            $request->session()->put('returnUrl', $request->fullUrl());
            return Redirect::route('login');
        }

        $token = $request->query('token');

        if (!$token) {
            // Obtener todos los object statuses sin filtrar y filtrar en el frontend
            $objectStatuses = ObjStatus::all();

            return Inertia::render('Admin/ObjectStatusSelection', [
                'objectStatuses' => $objectStatuses
            ]);
        }

        try {
            $payload = Crypt::decryptString($token);
            $data = json_decode($payload, true);

            if (Auth::user()->email !== $data['email']) {
                abort(403, 'Unauthorized');
            }

            return Inertia::render('Admin/DocumentsApproval', [
                'id' => $data['id']
            ]);
        } catch (\Exception $e) {
            abort(403, 'Invalid token');
        }
    }
}
