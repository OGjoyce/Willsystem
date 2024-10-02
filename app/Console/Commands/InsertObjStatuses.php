<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class InsertObjStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'insert:obj-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Insert obj_statuses SQL file into the database';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $path = database_path('data/obj_statuses.sql');

        // Check if the SQL file exists
        if (!File::exists($path)) {
            $this->error('The SQL file does not exist.');
            return 1;
        }

        // Read the SQL file line by line to handle large volumes
        $file = fopen($path, 'r');

        if (!$file) {
            $this->error('Could not open the SQL file.');
            return 1;
        }

        DB::beginTransaction();
        try {
            $query = '';
            while (($line = fgets($file)) !== false) {
                $line = trim($line);
                if (empty($line) || strpos($line, '--') === 0) {
                    continue; // Ignore empty lines or comments
                }
                $query .= $line;

                // If the end of a SQL statement is reached
                if (substr(trim($line), -1) == ';') {
                    DB::unprepared($query);
                    $query = ''; // Clear the query for the next statement
                }
            }
            fclose($file);

            DB::commit();
            $this->info('All SQL statements were successfully executed.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error executing the SQL file: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
