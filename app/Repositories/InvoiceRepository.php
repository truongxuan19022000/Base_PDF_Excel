<?php

namespace App\Repositories;
use App\Models\Invoice;

class InvoiceRepository
{
    public function create(array $request)
    {
        return Invoice::create($request);
    }

    public function getInvoicesByCustomerId($customerId)
    {
        return Invoice::join('quotations', 'invoices.quotation_id', 'quotations.id')
            ->select([
                'invoices.id',
                'invoices.invoice_no',
                'quotations.reference_no',
                'invoices.created_at',
                'quotations.status',
            ])->where('customer_id', $customerId)->get();
    }

    public function getInvoices($searchParams, $paginate = true)
    {
        $sql = Invoice::join('quotations', 'invoices.quotation_id', 'quotations.id')
            ->join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'invoices.id',
                'invoices.invoice_no',
                'quotations.reference_no',
                'invoices.created_at',
                'customers.name as customer_name',
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('invoices.invoice_no', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['invoice_id']) && is_array($searchParams['invoice_id'])) {
            $sql->whereIn('invoices.id', $searchParams['invoice_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('quotations.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('invoices.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('invoices.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('invoices.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getInvoiceDetail($invoiceid, $conditions=null)
    {
        return Invoice::select([
            'id',
            'invoice_no',
            'created_at',
            'quotation_id'
        ])->with([
            'quotation' => function ($query) use ($conditions) {
                $query->join('customers', 'customers.id', 'quotations.customer_id')
                    ->select([
                        'quotations.id',
                        'quotations.reference_no',
                        'quotations.price',
                        'quotations.description',
                        'customers.id as customer_id',
                        'customers.name'
                    ])->where(function ($query) use ($conditions) {
                        $query->where('quotations.status', $conditions['status'])
                            ->whereNotNull('quotations.price');
                    });
            }
        ])->where('id', $invoiceid)->first();
    }

    public function getInvoiceOverview($invoiceid)
    {
        return Invoice::select([
                'id',
                'invoice_no',
                'created_at',
                'quotation_id'
            ])
            ->with([
                'quotation' => function($query) {
                    $query->select('id', 'reference_no', 'customer_id');
                },
                'quotation.customer' => function($query) {
                    $query->select('id', 'name', 'phone_number', 'email', 'address', 'company_name');
                }
            ])->where('id', $invoiceid)->first();
    }

    public function delete($invoiceId)
    {
        return Invoice::where('id', $invoiceId)->delete();
    }

    public function multiDeleteInvoice($invoiceId)
    {
        return Invoice::whereIn('id', $invoiceId)->delete();
    }

    public function findInvoiceDeleted($invoiceId)
    {
        return Invoice::onlyTrashed()->join('quotations', 'invoices.quotation_id', 'quotations.id')
                ->select([
                    'invoices.*',
                    'quotations.customer_id',
                ])
                ->where('invoices.id', $invoiceId)
                ->first();
    }

    public function findInvoiceMultiDeleted($invoiceId)
    {
        return Invoice::onlyTrashed()->join('quotations', 'invoices.quotation_id', 'quotations.id')
                ->select([
                    'invoices.*',
                    'quotations.customer_id',
                ])
                ->whereIn('invoices.id', $invoiceId)
                ->get();
    }

    public function update($invoiceId, $updateData)
    {
        return Invoice::where('id', $invoiceId)->update($updateData);
    }

    public function getInvoicesByCustomer($searchParams, $paginate = true, $customerId)
    {
        $sql = Invoice::join('quotations', 'invoices.quotation_id', 'quotations.id')
            ->join('customers', 'customers.id', 'quotations.customer_id')
            ->select([
                'invoices.id',
                'invoices.invoice_no',
                'quotations.reference_no',
                'invoices.created_at',
                'customers.name as customer_name',
            ])->where('quotations.customer_id', $customerId)
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['invoice_id']) && is_array($searchParams['invoice_id'])) {
            $sql->whereIn('invoices.id', $searchParams['invoice_id']);
        }

        if (isset($searchParams['customer_id'])) {
            $sql->where('quotations.customer_id', $searchParams['customer_id']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('invoices.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('invoices.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('invoices.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }
}
