<?php

namespace App\Http\Controllers\Exports;

use App\Exports\ExportClaim;
use App\Http\Controllers\Controller;
use App\Services\ClaimService;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ExportClaimController extends Controller
{
    private $claimService;

    public function __construct(
        ClaimService $claimService
    ) {
        $this->claimService = $claimService;
    }

    public function exportPDF($claimId)
    {
        $result = $this->claimService->getClaimByQuotationId($claimId);
        $claims_copied = getPreviousClaims($result);
        $previous_claim = isset($claims_copied[0]) ? $claims_copied[0] : null;
        $fileName = 'claim_' .$result->claim_no . '.pdf';
        $quotation = Pdf::loadView('pdf.claims.claim', [
            'claim' => $result,
            'claims_copied' => array_reverse($claims_copied),
            'previous_claim' => $previous_claim,
            'quotation' => $result->quotation,
            'customer' => $result->quotation->customer,
            'quotation_sections' => $result->quotation->quotation_sections,
            'other_fees' => $result->quotation->other_fees,
            'discount' => $result->quotation->discount,
        ])->setPaper('A4', 'landscape');

        return Response::make($quotation->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    public function exportCSV($claimIds)
    {
        $credentials['claim_ids'] = explode(',', $claimIds);
        $file_name = 'claim_' . Carbon::now()->format('Y_m_d_Hisu') . '.csv';
        if (isset($credentials['claim_ids']) && count($credentials['claim_ids']) > 1) {
            $zipFileName = $this->claimService->handleMultiCsvDownload($credentials);
            if (!$zipFileName) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'file' => null
                ]);
            }

            return response()->download($zipFileName)->deleteFileAfterSend(true);
        } else {
            return Excel::download(new ExportClaim($credentials['claim_ids'][0]), $file_name, ExcelExcel::CSV);
        }

    }
}
