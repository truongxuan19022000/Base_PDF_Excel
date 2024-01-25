<?php

namespace App\Repositories;

use App\Models\Permission;

class PermissionRepository
{
    public function create(array $request)
    {
        return Permission::create($request);
    }

    public function getPermissionByCode($permissionCode)
    {
        return Permission::where('code', $permissionCode)->first();
    }

    public function getPermissions()
    {
        return Permission::select([
                'id',
                'code',
                'permission_name',
            ])->get();
    }
}
