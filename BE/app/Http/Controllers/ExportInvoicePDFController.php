<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Response;

class ExportInvoicePDFController extends Controller
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
}
