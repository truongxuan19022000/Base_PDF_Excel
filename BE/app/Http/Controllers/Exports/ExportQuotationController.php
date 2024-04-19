<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportQuotation;
use App\Http\Controllers\Controller;
use App\Services\QuotationService;
use App\Services\QuotationSectionService;
use App\Services\QuotationNoteService;
use App\Services\OtherFeeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use ZipArchive;

class ExportQuotationController extends Controller
{
    private $quotationService;

    private $quotationSectionService;

    private $quotationNoteService;

    private $otherFeeService;

    public function __construct(
        QuotationService $quotationService,
        QuotationSectionService $quotationSectionService,
        QuotationNoteService $quotationNoteService,
        OtherFeeService $otherFeeService
    ) {
        $this->quotationService = $quotationService;
        $this->quotationSectionService = $quotationSectionService;
        $this->quotationNoteService = $quotationNoteService;
        $this->otherFeeService = $otherFeeService;
    }

    public function exportPDF($quotationIds)
    {
        $credentials['quotation_ids'] = explode(',', $quotationIds);
        if (isset($credentials['quotation_ids']) && count($credentials['quotation_ids']) > 1) {
            $zipFileName = $this->handleMultiPdfDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        } else {
            $quotationId = $credentials['quotation_ids'][0];
            $quotation = $this->quotationService->getQuotationById($quotationId)['quotation'];
            $quotation_sections = $this->quotationSectionService->getQuotationSections($quotationId)['quotation_sections'];
            $quotation_notes = $this->quotationNoteService->getQuotationNotes($quotationId)['quotation_notes'];
            $otherFees = $this->otherFeeService->getOtherFees($quotationId)['other_fees'];
            $fileName = 'quotation_' . $quotation['reference_no'] . '.pdf';
            $quotation = Pdf::loadView('pdf.quotation.quotation', [
                'quotation' => $quotation,
                'quotation_sections' => $quotation_sections,
                'quotation_notes' => $quotation_notes,
                'other_fees' => $otherFees,
                'term_conditions' => $quotation->term_conditions
            ])->setPaper('A4', 'portrait');

            return Response::make($quotation->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            ]);
        }

    }

    public function exportCSV($quotationIds)
    {
        $credentials['quotation_ids'] = explode(',', $quotationIds);
        $file_name = 'quotation_' . Carbon::now()->format('Y_m_d_Hisu') . '.csv';
        if (isset($credentials['quotation_ids']) && count($credentials['quotation_ids']) > 1) {
            $zipFileName = $this->quotationService->handleMultiCsvDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        } else {
            return Excel::download(new ExportQuotation($credentials['quotation_ids'][0]),  $file_name, ExcelExcel::CSV);
        }

    }

    public function handleMultiPdfDownload($credentials)
    {
        try {
            $zip = new ZipArchive();

            $zipFileName = storage_path('app/quotation-pdfs.zip');

            if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                foreach ($credentials['quotation_ids'] as $quotationId) {
                    $quotation = $this->quotationService->getQuotationById($quotationId)['quotation'];
                    $reference_no = replace_special_characters($quotation->reference_no);

                    $quotation_sections = $this->quotationSectionService->getQuotationSections($quotationId)['quotation_sections'];
                    $quotation_notes = $this->quotationNoteService->getQuotationNotes($quotationId)['quotation_notes'];
                    $otherFees = $this->otherFeeService->getOtherFees($quotationId)['other_fees'];
                    $quotation = Pdf::loadView('pdf.quotation.quotation', [
                        'quotation' => $quotation,
                        'quotation_sections' => $quotation_sections,
                        'quotation_notes' => $quotation_notes,
                        'other_fees' => $otherFees,
                        'term_conditions' => $quotation->term_conditions
                    ])->setPaper('A4', 'portrait');
                    $pdfFileName = $reference_no . '.pdf';
                    $pdfContent = $quotation->output();
                    $zip->addFromString($pdfFileName, $pdfContent);
                }

                $zip->close();
            }

            return $zipFileName;
        } catch (\Exception $e) {
            Log::error('CLASS "ExportQuotationPDFController" FUNCTION "handleMultiPdfDownload" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}
