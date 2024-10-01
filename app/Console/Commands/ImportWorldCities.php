<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImportWorldCities extends Command
{
    protected $signature = 'import:worldcities';
    protected $description = 'Import world cities from CSV into the worldcities table';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
           $filePath = base_path('database/data/worldcities.csv');
        
        if (!file_exists($filePath) || !is_readable($filePath)) {
            $this->error('CSV file not found or is not readable.');
            return;
        }

        $header = ['city', 'city_ascii', 'lat', 'lng', 'country', 'iso2', 'iso3', 'admin_name', 'capital', 'population', 'id'];
        $data = array_map('str_getcsv', file($filePath));

        // Remove the CSV header
        array_shift($data);

        foreach ($data as $row) {
            DB::table('worldcities')->insert([
                'city' => $row[0],
                'city_ascii' => $row[1],
                'lat' => $row[2],
                'lng' => $row[3],
                'country' => $row[4],
                'iso2' => $row[5],
                'iso3' => $row[6],
                'admin_name' => $row[7],
                'capital' => $row[8],
               'population' => $row[9] !== '' ? $row[9] : null,
                'id' => $row[10],
            ]);
        }

        $this->info('World cities imported successfully!');
    }
}
