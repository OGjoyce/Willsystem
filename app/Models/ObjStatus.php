<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ObjStatus extends Model
{
    use HasFactory;
    protected $fillable = ['information', 'related_id'];

    protected $casts = [
        'information' => 'array',
    ];
}
