<?php

namespace App\Exports;

use App\Repositories\MaterialRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ExportAluminiumLocalMaterial implements FromCollection, WithMapping, WithHeadings
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
        $searchParams['profile'] = [config("common.profile.local")];
        $searchParams['category'] = [config("common.material_category.aluminium")];
        return $this->materialRepository->getMaterials($searchParams, false);
    }

    public function map($row): array
    {
        if ($row->inner_side === 2 && $row->outer_side === 2) {
            $side = config("common.side.inner_outer");
        } elseif ($row->inner_side === 2) {
            $side = config("common.side.inner");
        } elseif ($row->outer_side === 2) {
            $side = config("common.side.outer");
        } else {
            $side = '';
        }
        return [
            config("common.door_window_type.$row->door_window_type"),
            $side,
            $row->item,
            $row->code,
            $row->weight,
            $row->raw_length,
            "$ ".number_format($row->price, 2, '.', ',') . " / "
            .config("common.material_price_unit.$row->price_unit"),
            "$ ".number_format($row->coating_price, 2, '.', ',') . " / "
            .config("common.material_coating_price.$row->coating_price"),
        ];
    }

    public function headings(): array
    {
        return [
            'DOOR WINDOW TYPE',
            'SIDE',
            'ITEM',
            'CODE',
            'WEIGHT (kg/m)',
            'RAW LENGTH (m)',
            'PRICE',
            'COATING PRICE (/m2)',
        ];
    }
}
