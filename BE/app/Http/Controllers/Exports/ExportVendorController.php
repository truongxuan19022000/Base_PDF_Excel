<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportVendor;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;


class ExportVendorController extends Controller
{
    public function exportCSV($vendorIds)
    {
        $params['vendor_id'] = explode(',', $vendorIds);
        $fileName = "vendors_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['vendor_id'][0]) ? $params : null;
        return Excel::download(new ExportVendor($searches), $fileName, ExcelExcel::CSV);
    }

}
