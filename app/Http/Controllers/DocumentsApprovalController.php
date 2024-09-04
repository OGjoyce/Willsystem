<?php
// app/Http/Controllers/DocumentsApprovalController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class DocumentsApprovalController extends Controller
{
    public function show(Request $request)
    {
        // check if user is authenticated
        if (!Auth::check()) {
            // Save the url in the session and send the user to login
            $request->session()->put('returnUrl', $request->fullUrl());
            return Redirect::route('login');
        }

        $token = $request->query('token');

        try {
            // Decrypt token
            $payload = Crypt::decryptString($token);
            $data = json_decode($payload, true);

            $email = $data['email'];
            $id = $data['id'];
            $expiresAt = Carbon::createFromTimestamp($data['expires_at']);

            // Check if token has expired
            if (Carbon::now()->greaterThan($expiresAt)) {
                abort(403, 'Token has expired');
            }

            // Check if email in token is the same as the authenticated email
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