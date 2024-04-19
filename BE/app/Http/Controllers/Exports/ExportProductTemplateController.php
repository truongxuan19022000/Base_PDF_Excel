<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportProductTemplate;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;


class ExportProductTemplateController extends Controller
{
    public function exportCSV($productTemplateIds)
    {
        $params['product_template_id'] = explode(',', $productTemplateIds);
        $fileName = "product_templates_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['product_template_id'][0]) ? $params : null;
        return Excel::download(new ExportProductTemplate($searches), $fileName, ExcelExcel::CSV);
    }

}
