<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportCustomer;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;


class ExportCustomerController extends Controller
{
    public function exportCSV($customerIds)
    {
        $params['customer_id'] = explode(',', $customerIds);
        $fileName = "customers_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['customer_id'][0]) ? $params : null;
        return Excel::download(new ExportCustomer($searches), $fileName, ExcelExcel::CSV);
    }

}
