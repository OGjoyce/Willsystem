<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PackageStatusController extends Controller
{
     public function index()
    {
        return Inertia::render('PackageStatus');
    }
}
