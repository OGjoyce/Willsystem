<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailabilitySlot extends Model
{
    protected $fillable = ['lawyer_id', 'day_of_week', 'start_time', 'end_time'];

    public function lawyer()
    {
        return $this->belongsTo(Lawyer::class);
    }
}
