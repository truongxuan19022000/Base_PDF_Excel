<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RolePermission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 1,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 2,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 3,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 4,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 5,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 6,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 1,
            'permission_id' => 7,
            'mode' => 7,
            'created_at' => now()
        ]);

        RolePermission::create([
            'role_id' => 2,
            'permission_id' => 1,
            'mode' => 7,
            'created_at' => now()
        ]);
    }
}
