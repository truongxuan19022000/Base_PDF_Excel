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
        $sql = Claim::join('quotations', 'quotations.id', 'claims.quotation_id')
            ->join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'claims.id as claim_id',
                'claim_no',
                'quotations.reference_no',
                'quotations.price as amount',
                'quotations.status',
                'claims.issue_date',
                'payment_received_date',
                'previous_claim_no',
                'is_copied',
                'customers.name',
                'claims.created_at',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%' . $searchParams['search'] . '%')
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
        return Claim::join('quotations', 'quotations.id', 'claims.quotation_id')
            ->join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'claims.id as claim_id',
                'claim_no',
                'quotations.id as quotation_id',
                'quotations.reference_no',
                'quotations.price as amount',
                'quotations.status',
                'quotations.description',
                'claims.issue_date',
                'payment_received_date',
                'previous_claim_no',
                'is_copied',
                'customers.name',
                'customers.email',
                'customers.phone_number',
                'customers.address',
                'customers.postal_code',
                'customers.company_name',
                'claims.created_at',
        ])->where('claims.id', $claimId)->first();
    }

    public function getClaimByCustomerId($customerId)
    {
        return Claim::join('quotations', 'claims.quotation_id', 'quotations.id')
        ->select([
            'claims.id',
            'claim_no',
            'quotation_id',
            'quotations.reference_no',
            'claims.issue_date',
            'payment_received_date',
            'deposit_amount',
            'total_from_claim',
            'is_copied',
            'previous_claim_no',
            'claims.created_at',
        ])->where('quotations.customer_id', $customerId)->get();
    }

    public function getClaimByCustomer($searchParams, $paginate = true, $customerId)
    {
        $sql = Claim::join('quotations', 'claims.quotation_id', 'quotations.id')
            ->select([
                'claims.id',
                'claim_no',
                'quotation_id',
                'quotations.reference_no',
                'claims.issue_date',
                'is_copied',
                'claims.created_at',
            ])->where('customer_id', $customerId)
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->where('claim_no', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });;

        if (isset($searchParams['claim_id']) && is_array($searchParams['claim_id'])) {
            $sql->whereIn('claims.id', $searchParams['claim_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('quotations.customer_id', $searchParams['customer_id']);
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

    public function getClaimByQuotationId($claim_id)
    {
        return Claim::with([
            'quotation' => function ($query) {
                $query->select(
                    'id', 'reference_no'
                );
                $query->with([
                    'quotation_sections' => function($qr) {
                        $qr->select(
                            'id', 'order_number', 'section_name', 'quotation_id'
                        );
                        $qr->orderBy('quotation_sections.order_number', 'ASC');
                        $qr->with([
                            'products' => function($p) {
                                $p->select(
                                    'products.id',
                                    'quotation_section_id',
                                    'order_number',
                                    'product_code',
                                    'profile',
                                    'glass_type',
                                    'storey',
                                    'area',
                                    'width',
                                    'width_unit',
                                    'height',
                                    'height_unit',
                                    'quantity',
                                    'subtotal',
                                );
                                $p->orderBy('products.order_number', 'ASC');
                                $p->with([
                                    'claim_progress' => function ($qr) {
                                        $qr->select('id', 'product_id', 'claim_number', 'claim_percent', 'current_amount', 'previous_amount', 'accumulative_amount');
                                    }
                                ]);
                            }
                        ]);
                    },
                ]);
                $query->with([
                    'other_fees' => function($qr) {
                        $qr->select(
                            'id',
                            'quotation_id',
                            'order_number',
                            'description',
                            'amount',
                            'type',
                        );
                        $qr->with([
                            'claim_progress' => function ($qr) {
                                $qr->select('id', 'other_fee_id', 'claim_number', 'claim_percent', 'current_amount', 'previous_amount', 'accumulative_amount');
                            }
                        ]);
                    }
                ]);
            },
        ])->where('claims.id', $claim_id)->first();
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

    public function checkExistClaim($quotationId)
    {
        return Claim::where('quotation_id', $quotationId)->exists();
    }
}
