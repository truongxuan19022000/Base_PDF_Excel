<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class ImportMultiMaterial implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            0 => new ImportAluminiumEuroMaterial(),
            1 => new ImportAluminiumLocalMaterial(),
            2 => new ImportGlassMaterial(),
            3 => new ImportHardwareMaterial(),
            4 => new ImportServiceMaterial()
        ];
    }

}
