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
                'invoices.issue_date',
                'invoices.total_amount',
                'invoices.tax',
                'invoices.status',
                'invoices.payment_received_date',
                'quotations.reference_no',
                'customers.name as customer_name',
                'invoices.created_at',
            ])
            ->selectRaw('ROUND((invoices.total_amount + (invoices.total_amount * invoices.tax / 100)), 2) as amount')
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('quotations.reference_no', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('customers.name', 'LIKE', '%' . $searchParams['search'] . '%')
                        ->orWhere('invoices.invoice_no', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        if (isset($searchParams['invoice_id']) && is_array($searchParams['invoice_id'])) {
            $sql->whereIn('invoices.id', $searchParams['invoice_id']);
        }

        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->whereIn('invoices.status', $searchParams['status']);
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
            'issue_date',
            'tax',
            'invoices.status',
            'invoices.payment_received_date',
            'created_at',
            'quotation_id'
        ])->with([
            'quotation' => function ($query) use ($conditions) {
                $query->join('customers', 'customers.id', 'quotations.customer_id')
                    ->select([
                        'quotations.id',
                        'quotations.reference_no',
                        'quotations.description',
                        'customers.id as customer_id',
                        'customers.name',
                        'customers.email',
                        'customers.phone_number',
                        'customers.address',
                        'customers.postal_code',
                        'customers.company_name',
                    ])->where('quotations.price', '<>', null)
                    ->where('quotations.price', '>', 0);
            }
        ])->where('invoices.id', $invoiceid)->first();
    }

    public function getBillScheduleByInvoiceId($invoiceid, $conditions = null)
    {
        return Invoice::join('quotations', 'invoices.quotation_id', 'quotations.id')
            ->select([
                'invoices.id',
                'invoice_no',
                'quotation_id',
                'invoices.tax',
                'invoices.total_amount',
                'quotations.price as grand_total_from_quotation',
                'invoices.created_at'
            ])->with([
                'bill_schedules' => function ($query) use ($conditions) {
                    $query->select([
                        'bill_schedules.id',
                        'invoice_id',
                        'order_number',
                        'type_invoice_statement',
                        'type_percentage',
                        'amount',
                    ])->orderBy('order_number', 'asc');
                }
            ])->where('invoices.id', $invoiceid)->first();
    }

    public function getInvoiceOverview($invoiceId)
    {
        return Invoice::with([
            'quotation' => function ($query) {
                $query->select(
                    'id',
                    'customer_id',
                    'reference_no',
                    'status',
                    'price',
                    'description',
                    'issue_date',
                    'quotations.price as grand_total_from_quotation',
                );
                $query->with([
                    'customer' => function ($qr) {
                        $qr->select(
                            'id',
                            'name',
                            'email',
                            'phone_number',
                            'address',
                            'postal_code',
                            'company_name',
                        );
                    }
                ]);
            }
        ])->select([
            'invoices.id',
            'invoice_no',
            'quotation_id',
            'issue_date',
            'invoices.tax',
            'invoices.total_amount',
            'invoices.status',
            'invoices.payment_received_date',
            'invoices.created_at'
        ])->with([
            'bill_schedules' => function ($query) {
                $query->select([
                    'bill_schedules.id',
                    'invoice_id',
                    'order_number',
                    'type_invoice_statement',
                    'type_percentage',
                    'amount',
                ])->orderBy('order_number', 'desc');
            }
        ])->where('invoices.id', $invoiceId)->first();
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
                'invoices.status',
                'invoices.payment_received_date',
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
