<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index()
    {
        return Package::all();
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'price' => 'required|string',
            'description' => 'required|string',
            'campaign' => 'required|string',
        ]);

        $package = Package::create($validatedData);

        return response()->json($package, 201);
    }

    public function show(Package $package)
    {
        return $package;
    }

    public function update(Request $request, Package $package)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
            'price' => 'required|string',
            'description' => 'required|string',
            'campaign' => 'required|string',
        ]);

        $package->update($validatedData);

        return response()->json($package);
    }

    public function destroy(Package $package)
    {
        $package->delete();

        return response()->noContent();
    }
}