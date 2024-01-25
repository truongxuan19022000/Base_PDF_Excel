<?php

namespace App\Services;

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

    public function __construct(
        ClaimRepository $claimRepository,
        CustomerRepository $customerRepository
    ) {
        $this->claimRepository = $claimRepository;
        $this->customerRepository = $customerRepository;
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

    public function delete($claimId)
    {
        try {
            $result = $this->claimRepository->delete($claimId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ClaimService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteClaims($claimId)
    {
        try {
            $result = $this->claimRepository->multiDeleteClaims($claimId);
            if (!$result) {
                return false;
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
                'reference_no' => $credentials['reference_no'],
                'customer_id' =>  $credentials['customer_id'],
                'price' =>  $credentials['price'],
                'issue_date' => $credentials['issue_date'],
                'created_at' => Carbon::now(),
            ];
            $result = $this->claimRepository->create($claim);
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
}
