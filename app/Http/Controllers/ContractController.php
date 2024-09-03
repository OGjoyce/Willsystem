<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contract;

class ContractController extends Controller
{
    /**
     * Get all contracts.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $contracts = Contract::all();
        return response()->json($contracts);
    }
}
