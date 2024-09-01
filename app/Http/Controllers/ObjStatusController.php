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
      //  \Log::info('THIS IS THE RQUESET ' . $request);


        $validatedData = $request->validate([
            'information' => 'required|string',
            'related_id' => 'required|integer',
        ]);

        // Decode the JSON string
        $information = json_decode($validatedData['information'], true);
        if (is_array($information) && isset($information['data'])) {
            $information = $information['data'];
        }

        $objStatus = ObjStatus::create([
            'information' => $information,
            'related_id' => $validatedData['related_id'],
        ]);

        return response()->json($objStatus, 201);
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
        $validatedData = $request->validate([
            'information' => 'required|string',
            'related_id' => 'required|integer',
        ]);
        $information = json_decode($validatedData['information'], true);
        if (is_array($information) && isset($information['data'])) {
            $information = $information['data'];
        }

    
        $objStatus->update([
            'information' => $information,
            'related_id' => $validatedData['related_id'],
        ]);
    
        return response()->json($objStatus);

       
        
        
        
    }

    public function destroy(ObjStatus $objStatus)
    {
        $objStatus->delete();

        return response()->noContent();
    }
    public function searchByEmail(Request $request)
    {
        $owner = $request->input('owner');
       
        $files = ObjStatus::whereRaw("JSON_UNQUOTE(JSON_EXTRACT(information, '$[0].owner')) = ?", [$owner])->get();
        \Log::info('Search results: ' . $files);
        return response()->json($files);
    }

    public function searchById(Request $request)
{
    $id = $request->input('id');
   
    $files = ObjStatus::where('id', $id)->get();

    \Log::info('Search results by ID: ' . $files);
    return response()->json($files);
}


}
