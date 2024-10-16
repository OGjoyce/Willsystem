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
            $table->id();
            $table->string('city', 120);
            $table->string('city_ascii', 120);
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7); 
            $table->string('country', 120);
            $table->string('iso2', 2);
            $table->string('iso3', 3);
            $table->string('admin_name', 120);
            $table->string('capital', 7)->nullable();
            $table->bigInteger('population')->nullable();
            $table->charset = 'utf8mb4';
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
