<?php

namespace App\Exports;

use App\Repositories\InventoryRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportInventory implements FromCollection, WithMapping, WithHeadings
{
    private $inventoryRepository;
    private $searchs;

    public function __construct($searchs)
    {
        $this->inventoryRepository = app(InventoryRepository::class);
        $this->searchs = $searchs;
    }

    public function collection()
    {
        $searchParams = $this->searchs;
        return $this->inventoryRepository->getInventories($searchParams, false);
    }

    public function map($row): array
    {
        return [
            $row->category,
            $row->sku_code,
            $row->item,
            $row->type,
            $row->thickness,
            $row->price,
        ];
    }

    public function headings(): array
    {
        return [
            'CATEGORY',
            'SKU CODE',
            'ITEM',
            'TYPE',
            'THINKNESS',
            'PRICE',
        ];
    }
}
