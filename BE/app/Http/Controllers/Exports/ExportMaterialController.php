<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportMultiMaterial;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;


class ExportMaterialController extends Controller
{
    public function exportCSV($materialIds)
    {
        $searches['material_id'] = explode(',', $materialIds);
        $fileName = "materials_" . Carbon::now()->format('Y_m_d') . ".xlsx";
        if (is_numeric($searches['material_id'][0])) {
            return Excel::download(new ExportMultiMaterial($searches), $fileName, ExcelExcel::XLSX);
        } else {
            $searches = null;
            return Excel::download(new ExportMultiMaterial($searches), $fileName, ExcelExcel::XLSX);
        }

    }
}
