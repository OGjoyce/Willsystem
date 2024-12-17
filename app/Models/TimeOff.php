<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeOff extends Model
{
    protected $fillable = ['lawyer_id', 'title', 'start_date', 'end_date'];
}
