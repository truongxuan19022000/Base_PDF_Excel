<?php

namespace App\Repositories;

use App\Models\Quotation;
use Illuminate\Support\Facades\DB;

class QuotationRepository
{
    public function create(array $request)
    {
        return Quotation::create($request);
    }

    public function getQuotationsByCustomerId($customerId)
    {
        return Quotation::select([
            'id',
            'reference_no',
            'status',
            'created_at'
        ])->where('customer_id', $customerId)->get();
    }

    public function getQuotations($searchParams, $paginate = true)
    {
        $sql = Quotation::join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'quotations.id',
                'quotations.reference_no',
                'customers.name',
                'quotations.status',
                'quotations.issue_date',
                'quotations.price as amount',
                'quotations.created_at'
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['quotation_id']) && is_array($searchParams['quotation_id'])) {
            $sql->whereIn('quotations.id', $searchParams['quotation_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('quotations.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->whereIn('quotations.status', $searchParams['status']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('quotations.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('quotations.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('quotations.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getAllQuotationsForInvoices($conditions)
    {
        $sql = Quotation::join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'quotations.id',
                'quotations.reference_no',
                'quotations.price',
                'quotations.description',
                'customers.id as customer_id',
                'customers.name'
            ])->where('quotations.price','<>', null)
                ->where('quotations.price', '>', 0);
        return $sql->orderBy('quotations.created_at', 'desc')->get();
    }

    public function countQuotationsNew()
    {
        list($start, $end) = getFirstAndLastDay();
        return Quotation::whereBetween('created_at', [$start, $end])->count();
    }

    public function countQuotationsPartial()
    {
        return Quotation::where('status', config('quotation.status.partial_payment'))->count();
    }

    public function countQuotationsPaid()
    {
        return Quotation::where('status', config('quotation.status.paid'))->count();
    }

    public function countAllQuotations()
    {
        return Quotation::count();
    }

    public function getQuotationDetail($quotationId)
    {
        return Quotation::with([
            'customer' => function ($query) {
                $query->select('id', 'name', 'phone_number', 'email', 'address', 'company_name', 'postal_code');
            }
        ])->select([
            'id',
            'reference_no',
            'quotations.status as payment_status',
            'created_at',
            'issue_date',
            'valid_till',
            'description',
            'terms_of_payment_confirmation',
            'terms_of_payment_balance',
            'quotations.price as amount',
            'discount_amount',
            'discount_type',
            'customer_id',
        ])->withCount(['claims as claim_use'])
            ->withCount(['invoices as invoice_use'])
            ->where('id', $quotationId)->first();
    }

    public function delete($quotationId)
    {
        return Quotation::where('id', $quotationId)->delete();
    }

    public function multiDeleteQuotation($quotationId)
    {
        return Quotation::whereIn('id', $quotationId)->delete();
    }

    public function findQuotationDeleted($quotationId)
    {
        return Quotation::onlyTrashed()->where('id', $quotationId)->first();
    }

    public function findQuotationMultiDeleted($quotationId)
    {
        return Quotation::onlyTrashed()->whereIn('id', $quotationId)->get();
    }

    public function update($quotationId, $updateData)
    {
        return Quotation::where('id', $quotationId)->update($updateData);
    }

    public function estimatedRevenue($start, $end, $status)
    {
        return Quotation::where('status', config("quotation.status.$status"))
            ->whereBetween('issue_date', [$start, $end])
            ->sum('price');
    }

    public function getQuotationsByCustomer($searchParams, $paginate = true, $customerId)
    {
        $sql = Quotation::join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'quotations.id',
                'quotations.reference_no',
                'customers.name',
                'quotations.status',
                'quotations.created_at'
            ])->where('quotations.customer_id', $customerId)
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['quotation_id']) && is_array($searchParams['quotation_id'])) {
            $sql->whereIn('quotations.id', $searchParams['quotation_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('quotations.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->whereIn('quotations.status', $searchParams['status']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('quotations.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('quotations.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('quotations.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getDiscountAndOtherFeeOfQuotation($quotationId) {
        return Quotation::with([
            'other_fees' => function($query) {
                $query->select('quotation_id', 'description', 'amount', 'type');
            }
        ])->select([
            'id',
            'discount_amount',
            'discount_type',
        ])->where('id', $quotationId)->first();
    }
}
