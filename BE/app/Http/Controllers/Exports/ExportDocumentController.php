<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportDocument;
use App\Http\Controllers\Controller;
use App\Services\DocumentService;
use Carbon\Carbon;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ExportDocumentController extends Controller
{
    /**
     * @var DocumentService
     */
    private $documentService;

    public function __construct(DocumentService $documentService) {
        $this->documentService = $documentService;
    }

    public function exportCSV($customerId, $documentIds)
    {
        $params['document_id'] = explode(',', $documentIds);
        $fileName = "documents_" . Carbon::now()->format('Y_m_d') . ".csv";
        $searches = is_numeric($params['document_id'][0]) ? $params : null;
        $searches['customer_id'] = $customerId;

        return Excel::download(new ExportDocument($searches), $fileName, ExcelExcel::CSV);
    }

    public function downloadDocuments($documentIds)
    {
        $credentials['document_ids'] = explode(',', $documentIds);
        if (isset($credentials['document_ids']) && count($credentials['document_ids']) > 0) {
            $zipFileName = $this->documentService->handleMultiDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        }
    }
}
