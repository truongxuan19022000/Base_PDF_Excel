<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Role::create([
            'role_name' => 'Admin',
            'created_at' => now()
        ]);

        Role::create([
            'role_name' => 'User',
            'created_at' => now()
        ]);
    }
}
