<?php

namespace App\Services;
use App\Repositories\AdminRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AdminService
{
    private $adminRepository;

    public function __construct(AdminRepository $adminRepository)
    {
        $this->adminRepository = $adminRepository;
    }
    public function checkEmailExists($email)
    {
        $admin = $this->adminRepository->getAdminInformation($email);

        return [
            'status' => !is_null($admin),
            'data' => $admin
        ];
    }

    public function storeResetTokenPassword($adminId, $resetToken) {
        $updateData['reset_password_token'] = $resetToken;
        $updateData['token_expires_time'] = Carbon::now()->addMinutes(config('common.reset_token_expires_time'));
        $updateData['updated_at'] = Carbon::now();
        try {
            $this->adminRepository->updateAdmin($adminId, $updateData);
            return [
                'status' => true,
            ];
        } catch (\Exception $exception) {
            Log::error('CLASS "AdminService" FUNCTION "storeResetTokenPassword" ERROR: ' . $exception->getMessage());
        }

        return [
            'status' => false,
        ];
    }

    public function getAdminByResetToken($resetToken)
    {
        $currentTime = Carbon::now();
        $admin = $this->adminRepository->getAdminByResetToken($resetToken, $currentTime);
        return $admin;
    }

    public function recoverPassword($adminId, $password)
    {
        try {
            $hashPassword = Hash::make($password);
            $this->adminRepository->updateAdmin($adminId, [
                'reset_password_token' => null,
                'token_expires_time' => null,
                'password' => $hashPassword,
                'updated_at' => Carbon::now(),
            ]);
            return [
                'status' => true,
            ];
        } catch (\Exception $exception) {
            Log::error('CLASS "AdminService" FUNCTION "recoverPassword" ERROR: ' . $exception->getMessage());
        }

        return [
            'status' => false
        ];
    }
}