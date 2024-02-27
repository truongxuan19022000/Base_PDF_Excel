<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\ClaimLogsRepository;
use App\Repositories\ClaimProgressRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\ClaimRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class ClaimService
{
    private $claimRepository;
    private $customerRepository;
    private $activityRepository;
    private $claimProgressRepository;
    private $claimLogsRepository;

    public function __construct(
        ClaimRepository $claimRepository,
        CustomerRepository $customerRepository,
        ActivityRepository $activityRepository,
        ClaimProgressRepository $claimProgressRepository,
        ClaimLogsRepository $claimLogsRepository
    ) {
        $this->claimRepository = $claimRepository;
        $this->customerRepository = $customerRepository;
        $this->activityRepository = $activityRepository;
        $this->claimProgressRepository = $claimProgressRepository;
        $this->claimLogsRepository = $claimLogsRepository;
    }

    public function getClaims($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }

        $claims = $this->claimRepository->getClaims($searchParams,$paginate);
        $results = [
            'claims' => $claims
        ];

        return $results;
    }

    public function getClaimById($claimId)
    {
        $claim = $this->claimRepository->getClaimDetail($claimId);
        $results = [
            'claim' => $claim,
        ];

        return $results;
    }

    public function getClaimProgress($credentials)
    {
        try {
            $results = $this->claimProgressRepository->getClaimProgress($credentials);
            return $results;
        } catch (\Exception $e) {
            Log::error('CLASS "ClaimService" FUNCTION "getClaimProgress" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getClaimByQuotationId($claim_id)
    {
        $results = $this->claimRepository->getClaimByQuotationId($claim_id);
        return $results;
    }

    public function delete($claimId)
    {
        try {
            $result = $this->claimRepository->delete($claimId);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'claim_id'     => $claimId,
                'type'         => Activity::TYPE_CLAIM,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_DELETED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ClaimService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteClaims($claimIds)
    {
        try {
            $result = $this->claimRepository->multiDeleteClaims($claimIds);
            if (!$result) {
                return false;
            }
            foreach ($claimIds as $id) {
                $user = Auth::guard('api')->user();
                $activity_logs = [
                    'claim_id'     => $id,
                    'type'         => Activity::TYPE_CLAIM,
                    'user_id'      => $user->id,
                    'action_type'  => Activity::ACTION_DELETED,
                    'created_at'   => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ClaimService" FUNCTION "multiDeleteClaim" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $user = Auth::guard('api')->user();
            $claim = [
                'claim_no' => $credentials['claim_no'],
                'quotation_id' =>  $credentials['quotation_id'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'created_at' => Carbon::now(),
            ];
            $result = $this->claimRepository->create($claim);


            $activity_logs = [
                'claim_id'     => $result->id,
                'type'         => Activity::TYPE_CLAIM,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => Carbon::now()
            ];
            $this->activityRepository->create($activity_logs);
            // make claim progress by quotation
            $quotations = $this->claimRepository->getClaimByQuotationId($result->id)->quotation;
            foreach ($quotations->quotation_sections as $quotation_section)
            {
                foreach ($quotation_section->products as $product)
                {
                    // create product
                    $product_progress_data = [
                        'quotation_section_id' => $quotation_section->id,
                        'product_id' => $product->id,
                        'claim_number' => $credentials['claim_no'],
                        'claim_percent' => 0,
                        'current_amount' => 0,
                        'previous_amount' => 0,
                        'accumulative_amount' => 0,
                        'created_at'   => Carbon::now()
                    ];
                    $claim_progress = $this->claimProgressRepository->create($product_progress_data);
                    $claim_log_data = [
                        'claim_id' => $result->id,
                        'claim_progress_id' => $claim_progress->id,
                         'created_at'   => Carbon::now()
                    ];
                    $this->claimLogsRepository->create($claim_log_data);
                }
            }
            foreach ($quotations->other_fees as $fee) {
                $fee_data = [
                    'other_fee_id' => $fee->id,
                    'claim_number' => 1,
                    'claim_percent' => 0,
                    'current_amount' => 0,
                    'previous_amount' => 0,
                    'accumulative_amount' => 0,
                    'created_at'   => Carbon::now(),
                ];
                $claim_progress = $this->claimProgressRepository->create($fee_data);
                $claim_log_data = [
                    'claim_id' => $result->id,
                    'claim_progress_id' => $claim_progress->id
                ];
                $this->claimLogsRepository->create($claim_log_data);
            }

            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "createClaim" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function copyClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $user = Auth::guard('api')->user();
            $claim = [
                'claim_no' => $credentials['claim_no'],
                'quotation_id' =>  $credentials['quotation_id'],
                'previous_claim_no' => $credentials['previous_claim_no'],
                'issue_date' => !empty($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'created_at' => Carbon::now(),
            ];
            $result = $this->claimRepository->create($claim);
            $this->claimRepository->update($credentials['claim_id'], ['is_copied' => 1]);

            $activity_logs = [
                'claim_id'     => $result->id,
                'type'         => Activity::TYPE_CLAIM,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => Carbon::now()
            ];
            $this->activityRepository->create($activity_logs);
            // make claim progress by quotation
            $claim_logs = $this->claimLogsRepository->getClaimLogByClaimId($credentials['claim_id']);
            foreach ($claim_logs as $claim_log) {
                $claim_progress = $this->claimProgressRepository->getClaimProgressByClaimLog($claim_log->claim_progress_id);
                $claim_log_data = [
                    'claim_id' => $result->id,
                ];
                if (!empty($claim_progress->product_id)) {
                    $product_progress_data = [
                        'quotation_section_id' => $claim_progress->quotation_section_id,
                        'product_id' => $claim_progress->product_id,
                        'claim_number' => $credentials['previous_claim_no'],
                        'claim_percent' => 0,
                        'current_amount' => 0,
                        'previous_amount' => $claim_progress['accumulative_amount'],
                        'accumulative_amount' => 0,
                        'created_at'   => Carbon::now()
                    ];
                    $claim_progress = $this->claimProgressRepository->create($product_progress_data);
                    $claim_log_data['claim_progress_id'] = $claim_progress->id;
                    $this->claimLogsRepository->create($claim_log_data);
                } else {
                    $fee_data = [
                        'other_fee_id' => $claim_progress->other_fee_id,
                        'claim_number' => $credentials['previous_claim_no'],
                        'claim_percent' => 0,
                        'current_amount' => 0,
                        'previous_amount' => $claim_progress['accumulative_amount'],
                        'accumulative_amount' => 0,
                        'created_at'   => Carbon::now(),
                    ];
                    $claim_progress = $this->claimProgressRepository->create($fee_data);
                    $claim_log_data['claim_progress_id'] = $claim_progress->id;
                    $this->claimLogsRepository->create($claim_log_data);
                }
                $claim_log_data['claim_progress_id'] = $claim_log->claim_progress_id;
                $this->claimLogsRepository->create($claim_log_data);
            }

            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "createClaim" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateClaim($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'claim_no' => $credentials['claim_no'],
                'reference_no' => $credentials['reference_no'],
                'customer_id' =>  $credentials['customer_id'],
                'price' =>  $credentials['price'],
                'issue_date' => $credentials['issue_date'],
                'updated_at' => Carbon::now(),
            ];

            $result = $this->claimRepository->update($credentials['claim_id'], $updateData);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'claim_id'     => $credentials['claim_id'],
                'type'         => Activity::TYPE_CLAIM,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_UPDATED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateClaim" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateClaimProgress($credentials)
    {
        try {
            DB::beginTransaction();
            $claim_progress_id = $credentials['claim_progress_id'];
            $credentials['updated_at'] = Carbon::now();
            unset($credentials['claim_progress_id']);
            $result = $this->claimProgressRepository->update($claim_progress_id, $credentials);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "updateClaimProgress" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function checkExistClaim($quotationId)
    {
        try {
            $result = $this->claimRepository->checkExistClaim($quotationId);
            if (!$result) {
                return false;
            }
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ClaimService" FUNCTION "checkExistClaim" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
