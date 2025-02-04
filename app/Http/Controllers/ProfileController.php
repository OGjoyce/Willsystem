<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

      public function validateEmail(Request $request)
    {
        // Validar que el email esté presente y sea válido
        $request->validate([
            'email' => 'required|email',
             'name' => 'required|string',
        ]);

        $email = $request->input('email');
        $name = $request->input('name');

        // Buscar si el usuario ya existe en la base de datos
        $user = User::where('email', $email)->first();

        if ($user) {
            // Si el usuario ya existe, retornar null
            return response()->json(['password' => null], 200);
        } else {
            // Si no existe, generar una contraseña aleatoria de 8 caracteres
            $password = $email;

            // Crear el nuevo usuario con la contraseña hasheada
            $newUser = User::create([
                'email' => $email,
                'name' => $name,
                'password' => Hash::make($password),  // Guardar la contraseña hasheada en la base de datos,
                'user_type' => User::TYPE_USER,
            ]);

            // Retornar la contraseña sin hashear en la respuesta para que el usuario pueda usarla
            return response()->json(['password' => $password], 201);
        }
    }
}
