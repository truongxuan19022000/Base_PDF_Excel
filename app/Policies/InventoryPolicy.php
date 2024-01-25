<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use App\Models\RolePermission;
use App\Repositories\RoleRepository;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Auth;

class InventoryPolicy
{
    use HandlesAuthorization;

    public function create(User $user, $code, $mode)
    {
        return checkPermission($user->role_id, $code, $mode);
    }

    public function update(User $user, $code, $mode)
    {
        return checkPermission($user->role_id, $code, $mode);
    }

    public function delete(User $user, $code, $mode)
    {
        return checkPermission($user->role_id, $code, $mode);
    }
}
