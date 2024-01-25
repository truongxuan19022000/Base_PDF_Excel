<?php

namespace App\Services;

use App\Repositories\PermissionRepository;

class PermissionService
{
    private $permissionRepository;

    public function __construct(
        PermissionRepository $permissionRepository
    ) {
        $this->permissionRepository = $permissionRepository;
    }

    public function getPermissions()
    {
        $permissions = $this->permissionRepository->getPermissions();
        $results = [
            'permissions' => $permissions
        ];

        return $results;
    }
}
