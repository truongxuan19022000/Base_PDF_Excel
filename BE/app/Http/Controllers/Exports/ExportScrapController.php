<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportScrap;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;


class ExportScrapController extends Controller
{
    public function exportCSV($scrapIds)
    {
        $params['scrap_id'] = explode(',', $scrapIds);
        $fileName = "scraps_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['scrap_id'][0]) ? $params : null;
        return Excel::download(new ExportScrap($searches), $fileName, ExcelExcel::CSV);
    }

}
