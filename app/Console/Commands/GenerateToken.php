<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Carbon\Carbon;

class GenerateToken extends Command
{
    protected $signature = 'generate:token {email} {id}';
    protected $description = 'Generate a token with expiration for document approval';

    public function handle()
    {
        $email = $this->argument('email');
        $id = $this->argument('id');

        $expiresAt = Carbon::now()->addHours(1); // Token expira en 1 hora

        $payload = json_encode([
            'email' => $email,
            'id' => $id,
            'expires_at' => $expiresAt->timestamp,
        ]);

        $token = Crypt::encryptString($payload);

        $this->info('Generated Token: ' . $token);
    }
}