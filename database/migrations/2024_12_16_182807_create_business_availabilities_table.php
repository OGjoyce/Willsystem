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
    Schema::create('business_availabilities', function (Blueprint $table) {
        $table->id();
        $table->string('day_of_week');  // Día de la semana (ejemplo: Monday)
        $table->time('start_time');     // Hora de inicio
        $table->time('end_time');       // Hora de fin
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_availabilities');
    }
};
