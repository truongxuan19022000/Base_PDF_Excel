<?php

namespace App\Exports;

use App\Repositories\InvoiceRepository;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExportInvoice implements WithStyles
{
    private $invoiceRepository;
    private $quotation;
    private $customer;
    private $bill_schedules;
    private $invoice;

    public function __construct($invoice, $quotation, $customer, $bill_schedules)
    {
        $this->invoiceRepository = app(InvoiceRepository::class);
        $this->invoice = $invoice;
        $this->quotation = $quotation;
        $this->customer = $customer;
        $this->bill_schedules = $bill_schedules;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->setCellValue('A1', $this->customer->company_name);
        $sheet->setCellValue('A2', $this->customer->address['address_1']);
        $sheet->setCellValue('A3', $this->customer->address['address_2']);
        $sheet->setCellValue('A5', "Attention : " . $this->customer->name);
        $sheet->setCellValue('A7', "HP: " . $this->customer->phone_number);
        $sheet->setCellValue('A8', "Email : " . $this->customer->email);

        $longTextLines = explode("\n", wordwrap($this->quotation->description, 80, "\n", true));
        $rowCurrent = $sheet->getHighestRow() + 2;
        for ($i = 0; $i < count($longTextLines); $i++) {
            $sheet->setCellValue('A' . ($rowCurrent + $i + 1), $longTextLines[$i]);
        }
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . ($rowCurrent + 2), "We are pleased to append herein our Tax Invoice for your payment :");
        $sheet->setCellValue('D1', $this->invoice->invoice_no);
        $sheet->setCellValue('D3', \Carbon\Carbon::parse($this->invoice->issue_date)->format('d/m/Y'));

        $tableData = [
            ['S/N', 'DESCRIPTION', '', 'RATE'],
            ['A', 'RE. OUR QUOTATION NO. ' . $this->quotation->reference_no . "\n" . 'DATED ' . \Carbon\Carbon::parse($this->quotation->issue_date)->format('d/m/y'), '', '$ ' . number_format($this->quotation->grand_total_from_quotation, 2, '.', ',')],
            ['B', 'Schedule of Bills:', '', ''],
        ];
        foreach ($this->bill_schedules as $key => $value) {
            $tableData[] = ['B.' . ($key + 1), $value->type_invoice_statement, '', '$ ' . number_format($value->amount, 2, '.', ',')];
        }

        $sub_total = floatval($this->invoice->total_amount);
        $gst = floatval($this->invoice->total_amount) * ($this->invoice->tax) / 100;
        $total_payable = $sub_total + $gst;

        $tableData[] = ['', '', 'Sub Total (Before GST) :', '$ ' . number_format($sub_total, 2, '.', ',')];
        $tableData[] = ['', '', 'Add ' . $this->invoice->tax . '% GST :', '$ ' . number_format($gst, 2, '.', ',')];
        $tableData[] = ['', '', 'Total Payable :', '$ ' . number_format($total_payable, 2, '.', ',')];
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableData, null, 'A' . ($rowCurrent + 2));
        $text = "Please examine this Invoice immediately. If no discrepancy is reported within 3 working days from the date above, it is deemed to be correct and accepted by you. Kindly issue, transfer payment / cheque payable to:";
        $descriptionLines = explode("\n", wordwrap($text, 80, "\n", true));
        $rowCurrent = $sheet->getHighestRow() + 1;
        for ($i = 0; $i < count($descriptionLines); $i++) {
            $sheet->setCellValue('A' . ($rowCurrent + $i + 1), $descriptionLines[$i]);
        }
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . ($rowCurrent + 1), "Multi Contracts. Pte Ltd' UOB Ltd Account No. 769-3347-150 or Paynow to ROC No. 202230596D");
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . ($rowCurrent + 2), "MULTI CONTRACTS PTE LTD");
    }
}
