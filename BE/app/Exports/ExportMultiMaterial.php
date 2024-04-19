<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ExportMultiMaterial implements WithMultipleSheets
{
    private $searches;

    public function __construct($searches)
    {
        $this->searches = $searches;
    }

    public function sheets(): array
    {
        $sheets = [
            'Aluminium EURO' => new ExportAluminiumEuroMaterial($this->searches),
            'Aluminium LOCAL (CONVENTIONAL)' => new ExportAluminiumLocalMaterial($this->searches),
            'Glass' => new ExportGlassMaterial($this->searches),
            'Hardware' => new ExportHardwareMaterial($this->searches),
            'Service' => new ExportServiceMaterial($this->searches),
            // Add more sheets as needed
        ];
        return $sheets;
    }
}
