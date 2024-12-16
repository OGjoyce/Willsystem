<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',        // Email del cliente
        'title',        // Título de la cita
        'description',  // Descripción de la cita (puede ser null)
        'date',         // Fecha de la cita
        'time',         // Hora de inicio de la cita
        'duration',     // Duración en minutos
    ];
}
