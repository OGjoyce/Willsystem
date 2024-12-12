<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'date', 'time', 'duration'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
