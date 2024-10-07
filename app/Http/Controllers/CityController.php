<?php
// app/Http/Controllers/CityController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\City; 

class CityController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');
        $cities = City::where('city_ascii', 'LIKE', "%{$query}%")
            ->orWhere('city', 'LIKE', "%{$query}%")
            ->limit(50)
            ->get(['id', 'city', 'city_ascii', 'admin_name', 'country']);

        return response()->json($cities);
    }
}
