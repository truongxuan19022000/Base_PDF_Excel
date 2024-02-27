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
        $rolePermission = [
            [
                'role_id' => 1,
                'permission_id' => 1,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 2,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 3,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 4,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 5,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 6,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 7,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 2,
                'permission_id' => 1,
                'mode' => 7,
                'created_at' => now()
            ],
            [
                'role_id' => 1,
                'permission_id' => 8,
                'mode' => 7,
                'created_at' => now()
            ],
        ];
        foreach ($rolePermission as $rolePermissionData) {
            $existingPermission = RolePermission::where('role_id', $rolePermissionData['role_id'])
                ->where('permission_id', $rolePermissionData['permission_id'])
                ->exists();
            if (!$existingPermission) {
                RolePermission::create($rolePermissionData);
            }
        }
    }
}
