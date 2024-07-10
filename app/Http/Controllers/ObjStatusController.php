<?php

namespace App\Http\Controllers;

use App\Models\ObjStatus;
use Illuminate\Http\Request;

class ObjStatusController extends Controller
{    public function index()
    {
        return ObjStatus::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'information' => 'required|json',
            'related_id' => 'required|integer',
        ]);

        return ObjStatus::create($request->all());
    }

    public function show(ObjStatus $objStatus)
    {
        return $objStatus;
    }

    public function update(Request $request, ObjStatus $objStatus)
    {
        $request->validate([
            'information' => 'required|json',
            'related_id' => 'required|integer',
        ]);

        $objStatus->update($request->all());

        return $objStatus;
    }

    public function destroy(ObjStatus $objStatus)
    {
        $objStatus->delete();

        return response()->noContent();
    }

}
