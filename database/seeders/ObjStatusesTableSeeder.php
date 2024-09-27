<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ObjStatusesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Ruta al archivo .sql
        $path = database_path('seeders/data/obj_statuses.sql');

        // Verificar si el archivo existe
        if (File::exists($path)) {
            // Leer el contenido del archivo
            $sql = File::get($path);

            // Ejecutar el SQL
            DB::unprepared($sql);

            $this->command->info('Datos de obj_statuses insertados exitosamente.');
        } else {
            $this->command->error('El archivo obj_statuses.sql no se encontró en ' . $path);
        }
    }
}
