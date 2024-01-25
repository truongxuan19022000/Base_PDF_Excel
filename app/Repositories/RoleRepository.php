<?php

namespace App\Repositories;

use App\Models\Role;

class RoleRepository
{
    public function create(array $request)
    {
        return Role::create($request);
    }

    public function getRoles($searchParams, $paginate = true)
    {
        $sql = Role::select([
                'roles.id',
                'roles.role_name',
            ])
            ->withCount('users as number_user')
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('roles.role_name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['role_id']) && is_array($searchParams['role_id'])) {
            $sql->whereIn('roles.id', $searchParams['role_id']);
        }

        if (!$paginate) {
            return $sql->get();
        }
        return $sql->paginate(config('common.paginate'));
    }

    public function update($roleId, $updateData)
    {
        return Role::where('id', $roleId)->update($updateData);
    }

    public function delete($roleId)
    {
        return Role::where('id', $roleId)->delete();
    }

    public function getRoleList()
    {
        return Role::select([
                'id',
                'role_name'
            ])->get();
    }

    public function multiDeleteRole($roleId)
    {
        return Role::whereIn('id', $roleId)->delete();
    }

    public function getRoleById($roleId)
    {
        return Role::where('id', $roleId)->first();
    }
}
