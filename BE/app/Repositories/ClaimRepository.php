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
                'actual_paid_amount',
                'quotations.id as quotation_id',
                'quotations.reference_no',
                'claims.status',
                'claims.issue_date',
                'payment_received_date',
                'is_copied',
                'customers.name',
                'claims.created_at',
            ])
            ->selectRaw('ROUND((claims.subtotal_from_claim + (claims.subtotal_from_claim * claims.tax / 100)), 2) as amount')
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('claims.claim_no', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['claim_id']) && is_array($searchParams['claim_id'])) {
            $sql->whereIn('claims.id', $searchParams['claim_id']);
        }
        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->whereIn('claims.status', $searchParams['status']);
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
            ->leftJoin('claims as claim_copied', 'claim_copied.id', 'claims.copied_claim_id')
            ->select([
                'claims.id as claim_id',
                'claims.claim_no',
                'claims.actual_paid_amount',
                'claims.tax',
                'claims.subtotal_from_claim',
                'quotations.id as quotation_id',
                'quotations.reference_no',
                'quotations.price as amount',
                'claims.status',
                'quotations.description',
                'quotations.customer_id',
                'claims.issue_date',
                'claims.payment_received_date',
                'claim_copied.claim_no as previous_claim_no',
                'claims.is_copied',
                'claims.copied_claim_id',
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
                'actual_paid_amount',
                'quotation_id',
                'quotations.reference_no',
                'claims.issue_date',
                'payment_received_date',
                'deposit_amount',
                'subtotal_from_claim',
                'is_copied',
                'claims.created_at',
            ])->where('quotations.customer_id', $customerId)->get();
    }

    public function getClaimByCustomer($searchParams, $paginate = true, $customerId)
    {
        $sql = Claim::join('quotations', 'claims.quotation_id', 'quotations.id')
            ->select([
                'claims.id',
                'claim_no',
                'actual_paid_amount',
                'quotation_id',
                'quotations.reference_no',
                'claims.issue_date',
                'claims.status',
                'claims.subtotal_from_claim',
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

        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->whereIn('claims.status', $searchParams['status']);
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
            'claim_progress',
            'quotation' => function ($query) {
                $query->select(
                    'id', 'reference_no', 'price as total_quotation_amount', 'terms_of_payment_confirmation', 'terms_of_payment_balance', 'customer_id', 'description', 'issue_date'
                );
                $query->with('customer');
                $query->with([
                    'quotation_sections' => function ($qr) {
                        $qr->select(
                            'id', 'order_number', 'claim_order_number', 'section_name', 'quotation_id'
                        );
                        $qr->orderByRaw('ISNULL(claim_order_number), claim_order_number, order_number ASC');
                        $qr->with([
                            'products' => function ($p) {
                                $p->select(
                                    'products.id',
                                    'quotation_section_id',
                                    'order_number',
                                    'claim_order_number',
                                    'product_code',
                                    'profile',
                                    'glass_type',
                                    'storey_text',
                                    'area_text',
                                    'width',
                                    'width_unit',
                                    'height',
                                    'height_unit',
                                    'quantity',
                                    'subtotal',
                                );
                                $p->orderByRaw('ISNULL(claim_order_number), claim_order_number, order_number ASC');
                            }
                        ]);
                    },
                ]);
                $query->with([
                    'other_fees' => function ($qr) {
                        $qr->select(
                            'id',
                            'quotation_id',
                            'order_number',
                            'claim_order_number',
                            'description',
                            'amount',
                            'type',
                        );
                        $qr->where('type', 2);
                        $qr->orderByRaw('ISNULL(claim_order_number), claim_order_number, order_number ASC');
                    }
                ]);
                $query->with([
                    'discount' => function ($qr) {
                        $qr->select(
                            'id', 'reference_no', 'discount_amount'
                        );
                    }
                ]);
            },
        ])->with('claim_copied')
            ->select([
                'claims.id',
                'claims.actual_paid_amount',
                'claims.copied_claim_id',
                'claims.claim_no',
                'claims.status',
                'claims.quotation_id',
                'claims.issue_date',
                'claims.payment_received_date',
                'claims.tax',
                'claims.accumulative_from_claim',
                'claims.subtotal_from_claim',
                'claims.is_copied',
            ])
            ->where('claims.id', $claim_id)->first();
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

    public function getTotalRevenue($start, $end, $status)
    {
        $sql = Claim::query();
        if ($status) {
            // paid
            $sql->whereBetween('payment_received_date', [$start, $end])->whereNotNull('payment_received_date');
        } else {
            //pending
            $sql->whereBetween('issue_date', [$start, $end])->whereNull('payment_received_date');
        }

        return $sql->sum(DB::raw('ROUND(subtotal_from_claim + (subtotal_from_claim * tax / 100), 2)'));
    }

    public function getTotalClaimAmount($start, $end)
    {
        $sql = Claim::whereNotNull('payment_received_date')
            ->whereBetween('payment_received_date', [$start, $end]);
        return $sql->sum(DB::raw('ROUND(subtotal_from_claim + (subtotal_from_claim * tax / 100), 2)'));
    }

    public function getTotalClaimAmountPerMonth($start, $end)
    {
        return Claim::selectRaw('MONTH(payment_received_date) as month, SUM(ROUND((subtotal_from_claim + (subtotal_from_claim * tax / 100)), 2)) as total_amount')
            ->whereNotNull('payment_received_date')
            ->whereBetween('payment_received_date', [$start, $end])
            ->groupByRaw('MONTH(payment_received_date)')
            ->get();
    }

    public function countNewClaim()
    {
        list($start, $end) = getFirstAndLastDay();
        return Claim::whereBetween('issue_date', [$start, $end])->count();
    }
}
