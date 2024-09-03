<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PackagesReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('PackagesReview');
    }
}
