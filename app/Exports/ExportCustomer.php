<?php

namespace App\Exports;

use App\Repositories\CustomerRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\StringValueBinder;

class ExportCustomer extends StringValueBinder implements FromCollection, WithMapping, WithHeadings, WithCustomValueBinder
{
    private $customerRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->customerRepository = app(CustomerRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->customerRepository->getCustomers($searchParams, false);;
    }

    public function map($row): array
    {
        return [
            $row->name,
            $row->phone_number,
            $row->email,
            date('d M Y', strtotime($row->created_at)),
        ];
    }

    public function headings(): array
    {
        return [
            'NAME',
            'PHONE',
            'EMAIL',
            'CREATED ON',
        ];
    }
}
