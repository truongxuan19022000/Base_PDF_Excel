<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ExportMultiMaterial implements WithMultipleSheets
{
    private $searchs;

    public function __construct($searchs)
    {
        $this->searchs = $searchs;
    }

    public function sheets(): array
    {
        $sheets = [
            'Aluminium EURO' => new ExportAluminiumEuroMaterial($this->searchs),
            'Aluminium LOCAL (CONVENTIONAL)' => new ExportAluminiumLocalMaterial($this->searchs),
            'Glass' => new ExportGlassMaterial($this->searchs),
            'Hardware' => new ExportHardwareMaterial($this->searchs),
            'Service' => new ExportServiceMaterial($this->searchs),
            // Add more sheets as needed
        ];
        return $sheets;
    }
}
