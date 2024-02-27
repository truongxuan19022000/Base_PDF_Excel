<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\OtherFeeRepository;
use App\Repositories\QuotationRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OtherFeeService
{
    private $otherFeeRepository;
    private $activityRepository;
    /**
     * @var QuotationRepository
     */
    private $quotationRepository;

    public function __construct(
        OtherFeeRepository $otherFeeRepository,
        ActivityRepository $activityRepository,
        QuotationRepository $quotationRepository
    )
    {
        $this->otherFeeRepository = $otherFeeRepository;
        $this->activityRepository = $activityRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getOtherFees($quotationId)
    {
        $other_fees = $this->otherFeeRepository->getOtherFeeForQuotation($quotationId);

        $results = [
            'other_fees' => $other_fees,
        ];

        return $results;
    }

    public function handleOtherFees($credentials)
    {
        try {
            DB::beginTransaction();
            //delete
            if (!empty($credentials['delete'])) {
                $other_fee = $this->otherFeeRepository->multiDeleteOtherFee($credentials['delete']);
                if (!empty($other_fee)) {
                    foreach ($credentials['delete'] as $other_fee_id) {
                        $this->insertOtherFeeActivity($credentials['quotation_id'], Activity::ACTION_DELETED, $other_fee_id);
                    }
                }

            }

            //create
            foreach ($credentials['create'] as $createData) {
                $createData['quotation_id'] = $credentials['quotation_id'];
                $other_fee = $this->otherFeeRepository->create($createData);
                if ($other_fee) {
                    $this->insertOtherFeeActivity($credentials['quotation_id'], Activity::ACTION_CREATED, $other_fee['id']);
                }
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $other_fee_id = $updateData['id'];
                unset($updateData['id']);
                $updateData['quotation_id'] = $credentials['quotation_id'];
                $other_fee = $this->otherFeeRepository->update($other_fee_id, $updateData);
                if (!empty($other_fee)) {
                    $this->insertOtherFeeActivity($credentials['quotation_id'], Activity::ACTION_UPDATED, $other_fee_id);
                }
            }

            $result = $this->otherFeeRepository->getOtherFeeForQuotation($credentials['quotation_id']);
            $total_fees = 0;
            foreach ($result as $other_fee) {
                if ($other_fee->type == 2) {
                    $total_fees += $other_fee->amount;
                }
            }
            $quotation = $this->quotationRepository->getQuotationDetail($credentials['quotation_id']);
            $grand_total = floatval($quotation->amount) + floatval($total_fees);
            $this->quotationRepository->update($credentials['quotation_id'], ['price' => $grand_total]);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "OtherFeeService" FUNCTION "handleOtherFees" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function insertOtherFeeActivity($quotation_id, $action, $other_fee_id)
    {
        try {
            $quotation = $this->quotationRepository->getQuotationDetail($quotation_id);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $quotation->customer_id,
                'quotation_id' => $quotation->id,
                'other_fee_id' => $other_fee_id,
                'type' => Activity::TYPE_OTHER_FEES,
                'user_id' => $user->id,
                'action_type' => $action,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
        } catch (\Exception $e) {
            Log::error('CLASS "OtherFeeService" FUNCTION "handleOtherFees" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function deleteAllOtherFees($quotationId)
    {
        try {
            $result = $this->otherFeeRepository->deleteAllByQuotationId($quotationId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "OtherFeeService" FUNCTION "deleteAllOtherFees" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function updateOrderNumber($credentials)
    {
        try {
            $result = false;
            foreach ($credentials['other_fees'] as $updateData) {
                $other_fee_id = $updateData['other_fee_id'];
                unset($updateData['other_fee_id']);
                $result = $this->otherFeeRepository->update($other_fee_id, $updateData);
            }

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "OtherFeeService" FUNCTION "updateOrderNumber" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }
}
