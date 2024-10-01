<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorldcitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('worldcities', function (Blueprint $table) {
            $table->string('city', 120);
            $table->string('city_ascii', 120);
            $table->string('city_alt', 1000)->nullable();
            $table->float('lat');
            $table->float('lng');
            $table->string('country', 120);
            $table->string('iso2', 2);
            $table->string('iso3', 3);
            $table->string('admin_name', 120);
            $table->string('admin_name_ascii', 120)->nullable();
            $table->string('admin_code', 6)->nullable();
            $table->string('admin_type', 27)->nullable();
            $table->string('capital', 7)->nullable();
            $table->float('density')->nullable();
            $table->float('population')->nullable();
            $table->float('population_proper')->nullable();
            $table->integer('ranking')->nullable();
             $table->string('timezone', 120)->nullable();
            $table->string('same_name', 5)->nullable();
            $table->string('id', 10)->primary(); // Se asume que 'id' es clave primaria

            $table->charset = 'utf8mb4'; // Definir el conjunto de caracteres
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('worldcities');
    }
}

