<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserManagementController extends Controller
{
    /**
     * Display a paginated listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Allow search by name or email.
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
        }

        // Optionally filter by user_type.
        if ($request->has('user_type')) {
            $query->where('user_type', $request->get('user_type'));
        }

        $users = $query->paginate(10);

        return response()->json($users);
    }

    /**
     * Display the specified user.
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    /**
     * Store a newly created user in storage.
     *
     * For this example, a password is required when creating a new user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|max:255|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
            'user_type' => 'required|integer|in:1,2,3,4', // 1: user, 2: admin, 3: root, 4: lawyer
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'user_type' => $request->user_type,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user'    => $user,
        ], 201);
    }

    /**
     * Update the specified user in storage.
     *
     * The password is optional here. If provided, it will be updated.
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $rules = [
            'name'      => 'sometimes|required|string|max:255',
            'email'     => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'user_type' => 'sometimes|required|integer|in:1,2,3,4',
        ];

        // Allow password update if provided.
        if ($request->filled('password')) {
            $rules['password'] = 'sometimes|required|string|min:8|confirmed';
        }

        $validatedData = $request->validate($rules);

        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user,
        ]);
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
