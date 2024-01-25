<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Repositories\RolePermissionRepository;
class RolePermissionService
{
    private $rolePermissionRepository;

    public function __construct(RolePermissionRepository $rolePermissionRepository)
    {
        $this->rolePermissionRepository = $rolePermissionRepository;
    }

    public function getRolePermissionByRoleId($roleId)
    {
        return $this->rolePermissionRepository->getRolePermissionByRoleId($roleId);
    }
}


