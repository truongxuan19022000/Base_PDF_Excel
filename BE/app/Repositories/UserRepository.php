<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function create(array $request)
    {
        return User::create($request);
    }

    public function getUsers($searchParams, $paginate = true)
    {
        $sql = User::leftJoin('roles', 'roles.id', 'users.role_id')
            ->select([
                'users.id',
                'users.name',
                'users.username',
                'users.email',
                'roles.role_name',
                'roles.id as role_id',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('users.name', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('users.username', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('users.email', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('roles.role_name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['user_id']) && is_array($searchParams['user_id'])) {
            $sql->whereIn('users.id', $searchParams['user_id']);
        }

        if (isset($searchParams['role_id']) && is_array($searchParams['role_id'])) {
            $sql->whereIn('roles.id', $searchParams['role_id']);
        }

        if (isset($searchParams['sort_name']) && in_array($searchParams['sort_name'], ['asc', 'desc'])) {
            $sql->orderBy('users.name', $searchParams['sort_name']);
        } else {
            $sql->orderBy('users.created_at', 'DESC');
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getUserDetail($userId)
    {
        return User::leftJoin('roles', 'roles.id', 'users.role_id')
            ->select([
                'users.id',
                'users.name',
                'users.username',
                'users.email',
                'users.profile_picture',
                'roles.role_name',
                'roles.id as role_id',
            ])->where('users.id', $userId)->first();
    }

    public function update($userId, $updateData)
    {
        return User::where('id', $userId)->update($updateData);
    }

    public function delete($userId)
    {
        return User::where('id', $userId)->delete();
    }

    public function multiDeleteUser($userId)
    {
        return User::whereIn('id', $userId)->delete();
    }
}
