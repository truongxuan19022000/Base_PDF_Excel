<?php

namespace App\Exports;

use App\Models\Quotation;
use App\Repositories\QuotationRepository;
use App\Services\OtherFeeService;
use App\Services\QuotationNoteService;
use App\Services\QuotationSectionService;
use App\Services\QuotationService;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExportQuotation implements WithStyles
{
    private $quotationRepository;
    private $quotationService;
    private $quotationSectionService;
    private $quotationNoteService;
    private $otherFeeService;
    private $quotationId;

    public function __construct($quotationId)
    {
        $this->quotationRepository = app(QuotationRepository::class);
        $this->quotationService = app(QuotationService::class);
        $this->quotationSectionService = app(QuotationSectionService::class);
        $this->quotationNoteService = app(QuotationNoteService::class);
        $this->otherFeeService = app(OtherFeeService::class);
        $this->quotationId = $quotationId;
    }

    public function styles(Worksheet $sheet)
    {
        $quotation = $this->quotationService->getQuotationById($this->quotationId)['quotation'];
        $quotation_sections = $this->quotationSectionService->getQuotationSections($this->quotationId)['quotation_sections'];
        $quotation_notes = $this->quotationNoteService->getQuotationNotes($this->quotationId)['quotation_notes'];
        $otherFees = $this->otherFeeService->getOtherFees($this->quotationId)['other_fees'];
        $sheet->setCellValue('A1', $quotation->reference_no);
        $sheet->setCellValue('A3', $quotation->customer->company_name);
        $sheet->setCellValue('A4', $quotation->customer->address['address_1']);
        $sheet->setCellValue('A5', $quotation->customer->address['address_2']);
        $sheet->setCellValue('A7', "Attention : " . $quotation->customer->name);
        $sheet->setCellValue('I1', \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y'));
        $sheet->setCellValue('I3', "Tel : " . $quotation->customer->phone_number);
        $sheet->setCellValue('I4', "Fax : ");
        $sheet->setCellValue('I5', "Email : " . $quotation->customer->email);
        $longTextLines = explode("\n", wordwrap($quotation->description, 80, "\n", true));
        $rowCurrent = $sheet->getHighestRow() + 2;
        for ($i = 0; $i < count($longTextLines); $i++) {
            $sheet->setCellValue('A' . ($rowCurrent + $i + 1), $longTextLines[$i]);
        }
        /*page 1 - quotation note*/
        $rowCurrent = $sheet->getHighestRow() + 2;
        $sheet->setCellValue('A' . $rowCurrent, $quotation['quotation_description']);
        $tableQuotationNotes = [
            ['S/N', 'DESCRIPTION', '', '', '', 'UNIT', 'QTY', 'U/RATE', 'RATE'],
            ['A', 'General information or/and note for deviation', '', '', '', '', '', '', ''],
        ];
        foreach ($quotation_notes as $key => $value) {
            $tableQuotationNotes[] = ['A.' . ($key + 1), $value->description, '', '', '', '', '', '', $value->type ? config('quotation.note_type')[$value->type] : ''];
        }
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableQuotationNotes, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow() + 2;
        $sheet->setCellValue('A' . $rowCurrent, $quotation->reference_no);
        $sheet->setCellValue('A' . ($rowCurrent + 2), $quotation->customer->company_name);
        $sheet->setCellValue('A' . ($rowCurrent + 4), "Attention : " . $quotation->customer->name);
        $rowCurrent = $sheet->getHighestRow();
        $tableQuotationSections = [
            ['S/N', 'DESCRIPTION', '', '', '', 'UNIT', 'QTY', 'U/RATE', 'RATE'],
            ['B', 'Schedule of Bills / Quotation:', '', '', '', '', '', '', ''],
            ['B1', 'Supply, delivery and installation of POWDER COATED finish aluminium framed doors and windows, complete with ironmongeries or/and accessories to given schedule described but to aluminium fabricator details.', '', '', '', '', '', '', ''],
        ];
        /*page 2 - quotation section*/
        $sumProducts = 0;
        foreach ($quotation_sections as $key => $value) {
            $tableQuotationSections[] = ['B.1.' . ($key + 1), $value['section_name'], '', '', '', '', '', '', ''];
            foreach ($value->products as $item_key => $item_value) {
                $tableQuotationSections[] = [
                    'B.1.' . ($key + 1) . '.' . ($item_key + 1),
                    $item_value->product_code,
                    ($item_value->storey_text ?? '') . ';' . ($item_value->area_text ?? ''),
                    $item_value->glass_type,
                    $item_value->width . ' x ' . $item_value->height . ' ' . 'mm',
                    'No',
                    $item_value->quantity,
                    "$ " . number_format($item_value->subtotal, '2', '.', ','),
                    "$ " . number_format($item_value->subtotal * $item_value->quantity, '2', '.', ',')
                ];
                $sumProducts += $item_value->subtotal * $item_value->quantity;
            }
        }
        $sheet->fromArray($tableQuotationSections, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . $rowCurrent, $quotation->reference_no);
        $sheet->setCellValue('A' . ($rowCurrent + 2), $quotation->customer->company_name);
        $sheet->setCellValue('A' . ($rowCurrent + 4), "Attention : " . $quotation->customer->name);
        $tableOtherFees = [
            ['S/N', 'DESCRIPTION', '', '', '', 'UNIT', 'QTY', 'U/RATE', 'RATE'],
            ['A', 'Other Fees : (Optional)', '', '', '', '', '', '', ''],
        ];
        /*page 3 - other fee*/
        $last_key = 0;
        foreach ($otherFees as $key => $value) {
            $otherFeetype = config('quotation.other_fee_type');
            $flippedArray = array_flip($otherFeetype);
            $flippedArray = array_map('ucfirst', $flippedArray);
            $tableOtherFees[] = ['C.' . ($key + 1), $value->description, 'Sum', '', '', '', '', '', $value->type == config('quotation.other_fee_type.excluded') ? $flippedArray[$value->type] : "$ " .number_format(floatval($value->amount), '2', '.', ',')];
            $last_key = $key;
        }
        $sumOtherFee = 0;
        foreach ($otherFees as $key => $item) {
            if ($item->type == config('quotation.other_fee_type.included')) {
                $sumOtherFee += $item->amount;
            }
        }
        $tableOtherFees[] = ['C.' . ($last_key + 2), '', '', '', '', '', '', 'Sub Total for C (Before GST):', '$ ' . number_format(($sumOtherFee ?? 0), '2', '.', ',')];
        $tableOtherFees[] = ['D.1', '', '', '', '', '', '', 'Total for B + C (Before GST):', '$ ' . number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0), '2', '.', ',')];
        $tableOtherFees[] = ['D.2', '', '', '', '', '', '', 'Discount:', '$ ' . number_format(floatval($quotation->discount_amount), '2', '.', ',')];
        $tableOtherFees[] = ['D.3', '', '', '', '', '', '', 'Total for B + C - D2 (Before GST):', '$ ' . number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0) - (floatval($quotation->discount_amount)), '2', '.', ',')];
        /* last page */
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableOtherFees, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow() + 1;
        $sheet->setCellValue('A' . ($rowCurrent), "TERMS & CONDITIONS");
        $dataTermConditions = [];
        if ($quotation->term_conditions) {
            foreach ($quotation->term_conditions as $key => $item) {
                $dataTermConditions[] = [$item->order_number, $item->description];
            }
        }
        $sheet->fromArray($dataTermConditions, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow() + 1;
        $sheet->setCellValue('A' . ($rowCurrent), "Total amount for the above mentioned works quoted in Singapore dollar (Before GST) :");
        $sheet->setCellValue('I' . ($rowCurrent), "$ " . number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0) - (floatval($quotation->discount_amount)), '2', '.', ','));
        $sheet->setCellValue('A' . ($rowCurrent + 2), "We trust that above offer is in line with your requirements and looking forward to receive your valuable confirmation.");
        $sheet->setCellValue('A' . ($rowCurrent + 4), "Please do not hesitate to contact the undersigned should you need further assistance or clarification.");
        $sheet->setCellValue('A' . ($rowCurrent + 6), "Thank You.");
        $sheet->setCellValue('A' . ($rowCurrent + 8), "Yours faithfully,");
        $sheet->setCellValue('A' . ($rowCurrent + 10), "Multi Contracts");
        $sheet->setCellValue('I' . ($rowCurrent + 10), "Accepted & Confirmed");

    }
}
