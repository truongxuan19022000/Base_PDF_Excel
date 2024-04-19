<?php

namespace App\Exports;

use App\Repositories\CustomerRepository;
use App\Repositories\VendorRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class ExportVendor extends StringValueBinder implements FromCollection, WithMapping, WithHeadings, WithCustomValueBinder
{
    private $vendorRepository;
    private $searches;

    public function __construct($searches)
    {
        $this->vendorRepository = app(VendorRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
        return $this->vendorRepository->getVendors($searchParams, false);;
    }

    public function map($row): array
    {
        return [
            $row->vendor_name,
            $row->phone_number,
            $row->email,
            date('d M Y', strtotime($row->created_at)),
        ];
    }

    public function headings(): array
    {
        return [
            'VENDOR NAME',
            'PHONE',
            'EMAIL',
            'CREATED ON',
        ];
    }
}
