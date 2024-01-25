<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\QuotationService;
use App\Services\QuotationSectionService;
use App\Services\QuotationNoteService;
use App\Services\OtherFeeService;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportPDFController extends Controller
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

    public function exportPDF($quotationId)
    {
        $quotation = $this->quotationService->getQuotationById($quotationId)['quotation'];
        $quotation_sections = $this->quotationSectionService->getQuotationSections($quotationId)['quotation_sections'];
        $quotation_notes = $this->quotationNoteService->getQuotationNotes($quotationId)['quotation_notes'];
        $otherFees = $this->otherFeeService->getOtherFees($quotationId)['other_fees'];

        if (!$quotation || count($quotation_sections) == 0) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.data_not_available'),
            ]);
        }

        $fileName = 'quotation_' . $quotation['reference_no'] . '.pdf';
        $quotation = Pdf::loadView('pdf.quotation.quotation', [
            'quotation' => $quotation,
            'quotation_sections' => $quotation_sections,
            'quotation_notes' => $quotation_notes,
            'other_fees' => $otherFees
        ])->setPaper('A4', 'portrait');

        return $quotation->download($fileName);
    }
}
