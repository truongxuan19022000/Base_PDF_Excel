<?php

namespace App\Exports;

use App\Repositories\CustomerRepository;
use App\Repositories\ScrapRepository;
use App\Repositories\VendorRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class ExportScrap extends StringValueBinder implements FromCollection, WithMapping, WithHeadings, WithCustomValueBinder
{
    private $scrapRepository;
    private $searches;

    public function __construct($searches)
    {
        $this->scrapRepository = app(ScrapRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
        return $this->scrapRepository->getScrapManagements($searchParams, false);;
    }

    public function map($row): array
    {
        $status = ($row->status == 1) ? (($row->status == 2) ? 'Used' : 'Unused' ) : 'Scrapped';
        return [
            $row->item,
            $row->code,
            $row->reference_no,
            $row->product_code,
            $row->scrap_length,
            $status,
            date('d M Y', strtotime($row->created_at)),
        ];
    }

    public function headings(): array
    {
        return [
            'ITEM',
            'ITEM CODE',
            'REFERENCE NO.',
            'PDT CODE',
            'LENGTH',
            'STATUS',
            'CREATED ON',
        ];
    }
}
