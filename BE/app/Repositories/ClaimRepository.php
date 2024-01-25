<?php

namespace App\Repositories;

use App\Models\Claim;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClaimRepository
{
    public function create(array $request)
    {
        return Claim::create($request);
    }

    public function getClaims($searchParams, $paginate = true)
    {
        $sql = Claim::join('customers', 'customers.id', 'claims.customer_id')
            ->select([
                'claims.id as claim_id',
                'claim_no',
                'reference_no',
                'price',
                'issue_date',
                'customer_id',
                'customers.name',
                'claims.created_at',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('claims.reference_no', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('claims.claim_no', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['claim_id']) && is_array($searchParams['claim_id'])) {
            $sql->whereIn('claims.id', $searchParams['claim_id']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('claims.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('claims.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('claims.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function countAllClaims()
    {
        return Claim::count();
    }

    public function getClaimDetail($claimId)
    {
        return Claim::with([
            'customer' => function ($query) {
                $query->select('id', 'name', 'phone_number', 'email', 'address', 'company_name', 'postal_code');
            }
        ])->select([
            'id',
            'claim_no',
            'reference_no',
            'customer_id',
            'price',
            'issue_date',
            'created_at',
        ])->where('id', $claimId)->first();
    }

    public function delete($claimId)
    {
        return Claim::where('id', $claimId)->delete();
    }

    public function multiDeleteClaims($claimId)
    {
        return Claim::whereIn('id', $claimId)->delete();
    }

    public function findClaimDeleted($claimId)
    {
        return Claim::onlyTrashed()->where('id', $claimId)->first();
    }

    public function findClaimMultiDeleted($claimId)
    {
        return Claim::onlyTrashed()->whereIn('id', $claimId)->get();
    }

    public function update($claimId, $updateData)
    {
        return Claim::where('id', $claimId)->update($updateData);
    }
}
