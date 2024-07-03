<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //
        Schema::create('Files', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->integer('idPackage');
            $table->integer('idHumanOwner');
            $table->timestamps();
        });
        Schema::create('Packages', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->string('name');
            $table->string('price');
            $table->timestamps();
        });
        Schema::create('Humans', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->string('firstName');
            $table->string('middleName');
            $table->string('lastName');
            $table->integer('idRelative');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('country')->nullable();
            $table->boolean('isMarried');
            $table->boolean('hasChilds');
            $table->timestamps();
        });
        Schema::create('Relatives', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->string('relative')->unique();
        });
        Schema::create('Executors', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->unsignedInteger('idHuman');
        });
        Schema::create('Bequest', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->string('bequest');
            $table->unsignedInteger('idFile');
            $table->json('bequestInfo');
        });
        Schema::create('Residue', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->string('option');
            $table->json('information');
        });
        Schema::create('Wipeout', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->string('option');
            $table->json('information');
        });
        Schema::create('Testamentary', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
        });
        Schema::create('Guardian', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
        });
        Schema::create('Pets', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idHumanPrimary');
            $table->unsignedInteger('idHumanBackup');
            $table->string('amount');
        });
        Schema::create('Additional', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
        });
        Schema::create('Poa', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
        });
        Schema::create('Final', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
        });
        Schema::create('Will', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
            $table->string('dom');
            $table->timestamps();
        });
        Schema::create('PoaFinance', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
            $table->string('dom');
            $table->timestamps();
        });
        Schema::create('PoaHelth', function (Blueprint $table) {
            $table->increments('id')->primary();
            $table->unsignedInteger('idFile');
            $table->json('information');
            $table->string('dom');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('Files');
        Schema::dropIfExists('Packages');
        Schema::dropIfExists('Humans');
        Schema::dropIfExists('Relatives');
        Schema::dropIfExists('Executors');
        Schema::dropIfExists('Bequest');
        Schema::dropIfExists('Residue');
        Schema::dropIfExists('Wipeout');
        Schema::dropIfExists('Testamentary');
        Schema::dropIfExists('Guardian');
        Schema::dropIfExists('Pets');
        Schema::dropIfExists('Additional');
        Schema::dropIfExists('Poa');
        Schema::dropIfExists('Final');
        Schema::dropIfExists('Will');
        Schema::dropIfExists('PoaFinance');
        Schema::dropIfExists('PoaHelth');
    }
};
