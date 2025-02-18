<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Client;
use Google\Service\Calendar;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GoogleAuthController extends Controller
{
    /**
     * Redirigir al usuario a la página de autenticación de Google.
     */
    public function redirectToGoogle()
    {
        $client = new Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(Calendar::CALENDAR);
        $client->setAccessType('offline'); // Para obtener refresh token
        $client->setPrompt('consent'); // Siempre mostrar pantalla de autorización

        return redirect($client->createAuthUrl());
    }

    /**
     * Manejar la respuesta de Google y obtener el token OAuth.
     */
    public function handleGoogleCallback(Request $request)
{
    try {
        $client = new Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));

        $token = $client->fetchAccessTokenWithAuthCode($request->input('code'));

        if (isset($token['error'])) {
            return response()->json(['error' => $token['error']], 400);
        }

        // Guardar el token en un archivo JSON
        Storage::put('google-calendar/oauth-token.json', json_encode($token));

        return response()->json([
            'message' => 'Autenticación exitosa y token guardado',
            'token' => $token
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Error en la autenticación: ' . $e->getMessage()], 500);
    }
}
}
