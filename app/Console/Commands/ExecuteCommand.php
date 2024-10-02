<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ExecuteCommand extends Command
{
    protected $signature = 'execute:command';
    protected $description = 'Execute one of the predefined commands';

    public function handle()
    {
        $commands = [
            '1' => 'generate:token',
            '2' => 'import:worldcities',
            '3' => 'insert:obj-statuses',
        ];

        // Display the available commands to the user
        $this->info('Select the command you want to execute:');
        foreach ($commands as $key => $command) {
            $this->line("[$key] $command");
        }

        // Get user selection
        $selected = $this->ask('Enter the number of the command to execute');

        // Validate user selection
        if (!array_key_exists($selected, $commands)) {
            $this->error('Invalid selection');
            return 1;
        }

        // Handle special case for generate:token which requires parameters
        if ($selected === '1') {
            $email = $this->ask('Enter the email for the token generation');
            $id = $this->ask('Enter the ID for the token generation');

            if (!$email || !$id) {
                $this->error('Both email and ID are required for token generation.');
                return 1;
            }

            // Call the generate:token command with arguments
            $this->call($commands[$selected], [
                'email' => $email,
                'id' => $id,
            ]);
        } else {
            // Call other commands without arguments
            $this->call($commands[$selected]);
        }

        return 0;
    }
}
