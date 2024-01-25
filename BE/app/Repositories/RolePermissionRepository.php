<?php

namespace App\Repositories;

use App\Models\RolePermission;

class RolePermissionRepository
{
    public function getRolePermissionByPermissionId($permissionId)
    {
        return RolePermission::where('permission_id', $permissionId)->first();
    }

    public function updateOrInsert($roleId, $permissionid, $dataInsert)
    {
        return RolePermission::updateOrInsert([
                'role_id' => $roleId,
                'permission_id' => $permissionid
            ], $dataInsert);
    }

    public function getRolePermissionByRoleId($roleId)
    {
        return RolePermission::select([
                'role_id',
                'permission_id',
                'mode',
            ])->where('role_id', $roleId)->get();
    }

    public function getRolePermissionByPermissionIdAndRoleId($permissionId, $roleId)
    {
        return RolePermission::where('permission_id', $permissionId)->where('role_id', $roleId)->first();
    }
}
