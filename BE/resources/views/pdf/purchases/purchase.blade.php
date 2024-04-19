<html>
<head>
    <style>
        @page {
            margin: 20px 48px 40px 48px;
        }

        header {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 5px;
            text-align: center;
            line-height: 5px;
        }

        .image-title {
            left: 0px;
            right: 0px;
            height: 60px;
            min-height: 60px;
        }

        .page-num:before {
            content: counter(page);
        }

        img {
            width: 100%
        }

        .content-header {
            margin-top: 60px;
            width: 100%;
            font-size: 13px;
        }

        .font-weight-bold {
            font-weight: bold;
        }

        .mb-20 {
            margin-bottom: 10px;
        }

        .text-underline {
            text-decoration: underline;
        }

        .ml-12 {
            margin-left: 260px;
        }

        .w-100 {
            width: 100%;
        }

        .mt-24 {
            margin-top: 14px;
        }

        .font-13 {
            font-size: 13px;
        }

        .mt-12 {
            margin-top: 8px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 12px;
        }

        th {
            border: 1px solid #000000;
            padding: 2px;
        }

        th.description-column {
            width: 60%;
        }

        .text-left {
            text-align: left;
        }

        .text-center {
            text-align: center;
        }

        .text-red {
            color: red;
        }

        .border-dash-right {
            border-right: 2px dashed #000000;
        }

        .border-dash-top {
            border-top: 1px solid #000000;
        }

        .hr-padding{
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-bottom: 0 !important;
        }
        .border-dash-bottom {
            border-bottom: 1px solid #000000;
        }

        .border-left-solid {
            border-left: 2px solid #000000;
        }

        .border-right-solid {
            border-right: 2px solid #000000;
        }

        .border-bottom-solid {
            border-bottom: 2px solid #000000;
        }

        .border-solid {
            border: 2px solid #000000;
        }

        .page-1 td {
            padding: 4px;
        }

        .wrapper {
            padding-top: 60px;
        }

        body {
            margin: 0;
            padding: 0;
        }

        .text-italic {
            font-style: italic
        }

        .mr-12 {
            margin-right: 12px;
        }

        .text-right {
            text-align: right;
        }

        .d-block {
            display: block;
        }

        .signature {
            margin-top: 12px;
            width: 120px;
        }

        .p-0 {
            padding: 0;
        }

        .m-0 {
            margin: 0;
        }

        .vertical-top {
            vertical-align: top;
        }

        .page_break {
            page-break-before: always;
        }

        .w-25 {
            width: 25%;
        }

        .w-50 {
            width: 50%;
        }

        .pt-20 {
            padding-top: 20px;
        }
    </style>
    <title>{{ $purchase->purchase_order_no }}</title>
</head>
<body>
    <header>
        <span class="page-num font-13"></span>
    </header>
    <div class="image-title">
        <img src="{{ public_path('image/header.jpg') }}" height="100px" title="header">
    </div>

    <div class="content">
        @if($vendor)
            <div class="content-header" style="position: relative;">
                <div class="header-content-left" style="position: absolute; top: 0; left: 0">
                    <div class="font-weight-bold">{{ $vendor->company_name }}</div>
                    <div>{{ $vendor->address['address_1'] }}</div>
                    <div>{{ $vendor->address['address_2'] }}</div>
                    <div class="mb-20">{{ $vendor->postal_code }}</div>
                    <div class="font-weight-bold text-underline mb-20">Attention: {{ $vendor->vendor_name }}</div>
                    <div>HP: {{ $vendor->phone }}</div>
                    <div>email: {{ $vendor->email }}</div>
                </div>
                <div class="header-content-right" style="position: absolute; top: 0; right: 0;">
                    <div class="font-weight-bold" style="margin-bottom: 8px">{{ $purchase->purchase_order_no }}</div>
                    <div class="" style="visibility: hidden;">By Email only</div>
                    <div>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</div>
                    <div class="" style="visibility: hidden;">By Email only</div>
                    <div>COD</div>
                </div>
            </div>
            <div class="header-description w-100 font-weight-bold mt-12 font-13" style="margin-top: 140px"></div>
        @endif
        <div class="font-13 mt-12">We are pleased to append herein our Purchase Order for your product :</div>
    </div>
    <table class="mt-24 page-1">
        <thead>
        <tr class="border-solid">
            <th width="20%">ITEM CODE</th>
            <th width="80%" class="description-column">DESCRIPTION</th>
            <th width="20%">QTY</th>
            <th width="20%">U/RATE</th>
            <th width="30%">AMOUNT</th>
        </tr>
        </thead>
        <tbody>
        @foreach ($purchase_order_items as $key => $value)
            <tr class={{ $key + 1 == count($purchase_order_items) ? "border-bottom-solid" : ""}}>
                <td class="border-right-solid border-left-solid">{{ $value->item_code }}</td>
                <td class="border-right-solid border-left-solid">{{ $value->item_description }}</td>
                <td class="border-right-solid border-left-solid">{{ intval($value->quantity) }}</td>
                <td class="text-center border-right-solid ">$ {{ number_format($value->unit_price, '2' , '.', ',') }}</td>
                <td class="text-center border-right-solid ">
                    ${{ number_format($value->unit_price * $value->quantity, '2' , '.', ',') }}</td>
            </tr>
        @endforeach
        @php
            $gst = floatval($purchase->subtotal) * floatval($purchase->tax) / 100;
            $total_amount = floatval($purchase->subtotal) + floatval($purchase->shipping_fee) - floatval($purchase->discount_amount) + floatval($gst);
        @endphp
        <tr>
            <td class="text-center border-left-solid border-dash-bottom"></td>
            <td colspan="3" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Sub Total (Before GST) :</td>
            <td class="text-center border-right-solid border-dash-bottom">$ {{ number_format(floatval($purchase->subtotal), '2' , '.', ',') }}</td>
        </tr>
        <tr>
            <td class="text-center border-left-solid border-dash-bottom"></td>
            <td colspan="3" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Shipping Fee :</td>
            <td class="text-center border-right-solid border-dash-bottom">$ {{ number_format(floatval($purchase->shipping_fee), '2' , '.', ',') }}</td>
        </tr>
        <tr>
            <td class="text-center border-left-solid border-dash-bottom"></td>
            <td colspan="3" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Discount :</td>
            <td class="text-center border-right-solid border-dash-bottom">$ {{ number_format(floatval($purchase->discount_amount), '2' , '.', ',') }}</td>
        </tr>
        <tr>
            <td class="text-center border-left-solid border-dash-bottom"></td>
            <td colspan="3" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Add {{ intval($purchase->tax) }}% GST :</td>
            <td class="text-center border-right-solid border-bottom-solid">$ {{ number_format($gst, '2' , '.', ',') }}</td>
        </tr>
        <tr>
            <td class="text-center border-left-solid border-bottom-solid"></td>
            <td colspan="3" class="text-right border-right-solid border-bottom-solid font-weight-bold mt-12 font-11">Total Payable :
            </td>
            <td class="text-center border-right-solid border-bottom-solid font-weight-bold">$ {{ number_format($total_amount, '2' , '.', ',') }}</td>
        </tr>
        </tbody>
    </table>
    </div>
    <div class="font-13 mb-20">
        <span class="mt-12 d-block">
            If you have any questions about this purchase order, please contact.
        </span>
    </div>
    <div class="font-13 font-weight-bold">MULTI CONTRACTS PTE LTD</div>
    <img src="{{ public_path('image/signature_invoice.png') }}" title="header" class="signature border-bottom-solid">
    <div class="font-13">Authorised Signature
    </div>
</body>
</html>
