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
    Schema::table('packages', function (Blueprint $table) {
        $table->boolean('is_signature_required')->default(false);
        $table->string('cliente_reference')->nullable(); 
        $table->date('expiration_date')->nullable();
    });
}

public function down()
{
    Schema::table('packages', function (Blueprint $table) {
        $table->dropColumn('is_signature_required');
        $table->dropColumn('cliente_reference'); 
        $table->dropColumn('expiration_date');
    });
}

};
