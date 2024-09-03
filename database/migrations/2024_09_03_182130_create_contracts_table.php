<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CreateContractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('description');
            $table->timestamps();
        });

        // Insert data
        $contracts = [
            'One will only',
            'One will and one POA (property)',
            'One will and one POA (health)',
            'One will and two POAs',
            'One will and one secondary will',
            'One will and one secondary will and one POA (property)',
            'One will and one secondary will and one POA (health)',
            'One will and one secondary will and two POAs',
            'Two spousal wills only',
            'Two spousal wills and two POAs (property)',
            'Two spousal wills and two POAs (health)',
            'Two spousal wills and four POAs',
            'Two spousal wills and one secondary will',
            'Two spousal wills and one secondary will and two POAs (property)',
            'Two spousal wills and one secondary will and two POAs (health)',
            'Two spousal wills and one secondary will and four POAs',
            'Two spousal wills and two secondary wills',
            'Two spousal wills and two secondary wills and two POAs (property)',
            'Two spousal wills and two secondary wills and two POAs (health)',
            'Two spousal wills and two secondary wills and four POAs',
            '1 X POA health only (no will)',
            '1 X POA property only (no will)',
            '1 X POA health and POA property (no will)',
            '2 X POA health only (no will)',
            '2 X POA property only (no will)',
            '2 X POA health and POA property (no will)'
        ];

        foreach ($contracts as $description) {
            DB::table('contracts')->insert([
                'description' => $description,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contracts');
    }
}
