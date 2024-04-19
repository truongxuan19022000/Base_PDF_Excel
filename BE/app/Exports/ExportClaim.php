<?php

namespace App\Exports;

use App\Repositories\ClaimRepository;
use App\Services\ClaimService;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExportClaim implements WithStyles
{
    private $claimRepository;
    private $claimService;
    private $claimId;

    public function __construct($claimId)
    {
        $this->claimRepository = app(ClaimRepository::class);
        $this->claimService = app(ClaimService::class);
        $this->claimId = $claimId;
    }

    public function styles(Worksheet $sheet)
    {
        $claim = $this->claimService->getClaimByQuotationId($this->claimId);
        $claims_copied = getPreviousClaims($claim);
        $previous_claim = isset($claims_copied[0]) ? $claims_copied[0] : null;
        $quotation = $claim->quotation;
        $quotation_sections = $claim->quotation->quotation_sections;
        $other_fees = $claim->quotation->other_fees;
        $discount = $claim->quotation->discount;
        $sheet->setCellValue('A1', $claim->claim_no);
        $sheet->setCellValue('A3', $quotation->customer->company_name);
        $sheet->setCellValue('A4', $quotation->customer->address['address_1']);
        $sheet->setCellValue('A5', $quotation->customer->address['address_2']);
        $sheet->setCellValue('A7', "Attention : " . $quotation->customer->name);
        $sheet->setCellValue('A9', "Dear Madam,");
        $sheet->setCellValue('M9', "By Email only");
        $sheet->setCellValue('M1', \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y'));
        $sheet->setCellValue('M3', "HP : " . $quotation->customer->phone_number);
        $sheet->setCellValue('M4', "Email : " . $quotation->customer->email);
        $longTextLines = explode("\n", wordwrap($quotation->description, 80, "\n", true));
        $rowCurrent = $sheet->getHighestRow() + 2;
        for ($i = 0; $i < count($longTextLines); $i++) {
            $sheet->setCellValue('A' . ($rowCurrent + $i + 1), $longTextLines[$i]);
        }
        /*page 1 - quotation sections*/
        $rowCurrent = $sheet->getHighestRow() + 2;
        $sheet->setCellValue('A' . $rowCurrent, "We are please to submit our claim for your response certificate and kind payment :");
        $total_current = 0;
        $total_accumulative = 0;
        $discount_amount = 0;
        $tableQuotationSections = [
            ['S/N', 'DESCRIPTION', '', '', '', 'UNIT', 'QTY', 'RATE', 'AMOUNT', 'DONE', 'CURRENT', 'PREVIOUS', 'ACCUMULATIVE'],
            [
                'A',
                'REF. OUR QUOTATION NO.' . $quotation->refence_no . " DATED " . \Carbon\Carbon::parse($quotation->issue_date)->format('d/m/y'),
                '', '', '', '', '', '', '', '', '', '', ''
            ],
            ['B', 'Schedule of Bills ', '', '', '', '', '', '', '', '', '', '', ''],
            ['B.1', 'Supply, delivery and installation of POWDER COATED finish aluminium framed doors and windows, complete with ironmongeries or', '', '', '', '', '', '', '', '', '', '', ''],
        ];
        if (count($quotation_sections) > 0) {
            foreach ($quotation_sections as $key => $value) {
                $tableQuotationSections[] = [
                    'B.1.' . ($key + 1), $value->section_name, '', '', '', '', '', '', '', '', '', '', ''
                ];
                foreach ($value->products as $item_key => $item_value) {
                    $claim_progress = $item_value->claim_progress[0];
                    if ($claim_progress) {
                        $tableQuotationSections[] = [
                            'B.1.' . ($key + 1) . '.' . ($item_key + 1),
                            $item_value->product_code,
                            ($item_value->storey_text ?? '') . ';' . ($item_value->area_text ?? ''),
                            $item_value->glass_type,
                            $item_value->width . ' x ' . $item_value->height . ' ' . 'mm',
                            'No',
                            $item_value->quantity,
                            '$ ' . number_format($item_value->subtotal, '2', '.', ','),
                            '$ ' . number_format($item_value->subtotal * $item_value->quantity, '2', '.', ','),
                            '$ ' . intval($claim_progress['claim_percent']),
                            '$ ' . number_format($claim_progress['current_amount'], '2', '.', ','),
                            '$ ' . number_format($claim_progress['previous_amount'], '2', '.', ','),
                            '$ ' . number_format($claim_progress['accumulative_amount'], '2', '.', ',')
                        ];
                    }
                    $total_current += isset($claim_progress['current_amount']) ? floatval($claim_progress['current_amount']) : 0;
                    $total_accumulative += isset($claim_progress['accumulative_amount']) ? floatval($claim_progress['accumulative_amount']) : 0;
                }
            }
        }
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableQuotationSections, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow() + 2;
        $sheet->setCellValue('A' . $rowCurrent, $quotation->reference_no);
        $sheet->setCellValue('A' . ($rowCurrent + 2), $quotation->customer->company_name);
        $sheet->setCellValue('M' . ($rowCurrent + 2), \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y'));
        $last_key = 0;
        $tableOtherFees = [
            ['S/N', 'DESCRIPTION', 'UNIT', 'QTY', 'RATE', 'AMOUNT', 'DONE', 'CURRENT', 'PREVIOUS', 'ACCUMULATIVE'],
            ['C', 'Other Fees : (Optional)', '', '', '', '', '', '', '', '', '', '', ''],
        ];
        if ($other_fees) {
            foreach ($other_fees as $key => $item) {
                $claim_progress = $item->claim_progress[0];
                $last_key = $key;
                $tableOtherFees[] = [
                    'C.' . ($key + 1),
                    $item->description,
                    'sum',
                    '',
                    '',
                    '$ ' . number_format($item->amount, '2', '.', ','),
                    intval($claim_progress['claim_percent']),
                    '$ ' . number_format($claim_progress['current_amount'], '2', '.', ','),
                    '$ ' . number_format($claim_progress['previous_amount'], '2', '.', ','),
                    '$ ' . number_format($claim_progress['accumulative_amount'], '2', '.', ',')
                ];
            }
            $total_current += isset($claim_progress['current_amount']) ? floatval($claim_progress['current_amount']) : 0;
            $total_accumulative += isset($claim_progress['accumulative_amount']) ? floatval($claim_progress['accumulative_amount']) : 0;
        }
        if ($discount->discount_amount) {
            $claim_progress = $discount->claim_progress[0];
            $discount_amount = $claim_progress['accumulative_amount'];
            $discount_current = $claim_progress['current_amount'];
            $tableOtherFees[] = [
                'D',
                'Discount',
                '',
                '',
                '',
                '$ ' . number_format($discount->discount_amount, '2', '.', ','),
                intval($claim_progress['claim_percent']),
                '$ ' . number_format($claim_progress['current_amount'], '2', '.', ','),
                '$ ' . number_format($claim_progress['previous_amount'], '2', '.', ','),
                '$ ' . number_format($claim_progress['accumulative_amount'], '2', '.', ',')
            ];
        }
        $total_accumulative = $total_accumulative - ($discount_amount ?? 0);
        $total_current = $total_current - ($discount_current ?? 0);
        $deposit = round(floatval($quotation->total_quotation_amount ?? 0) * intval($quotation->terms_of_payment_confirmation ?? 0) / 100, 2);
        $overall_progress = round(((floatval($total_accumulative ?? 0)) / floatval($quotation->total_quotation_amount ?? 0) * 100), 2);
        $offset_previous = isset($claim->claim_copied->accumulative_from_claim) ? $claim->claim_copied->accumulative_from_claim : 0;
        $accumulative_current = round((floatval($deposit ?? 0) * floatval($overall_progress ?? 0)) / 100, 2);
        $offset_current = round(floatval($accumulative_current ?? 0) - floatval($offset_previous ?? 0), 2);
        $actual_paid_amount = isset($previous_claim['actual_paid_amount']) ? (floatval($previous_claim['actual_paid_amount']) / (1 + floatval($previous_claim['tax']) / 100)) : 0;
        $previous_subtotal_from_claim = isset($previous_claim['subtotal_from_claim']) ? floatval($previous_claim['subtotal_from_claim']) : 0;
        $subtotal_from_claim = round(floatval($total_current ?? 0) - floatval($offset_current ?? 0) - floatval($actual_paid_amount) + floatval($previous_subtotal_from_claim), 2);
        $gst = round((floatval($subtotal_from_claim) * intval($claim['tax']) / 100), 2);
        $tableOtherFees[] = ['E', 'Less payment Received', '', '', '', '', '', '', '', ''];
        $tableOtherFees[] = [
            'E.1',
            "Payment Received 01 - Deposit / Down payemnt received dated " . \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y'),
            '',
            '',
            '',
            "-$" . number_format(abs($deposit), 2, '.', ','),
            number_format(abs($overall_progress), 2, '.', ',') . '%',
            "-$" . number_format(abs($offset_current), 2, '.', ','),
            "-$" . number_format(abs($offset_previous), 2, '.', ','),
            "-$" . number_format(abs($accumulative_current), 2, '.', ',')
        ];
        $claims_copied = array_reverse($claims_copied);

        foreach ($claims_copied as $key => $claim_copied) {
            $tableOtherFees[] = [
                'E.' . ($key + 2),
                'Payment Received 0' .($key + 2) . ' - Claim 0' . ($key + 2) . ' payment received dated ' . \Carbon\Carbon::parse($claim_copied->payment_received_date)->format('j-M-y'),
                '','', '', '', '', '','',
                '($ ' . number_format($claim_copied->actual_paid_amount / (1 + floatval($previous_claim['tax']) / 100), '2' , '.', ',') . ')'
            ];
        }
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableOtherFees, null, 'A' . ($rowCurrent + 2));
        $tableClaimsCopied = [];
        $tableClaimsCopied[] = ['F.1', '', '', '', '', '', '', '', 'SUB TOTAL FOR THIS CLAIM / BALANCE DUE (Before GST) :', '$ ' . number_format(($subtotal_from_claim ?? 0), '2' , '.', ',')];
        $tableClaimsCopied[] = ['F.2', '', '', '', '', '', '', '', 'ADD ' . $claim['tax'] . '% GST :', '$ ' . number_format($gst, '2', '.', ',')];
        $tableClaimsCopied[] = ['F.3', '', '', '', '', '', '', '', 'TOTAL FROM THIS CLAIM / BALANCE DUE (Inclusive GST) :', '$ ' . number_format(($subtotal_from_claim ?? 0) + ($gst ?? 0), '2', '.', ',')];

        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableClaimsCopied, null, 'A' . ($rowCurrent + 1));
        $rowCurrent = $sheet->getHighestRow() + 1;
        $sheet->setCellValue('A' . ($rowCurrent + 2), "We trust that above offer is in line with your requirements and looking forward to receive your valuable confirmation.");
        $sheet->setCellValue('A' . ($rowCurrent + 4), "Please do not hesitate to contact the undersigned should you need further assistance or clarification.");
        $sheet->setCellValue('A' . ($rowCurrent + 6), "Thank You.");
        $sheet->setCellValue('A' . ($rowCurrent + 8), "Yours faithfully,");
        $sheet->setCellValue('A' . ($rowCurrent + 10), "Multi Contracts");

    }
}
