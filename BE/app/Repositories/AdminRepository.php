<?php

namespace App\Repositories;
use App\Models\User;

class AdminRepository
{
    public function getAdminInformation($email)
    {
        return User::where('email', $email)->first();
    }

    public function updateAdmin($userId, $updateData)
    {
        return User::where('id', $userId)->update($updateData);
    }

    public function getAdminByResetToken($resetToken, $currentTime)
    {
        return User::where('reset_password_token', $resetToken)
            ->where('token_expires_time', '>=', $currentTime)
            ->first();
    }
}
