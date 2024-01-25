<?php

namespace App\Exports;

use App\Repositories\InvoiceRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportInvoice implements FromCollection, WithMapping, WithHeadings
{
    private $invoiceRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->invoiceRepository = app(InvoiceRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->invoiceRepository->getInvoices($searchParams, false);
    }

    public function map($row): array
    {
        if (isset($this->searchs['customer_id'])) {;
            return [
                $row->invoice_no,
                $row->reference_no,
                date('d M Y', strtotime($row->created_at)),
            ];
        }
        return [
            $row->invoice_no,
            $row->reference_no,
            $row->customer_name,
            date('d M Y', strtotime($row->created_at)),
        ];

    }

    public function headings(): array
    {
        if (isset($this->searchs['customer_id'])) {;
            return [
                'INVOICE NO.',
                'REFERENCE NO.',
                'CREATED ON',
            ];
        }
        return [
            'INVOICE NO.',
            'REFERENCE NO.',
            'CUSTOMER',
            'CREATED ON',
        ];
    }
}
