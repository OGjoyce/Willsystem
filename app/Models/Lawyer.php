<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lawyer extends Model
{
    protected $fillable = [
               'first_name',
        'last_name',
        'date_of_birth',
        'email',
        'law_firm_id'
    ];

    public function lawFirm()
    {
        return $this->belongsTo(LawFirm::class);
    }

    public function availabilitySlots()
    {
        return $this->hasMany(AvailabilitySlot::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function timeOffs()
    {
        return $this->hasMany(TimeOff::class);
    }
}

