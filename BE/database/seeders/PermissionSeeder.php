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
        $permissions = [
            [
                'code' => 'customer',
                'permission_name' => 'Customer',
                'category_name' => 'sale',
                'created_at' => now()
            ],
            [
                'code' => 'quotation',
                'permission_name' => 'Quotation',
                'category_name' => 'sale',
                'created_at' => now()
            ],
            [
                'code' => 'invoice',
                'permission_name' => 'Invoice',
                'category_name' => 'sale',
                'created_at' => now()
            ],
            [
                'code' => 'inventory',
                'permission_name' => 'Inventory',
                'category_name' => 'procurement',
                'created_at' => now()
            ],
            [
                'code' => 'scrap_management',
                'permission_name' => 'Scrap Management',
                'category_name' => 'procurement',
                'created_at' => now()
            ],
            [
                'code' => 'user_management',
                'permission_name' => 'User Management',
                'category_name' => 'organisation',
                'created_at' => now()
            ],
            [
                'code' => 'role_setting',
                'permission_name' => 'Roles Setting',
                'category_name' => 'organisation',
                'created_at' => now()
            ],
            [
                'code' => 'claim',
                'permission_name' => 'Claim',
                'category_name' => 'sale',
                'created_at' => now()
            ],
        ];
        foreach ($permissions as $permissionData) {
            $existingPermission = Permission::where('code', $permissionData['code'])->exists();
            if (!$existingPermission) {
                Permission::create($permissionData);
            }
        }
    }
}
