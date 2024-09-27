<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Llamar a otros seeders si existen
        $this->call([
            ObjStatusesTableSeeder::class,
        ]);
    }
}
