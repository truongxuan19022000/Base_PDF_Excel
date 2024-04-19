<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportDocument;
use App\Exports\ExportUser;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ExportUserController extends Controller
{
    public function exportCSV($userIds)
    {
        $params['user_id'] = explode(',', $userIds);
        $fileName = "users_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['user_id'][0]) ? $params : null;
        return Excel::download(new ExportUser($searches), $fileName, ExcelExcel::CSV);
    }
}
