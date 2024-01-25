<?php

namespace App\Services;

use App\Repositories\RoleRepository;
use App\Repositories\PermissionRepository;
use App\Repositories\RolePermissionRepository;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RoleService
{
    private $roleRepository;
    private $permissionRepository;
    private $rolePermissionRepository;

    public function __construct(
        RoleRepository $roleRepository,
        PermissionRepository $permissionRepository,
        RolePermissionRepository $rolePermissionRepository
    ) {
        $this->roleRepository = $roleRepository;
        $this->permissionRepository = $permissionRepository;
        $this->rolePermissionRepository = $rolePermissionRepository;
    }

    public function getRoles($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $roles = $this->roleRepository->getRoles($searchParams, $paginate);
        $results = [
            'roles' => $roles
        ];

        return $results;
    }

    public function createRole($credentials)
    {
        try {
            DB::beginTransaction();
            $role = [
                'role_name' => $credentials['role_name'],
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->roleRepository->create($role);
            $rolePermission = [];
            $roleAction = config('role.role_setting');
            foreach ($credentials['role_setting'] as $roleSetting) {
                $permissionId = $this->permissionRepository->getPermissionByCode($roleSetting['code'])->id;

                $sum = 0;
                foreach ($roleAction as $key => $value) {
                    if (array_key_exists($key, $roleSetting)) {
                        $sum = $sum + $roleAction[$key][$roleSetting[$key]];
                    }
                }

                $rolePermission[] = [
                    'role_id' => $result->id,
                    'permission_id' => $permissionId,
                    'mode' => $sum,
                    'created_at' => Carbon::now(),
                ];
            }

            if (count($rolePermission) > 0) {
                foreach ($rolePermission as $item) {
                    $this->rolePermissionRepository->updateOrInsert($item['role_id'], $item['permission_id'], $item);
                }
            }

            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "RoleService" FUNCTION "createRole" ERROR: ' . $e->getMessage());
        }

        return [
            'status' => false
        ];
    }

    public function edit($roleId)
    {
        $rolePermissions = $this->rolePermissionRepository->getRolePermissionByRoleId($roleId);
        $roleInfo = $this->roleRepository->getRoleById($roleId);
        $roleTemp = [];
        $permissions = config('role.mode');

        foreach ($rolePermissions as $rolePermission) {
            $roleTemp[] = [
                $rolePermission->permission->code => $permissions[$rolePermission->mode]
            ];
        }

        $results = [
            'role_id' => intval($roleId),
            'role_name' => $roleInfo->role_name,
            'role' => $roleTemp
        ];

        return $results;
    }

    public function updateRole($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'role_name' => $credentials['role_name'],
                'updated_at' => now(),
            ];

            $result = $this->roleRepository->update($credentials['role_id'], $updateData);
            if (!$result) {
                return false;
            }

            $rolePermission = [];
            $roleAction = config('role.role_setting');

            foreach ($credentials['role_setting'] as $roleSetting) {
                $permissionId = $this->permissionRepository->getPermissionByCode($roleSetting['code'])->id;
                $existedPermission = $this->rolePermissionRepository->getRolePermissionByPermissionIdAndRoleId($permissionId, $credentials['role_id']);
                if (!$existedPermission) {
                    $timeCreateOrupdate = [
                        'created_at' => Carbon::now(),
                    ];
                } else {
                    $timeCreateOrupdate = [
                        'updated_at' => Carbon::now(),
                    ];
                }

                $sum = 0;
                foreach ($roleAction as $key => $value) {
                    if (array_key_exists($key, $roleSetting)) {
                        $sum = $sum + $roleAction[$key][$roleSetting[$key]];
                    }
                }

                $rolePermission[] = array_merge([
                    'role_id' => $credentials['role_id'],
                    'permission_id' => $permissionId,
                    'mode' => $sum,
                ], $timeCreateOrupdate);
            }

            if (count($rolePermission) > 0) {
                foreach ($rolePermission as $item) {
                    $this->rolePermissionRepository->updateOrInsert($item['role_id'], $item['permission_id'], $item);
                }
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "RoleService" FUNCTION "updateRole" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function delete($roleId)
    {
        try {
            $result = $this->roleRepository->delete($roleId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "RoleService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function getRoleList()
    {
        return $this->roleRepository->getRoleList();
    }

    public function multiDeleteRole($roleId)
    {
        try {
            $result = $this->roleRepository->multiDeleteRole($roleId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "RoleService" FUNCTION "multiDeleteRole" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
