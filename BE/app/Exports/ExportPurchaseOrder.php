<?php

namespace App\Exports;


use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExportPurchaseOrder implements WithStyles
{
    private $purchase;
    private $vendor;
    private $purchase_order_items;

    public function __construct($purchase, $vendor, $purchase_order_items)
    {
        $this->purchase = $purchase;
        $this->vendor = $vendor;
        $this->purchase_order_items = $purchase_order_items;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->setCellValue('A1', $this->vendor->company_name);
        $sheet->setCellValue('A2', $this->vendor->address['address_1']);
        $sheet->setCellValue('A3', $this->vendor->address['address_2']);
        $sheet->setCellValue('A4', $this->vendor->postal_code);
        $sheet->setCellValue('A6', "Attention : " . $this->vendor->vendor_name);
        $sheet->setCellValue('A8', "HP: " . $this->vendor->phone_number);
        $sheet->setCellValue('A9', "Email : " . $this->vendor->email);

        $rowCurrent = $sheet->getHighestRow();

        $sheet->setCellValue('A' . ($rowCurrent + 2), "We are pleased to append herein our Purchase Order for your product :");
        $sheet->setCellValue('F1', $this->purchase->purchase_order_no);
        $sheet->setCellValue('F3', \Carbon\Carbon::now()->format('d/m/Y'));
        $sheet->setCellValue('F6', 'COD');
        $tableData = [
            ['ITEM CODE', 'DESCRIPTION', '', 'QTY', 'U/RATE', 'AMOUNT'],
        ];
        foreach ($this->purchase_order_items as $key => $value) {
            $tableData[] = [
                $value->item_code,
                $value->item_description,
                '',
                intval($value->quantity),
                '$ ' . number_format($value->unit_price, 2, '.', ','),
                '$ ' . number_format($value->unit_price * $value->quantity, 2, '.', ',')
            ];
        }
        $gst = floatval($this->purchase->subtotal ?? 0) * floatval($this->purchase->tax) / 100;
        $total_amount = floatval($this->purchase->subtotal) + floatval($this->purchase->shipping_fee ?? 0) - floatval($this->purchase->discount_amount ?? 0) + floatval($gst);
        $tableData[] = ['', '', '', '', 'Sub Total (Before GST) :', '$ ' . number_format($this->purchase->subtotal, 2, '.', ',')];
        $tableData[] = ['', '', '', '', 'Shipping Fee :', '$ ' . number_format($this->purchase->shipping_fee, 2, '.', ',')];
        $tableData[] = ['', '', '', '', 'Discount :', '$ ' . number_format($this->purchase->discount_amount, 2, '.', ',')];
        $tableData[] = ['', '', '', '', 'Add ' . intval($this->purchase->tax) . '% GST :', '$ ' . number_format($gst, 2, '.', ',')];
        $tableData[] = ['', '', '', '', 'Total Payable : ', '$ ' . number_format($total_amount, 2, '.', ',')];
        $rowCurrent = $sheet->getHighestRow();
        $sheet->fromArray($tableData, null, 'A' . ($rowCurrent + 2));
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . ($rowCurrent + 1), "If you have any questions about this purchase order, please contact");
        $rowCurrent = $sheet->getHighestRow();
        $sheet->setCellValue('A' . ($rowCurrent + 2), "MULTI CONTRACTS PTE LTD");
    }
}
