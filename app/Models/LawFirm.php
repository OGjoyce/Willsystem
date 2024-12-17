<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LawFirm extends Model
{
    protected $fillable = ['name'];

    public function lawyers()
    {
        return $this->hasMany(Lawyer::class);
    }
}
