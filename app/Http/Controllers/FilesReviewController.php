<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FilesReviewController extends Controller
{
    public function index()
    {
        return Inertia::render('FilesReview');
    }
}
