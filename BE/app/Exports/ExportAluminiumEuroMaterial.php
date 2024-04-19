<?php

namespace App\Exports;

use App\Models\Material;
use App\Repositories\MaterialRepository;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class ExportAluminiumEuroMaterial implements FromCollection, WithMapping, WithHeadings, WithTitle
{
    private $materialRepository;
    private $searches;
    public function __construct($searches)
    {
        $this->materialRepository = app(MaterialRepository::class);
        $this->searches = $searches;
    }

    public function collection()
    {
        $searchParams = $this->searches;
        $searchParams['profile'] = [config("common.profile.euro")];
        $searchParams['category'] = [config("common.material_category.aluminium")];
        return $this->materialRepository->getMaterials($searchParams, false);
    }

    public function map($row): array
    {
        if ($row->inner_side === Material::INNER_SIDE['CHECKED'] && $row->outer_side === Material::INNER_SIDE['CHECKED']) {
            $side = config("common.side.inner_outer");
        } elseif ($row->inner_side === Material::INNER_SIDE['CHECKED']) {
            $side = config("common.side.inner");
        } elseif ($row->outer_side === Material::INNER_SIDE['CHECKED']) {
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
            $row->raw_length ?? 0,
            $row->raw_girth ?? 0,
            "$ ".number_format($row->price, 2, '.', ',') . " / "
            .config("common.material_price_unit.$row->price_unit"),
            "$ ".number_format($row->coating_price, 2, '.', ',') . " / m2",
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
            'RAW GIRTH (m)',
            'PRICE',
            'COATING PRICE (/m2)',
        ];
    }

    public function title(): string
    {
        return 'Aluminium EURO';
    }
}
