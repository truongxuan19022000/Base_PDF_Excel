<?php

namespace App\Exports;

use App\Models\Quotation;
use App\Repositories\QuotationRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportQuotation implements FromCollection, WithMapping, WithHeadings
{
    private $quotationRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->quotationRepository = app(QuotationRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->quotationRepository->getQuotations($searchParams, false);;
    }

    public function map($row): array
    {
        if (isset($this->searchs['customer_id'])) {;
            return [
                $row->reference_no,
                config("quotation.status_text.$row->status"),
                date('d M Y', strtotime($row->created_at)),
            ];
        }
        return [
            $row->reference_no,
            $row->name,
            config("quotation.status_text.$row->status"),
            date('d M Y', strtotime($row->created_at)),
        ];

    }

    public function headings(): array
    {
        if (isset($this->searchs['customer_id'])) {;
            return [
                'REFERENCE NO.',
                'STATUS',
                'CREATED ON',
            ];
        }
        return [
            'REFERENCE NO.',
            'CUSTOMER',
            'STATUS',
            'CREATED ON',
        ];
    }
}
