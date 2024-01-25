<?php

namespace App\Exports;

use App\Repositories\MaterialRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportServiceMaterial implements FromCollection, WithMapping, WithHeadings
{
    private $materialRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->materialRepository = app(MaterialRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        $searchParams['category'] = [config("common.material_category.services")];
        return $this->materialRepository->getMaterials($searchParams, false);
    }

    public function map($row): array
    {
        return [
            config("common.service_type.$row->service_type"),
            $row->item,
            $row->min_size,
            "$ ".number_format($row->price, 2, '.', ',') . " / "
            .config("common.material_price_unit.$row->price_unit"),
        ];
    }

    public function headings(): array
    {
        return [
            'SERVICE TYPE',
            'ITEM',
            'MIN SIZE (m2)',
            'PRICE',
        ];
    }
}
