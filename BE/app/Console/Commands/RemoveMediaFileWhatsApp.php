<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RemoveMediaFileWhatsApp extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mediafilewhatsapp:remove';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove media file whatsapp';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $thirtyDaysAgo = date('Y/m/d', strtotime('-30 days'));
        $directory = 'public/messages/'.$thirtyDaysAgo;
        Storage::deleteDirectory($directory);
    }
}
