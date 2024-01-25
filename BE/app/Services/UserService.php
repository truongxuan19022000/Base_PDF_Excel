<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UserService
{
    private $userRepository;

    public function __construct(
        UserRepository $userRepository
    ) {
        $this->userRepository = $userRepository;
    }

    public function getUsers($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $users = $this->userRepository->getUsers($searchParams, $paginate);

        $results = [
            'users' => $users
        ];

        return $results;
    }

    public function createUser($credentials)
    {
        try {
            $user = [
                'name' => $credentials['name'],
                'role_id' => $credentials['role_id'],
                'username' => $credentials['username'],
                'password' => \Illuminate\Support\Facades\Hash::make($credentials['password']),
                'email' => $credentials['email'],
                'profile_picture' => $credentials['profile_picture'] ?? null,
                'created_at' => Carbon::now(),
            ];
            $result = $this->userRepository->create($user);
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "UserService" FUNCTION "createUser" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function getUserDetail($userId)
    {
        return $this->userRepository->getUserDetail($userId);
    }

    public function updateUser($credentials)
    {
        try {
            $updateData = [
                'name' => $credentials['name'],
                'role_id' => $credentials['role_id'],
                'username' => $credentials['username'],
                'email' => $credentials['email'],
                'updated_at' => Carbon::now(),
            ];

            if (isset($credentials['profile_picture'])) {
                $updateData['profile_picture'] = $credentials['profile_picture'];
            }

            if (isset($credentials['is_remove_picture']) && $credentials['is_remove_picture'] == 1) {
                $updateData['profile_picture'] = null;
            }

            if (isset($credentials['password'])) {
                $updateData['password'] = \Illuminate\Support\Facades\Hash::make($credentials['password']);
            }

            $result = $this->userRepository->update($credentials['user_id'], $updateData);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "UserService" FUNCTION "updateUser" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function delete($userId)
    {
        try {
            $result = $this->userRepository->delete($userId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "UserService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function multiDeleteUser($userId)
    {
        try {
            $result = $this->userRepository->multiDeleteUser($userId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "UserService" FUNCTION "multiDeleteUser" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
