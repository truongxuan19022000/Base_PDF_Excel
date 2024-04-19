<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\VendorRepository;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class VendorService
{
    private $vendorRepository;
    private $activityRepository;

    public function __construct(
        VendorRepository $vendorRepository,
        ActivityRepository $activityRepository
    ) {
        $this->vendorRepository = $vendorRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getVendors($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $vendors = $this->vendorRepository->getVendors($searchParams, $paginate);

        $results = [
            'vendors' => $vendors,
        ];

        return $results;
    }

    public function checkEmailExists($email)
    {
        $vendor = $this->vendorRepository->getVendorInformation($email);
        return [
            'status' => !is_null($vendor),
            'data' => $vendor
        ];
    }

    public function createVendor($credentials)
    {
        try {
            $vendor = [
                'vendor_name' => $credentials['vendor_name'],
                'email' => $credentials['email'],
                'phone' => $credentials['phone'],
                'address' => json_encode([
                    'address_1' => $credentials['address_1'],
                    'address_2' => $credentials['address_2'],
                ]),
                'postal_code' => $credentials['postal_code'],
                'company_name' => isset($credentials['company_name']) ? $credentials['company_name'] : '',
                'status' => config('vendor.status.new'),
                'created_at' => Carbon::now(),
            ];
            $result = $this->vendorRepository->create($vendor);

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'vendor_id'     => $result->id,
                'type'          => Activity::TYPE_VENDOR,
                'user_id'       => $user->id,
                'action_type'   => Activity::ACTION_CREATED,
                'created_at'    => $vendor['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "VendorService" FUNCTION "createVendor" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function getVendorDetail($vendorId)
    {
        $vendor = $this->vendorRepository->getVendorDetail($vendorId);
        $activities = $this->activityRepository->getActivities(['vendor_id' => $vendorId]);
        $results = [
            'vendor' => $vendor,
            'activities' => $activities,
        ];

        return $results;
    }

    public function updateVendor($credentials)
    {
        try {
            $updateData = [
                'vendor_name' => $credentials['vendor_name'],
                'email' => $credentials['email'],
                'phone' => $credentials['phone'],
                'address' => json_encode([
                    'address_1' => $credentials['address_1'],
                    'address_2' => $credentials['address_2'],
                ]),
                'postal_code' => $credentials['postal_code'],
                'company_name' => isset($credentials['company_name']) ? $credentials['company_name'] : '',
                'updated_at' => now()
            ];

            $result = $this->vendorRepository->update($credentials['vendor_id'], $updateData);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'vendor_id'     => $credentials['vendor_id'],
                'type'          => Activity::TYPE_VENDOR,
                'user_id'       => $user->id,
                'action_type'   => Activity::ACTION_UPDATED,
                'created_at'    => $updateData['updated_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "VendorService" FUNCTION "updateVendor" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function delete($vendorId)
    {
        try {
            $result = $this->vendorRepository->delete($vendorId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "VendorService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteVendor($vendorId)
    {
        try {
            $result = $this->vendorRepository->multiDeleteVendor($vendorId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "VendorService" FUNCTION "multiDeleteVendor" ERROR: ' . $e->getMessage());
        }
        return false;
    }
}


