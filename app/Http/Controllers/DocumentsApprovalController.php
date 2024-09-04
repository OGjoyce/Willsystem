<?php
// app/Http/Controllers/DocumentsApprovalController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DocumentsApprovalController extends Controller
{
    public function show(Request $request)
    {
        $token = $request->query('token');

        try {
            // Desencriptar el token
            $payload = Crypt::decryptString($token);
            $data = json_decode($payload, true);

            $email = $data['email'];
            $id = $data['id'];
            $expiresAt = Carbon::createFromTimestamp($data['expires_at']);

            // Verificar si el token ha expirado
            if (Carbon::now()->greaterThan($expiresAt)) {
                abort(403, 'Token has expired');
            }

            // Verificar que el email del token coincide con el del usuario logueado
            if (Auth::user()->email !== $email) {
                abort(403, 'Unauthorized');
            }

            return Inertia::render('Admin/DocumentsApproval', [
                'id' => $id,
            ]);
        } catch (\Exception $e) {
            abort(403, 'Invalid token');
        }
    }
}
