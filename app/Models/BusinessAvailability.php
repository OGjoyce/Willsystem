<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'day_of_week',  // Día de la semana
        'start_time',   // Hora de inicio
        'end_time',     // Hora de fin
    ];
}
