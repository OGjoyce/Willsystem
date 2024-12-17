<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
protected $fillable = [
    'lawyer_id',
    'lawyer_email',
    'client_name',
    'client_email',
    'title',
    'description',
    'start_date',
    'end_date',
    'duration',
    'link',
    'object_status_id'
];
   

}
