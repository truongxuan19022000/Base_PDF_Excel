<?php

use Illuminate\Support\Str;
use App\Models\RolePermission;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

if (!function_exists('generateResetPasswordToken')) {
    function generateResetPasswordToken()
    {
        return Str::random(config('common.generate_password_token_character_number'));
    }
}

if (!function_exists('uploadImage')) {
    function uploadImage($image, $baseUrl)
    {
        try {
            $filePath = Storage::disk('s3')->put($baseUrl, $image, 'public');
            return config('filesystems.disks.s3.url') . $filePath;
        } catch (\Exception $e) {
            Log::error('FUNCTION "uploadImage" in helper: UserUploadImage' . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('checkPermission')) {
    function checkPermission($roleId, $code, $mode)
    {
        return RolePermission::join('permissions', 'permissions.id', 'role_permission.permission_id')
            ->where('role_permission.role_id', $roleId)
            ->where('permissions.code', $code)
            ->whereIn('role_permission.mode', $mode)
            ->exists();
    }
}

if (!function_exists('uploadToLocalStorage')) {
    function uploadToLocalStorage($file, $baseUrl)
    {
        try {
            $path = Storage::putFile("public/$baseUrl", $file);
            return Storage::url($path);
        } catch (\Exception $e) {
            Log::error('FUNCTION "uploadToLocalStorage" in helper: ' . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('getFirstAndLastDay')) {
    function getFirstAndLastDay($time = 'this_month')
    {
        switch ($time) {
            case 'this_month':
                $firstDay = Carbon::now()->startOfMonth();
                $lastDay = Carbon::now()->endOfMonth();
                break;

            case 'last_month':
                $firstDay = Carbon::now()->subMonth()->startOfMonth();
                $lastDay = Carbon::now()->subMonth()->endOfMonth();
                break;

            case 'this_year':
                $firstDay = Carbon::now()->startOfYear();
                $lastDay = Carbon::now()->endOfYear();
                break;

            case 'last_year':
                $firstDay = Carbon::now()->subYear()->startOfYear();
                $lastDay = Carbon::now()->subYear()->endOfYear();
                break;
        }

        return [$firstDay, $lastDay];
    }
}

if (!function_exists('getFirstAndLastDayPerMonth')) {
    function getFirstAndLastDayPerMonth($year = 'this_year')
    {
        $dates = [];
        $startYear = $year === 'last_year' ? Carbon::now()->subYear()->startOfYear() : Carbon::now()->startOfYear();
        $endYear = $startYear->copy()->endOfYear();

        for ($month = 1; $month <= 12; $month++) {
            $start = $startYear->copy()->month($month)->startOfMonth();
            $end = $startYear->copy()->month($month)->endOfMonth();
            if ($start->greaterThanOrEqualTo($startYear) && $end->lessThanOrEqualTo($endYear)) {
                $dates[$month] = [
                    'start' => $start->toDateString(),
                    'end' => $end->toDateString(),
                ];
            }
        }

        return $dates;
    }
}

if (!function_exists('replace_special_characters')) {
    function replace_special_characters($string)
    {
        return preg_replace('/[\\\\\/:*<>|"]/i', '_', $string);
    }
}

if (!function_exists('getPreviousClaims')) {
    function getPreviousClaims($claim)
    {
        $previousClaims = [];

        while ($claim->claim_copied) {
            $claim = $claim->claim_copied;
            $previousClaims[] = $claim;
        }

        return $previousClaims;
    }
}


