<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportDocument;
use App\Exports\ExportRole;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ExportRoleController extends Controller
{
    public function exportCSV($roleIds)
    {
        $params['role_id'] = explode(',', $roleIds);
        $fileName = "roles_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['role_id'][0]) ? $params : null;
        return Excel::download(new ExportRole($searches), $fileName, ExcelExcel::CSV);
    }
}
