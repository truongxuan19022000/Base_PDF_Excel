<?php

namespace App\Exports;

use App\Repositories\MaterialRepository;
use App\Repositories\ProductTemplateRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportProductTemplate implements FromCollection, WithMapping, WithHeadings
{
    private $productTemplateRepository;
    private $searches;

    public function __construct($searches)
    {
        $this->productTemplateRepository = app(ProductTemplateRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
        return $this->productTemplateRepository->getProductTemplates($searchParams, false);
    }

    public function map($row): array
    {
        return [
            config("common.material_profile.$row->profile"),
            $row->item,
        ];
    }

    public function headings(): array
    {
        return [
            'PROFILE',
            'ITEM',
        ];
    }
}
