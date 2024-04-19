<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportInvoice;
use App\Exports\ExportQuotation;
use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ExportInvoiceController extends Controller
{
    private $invoiceService;

    public function __construct(
        InvoiceService $invoiceService
    ) {
        $this->invoiceService = $invoiceService;
    }

    public function exportPDF($invoiceId)
    {
        $result = $this->invoiceService->getInvoiceOverview($invoiceId);

        $fileName = 'invoice_' . $result->invoice_no . '.pdf';
        $quotation = Pdf::loadView('pdf.invoices.invoice', [
            'invoice' => $result,
            'quotation' => $result->quotation,
            'customer' => $result->quotation->customer,
            'bill_schedules' => $result->bill_schedules,
        ])->setPaper('A4', 'portrait');

        return Response::make($quotation->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    public function exportCSV($invoiceIds)
    {
        $credentials['invoice_ids'] = explode(',', $invoiceIds);
        $file_name = 'invoice_' . Carbon::now()->format('Y_m_d_Hisu') . '.csv';
        if (isset($credentials['invoice_ids']) && count($credentials['invoice_ids']) > 1) {
            $zipFileName = $this->invoiceService->handleMultiCsvDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        } else {
            $result = $this->invoiceService->getInvoiceOverview($credentials['invoice_ids'][0]);
            return Excel::download(new ExportInvoice($result, $result->quotation, $result->quotation->customer, $result->bill_schedules), $file_name, ExcelExcel::CSV);
        }
    }
}
