<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::create('appointments', function (Blueprint $table) {
        $table->id();
        $table->string('email');          // Email del cliente
        $table->string('title');          // Título de la cita
        $table->text('description')->nullable(); // Descripción opcional
        $table->date('date');             // Fecha de la cita
        $table->time('time');             // Hora de inicio
        $table->integer('duration');      // Duración en minutos
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
