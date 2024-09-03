<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    // Si tu tabla en la base de datos no usa el nombre plural por defecto, especifícalo aquí
    protected $table = 'contracts';

    // Campos que se pueden asignar en masa
    protected $fillable = ['description'];
}
