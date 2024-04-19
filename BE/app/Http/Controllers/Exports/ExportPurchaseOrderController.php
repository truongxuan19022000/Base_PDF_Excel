<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportInvoice;
use App\Exports\ExportPurchaseOrder;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;
use App\Services\PurchaseOrderService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;
use ZipArchive;

class ExportPurchaseOrderController extends Controller
{
    private $purchaseOrderService;

    public function __construct(PurchaseOrderService $purchaseOrderService)
    {
        $this->purchaseOrderService = $purchaseOrderService;
    }

    public function exportCSV($purchaseOrderIds)
    {
        $credentials['purchase_order_ids'] = explode(',', $purchaseOrderIds);
        $fileName = "purchase_orders_" . Carbon::now()->format('Y_m_d') . ".csv";
        if (!empty($vendorId) || (isset($credentials['purchase_order_ids']) && count($credentials['purchase_order_ids']) > 1)) {
            $zipFileName = $this->handleMultiCsvDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        } else {
            $result = $this->purchaseOrderService->getPurchaseOrderByVendor($credentials['purchase_order_ids'][0]);
            return Excel::download(new ExportPurchaseOrder($result, $result->vendor, $result->purchase_order_items), $fileName, ExcelExcel::CSV);
        }
    }

    public function exportPDF($purchaseOrderId)
    {
        $result = $this->purchaseOrderService->getPurchaseOrderByVendor($purchaseOrderId);
        $fileName = 'purchase_' . $result->purchase_order_no . '.pdf';
        $purchaseOrder = Pdf::loadView('pdf.purchases.purchase', [
            'purchase' => $result,
            'vendor' => $result->vendor,
            'purchase_order_items' => $result->purchase_order_items,
        ])->setPaper('A4', 'portrait');

        return Response::make($purchaseOrder->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    public function handleMultiCsvDownload($credentials)
    {
        try {
            // make file csv from purchase
            foreach ($credentials['purchase_order_ids'] as $purchaseOrderId) {
                $result = $this->purchaseOrderService->getPurchaseOrderByVendor($purchaseOrderId);
                $purchase_order_no = replace_special_characters($result->purchase_order_no);
                $export = new ExportPurchaseOrder($result, $result->vendor, $result->purchase_order_items);
                $csvFilePath = "csv" . '/' . $purchase_order_no . '.csv';
                Excel::store($export, $csvFilePath, 'local');
            }

            //make file rar
            $zip = new ZipArchive();
            $zipFileName = storage_path('app/purchase-csv.zip');
            if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $files = Storage::files('csv');
                foreach ($files as $file) {
                    $contents = Storage::path($file);
                    $zip->addFile($contents, basename($contents));
                }
                $zip->close();
                Storage::deleteDirectory('csv');
            }

            return $zipFileName;
        } catch (\Exception $e) {
            Log::error('CLASS "ExportPurchaseController" FUNCTION "handleMultiCsvDownload" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}
