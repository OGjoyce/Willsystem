<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    public const TYPE_USER  = 1;
    public const TYPE_ADMIN = 2;
    public const TYPE_ROOT  = 3;
    public const TYPE_LAWYER = 4;

    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'user_type'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relación con las citas
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    // Relación con la disponibilidad
    public function availability()
    {
        return $this->hasMany(Availability::class);
    }
}
