<?php

namespace App\Exports;

use App\Repositories\ClaimRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportClaim implements FromCollection, WithMapping, WithHeadings
{
    private $claimRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->claimRepository = app(ClaimRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->claimRepository->getClaims($searchParams, false);;
    }

    public function map($row): array
    {
        return [
            $row->claim_no,
            $row->reference_no,
            $row->customer->name,
            number_format($row->price, 2, '.', ','),
            date('d M Y', strtotime($row->issue_date)),
        ];

    }

    public function headings(): array
    {
        return [
            'CLAIM NO.',
            'REFERENCE NO.',
            'CUSTOMER',
            'AMOUNT',
            'ISSUED ON',
        ];
    }
}
