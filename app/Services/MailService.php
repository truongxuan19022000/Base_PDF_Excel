<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    public function renewPassword($user, $resetToken)
    {
        $subject = 'Multicontract-CRM password reset confirmation';
        try {
            $url =  config('common.mail.reset_pwd_url.admin') . '?token=' . $resetToken;
            Mail::send(
                'mail.forgot_password',
                [
                    'user' => $user,
                    'url' => $url
                ],
                function ($message) use ($user, $subject) {
                    $message->to($user->email)
                        ->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject($subject);
                });
            return ['status' => true];
        } catch (\Exception $exception) {
            Log::error('CLASS "MailService" FUNCTION "renewPassword" ERROR: ' . $exception->getMessage());
        }
        return ['status' => false];
    }

    public function sendMailUserDetail($user)
    {
        $subject = 'Your Account Log In Details';
        try {
            Mail::send(
                'mail.user_detail',
                [
                    'user' => $user
                ],
                function ($message) use ($user, $subject) {
                    $message->to($user['email'])
                        ->from(config('mail.from.address'), config('mail.from.name'))
                        ->subject($subject);
                });
                return ['status' => true];
        } catch (\Exception $exception) {
            Log::error('CLASS "MailService" FUNCTION "sendMailUserDetail" ERROR: ' . $exception->getMessage() . ' LINE: ' . $exception->getLine());
        }
        return [
            'status' => false
        ];
    }
}


