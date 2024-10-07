<?php

// app/Models/City.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    // Specify the table name if it's not the default 'cities'
    protected $table = 'worldcities';

    // If table table doesn't use Laravel's timestamps, disable them
    public $timestamps = false;

    // Define the fillable attributes
    protected $fillable = [
        'id',
        'city',
        'city_ascii',
        'lat',
        'lng',
        'country',
        'iso2',
        'iso3',
        'admin_name', // This is the province/state field
        'capital',
        'population',
    ];

    // If you have any relationships, define them here
    // For example, if a city belongs to a country model
    // public function country()
    // {
    //     return $this->belongsTo(Country::class);
    // }
}
