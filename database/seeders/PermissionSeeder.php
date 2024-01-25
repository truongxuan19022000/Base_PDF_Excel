<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Permission::create([
            'code' => 'customer',
            'permission_name' => 'Customer',
            'category_name' => 'sale',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'quotation',
            'permission_name' => 'Quotation',
            'category_name' => 'sale',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'invoice',
            'permission_name' => 'Invoice',
            'category_name' => 'sale',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'inventory',
            'permission_name' => 'Inventory',
            'category_name' => 'procurement',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'scrap_management',
            'permission_name' => 'Scrap Management',
            'category_name' => 'procurement',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'user_management',
            'permission_name' => 'User Management',
            'category_name' => 'organisation',
            'created_at' => now()
        ]);

        Permission::create([
            'code' => 'role_setting',
            'permission_name' => 'Roles Setting',
            'category_name' => 'organisation',
            'created_at' => now()
        ]);
    }
}
