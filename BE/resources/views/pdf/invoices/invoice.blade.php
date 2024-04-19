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
        <title>{{ $invoice->invoice_no }}</title>
    </head>
    <body>
        <header>
            <span class="page-num font-13"></span>
        </header>
        <div class="image-title">
            <img src="{{ public_path('image/header.jpg') }}" height="100px" title="header">
        </div>

		<div class="content pt-20">
			@if ($quotation)
			<div class="content-header" style="position: relative;">
				<div class="header-content-left" style="position: absolute; top: 0; left: 0">
					<div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
					<div>{{ $quotation->customer->address['address_1'] }}</div>
					<div>{{ $quotation->customer->address['address_2'] }}</div>
					<div class="mb-20">{{ $quotation->customer->postal_code }}</div>
					<div class="font-weight-bold text-underline mb-20">Attention: {{ $quotation->customer->name }}</div>
					<div>HP: {{ $quotation->customer->phone_number }}</div>
					<div>email: {{ $quotation->customer->email }}</div>
				</div>
                @if($invoice)
				<div class="header-content-right" style="position: absolute; top: 0; right: 0;">
					<div class="font-weight-bold" style="margin-bottom: 8px">{{ $invoice->invoice_no }}</div>
                    <div class="" style="visibility: hidden;">By Email only</div>
					<div>{{ \Carbon\Carbon::parse($invoice->issue_date)->format('d/m/Y') }}</div>
                    <div class="" style="visibility: hidden;">By Email only</div>
                    <div>COD</div>
				</div>
                @endif
			</div>
			<div class="header-description w-100 font-weight-bold mt-12 font-13" style="margin-top: {{ !empty($quotation->customer->company_name) ? '160px' : '140px' }}">{{ $quotation->description }}</div>
			@endif
			<div class="font-13 mt-12">We are pleased to append herein our Tax Invoice for your payment :</div>
		</div>
			<table class="mt-24 page-1">
				<thead>
					<tr class="border-solid">
						<th width="20%">S/N</th>
						<th width="80%" colspan="4" class="description-column">DESCRIPTION</th>
						<th width="20%">RATE</th>
					</tr>
				</thead>
                <tbody>
                <tr>
                    <td class="text-center border-right-solid  border-left-solid">A</td>
                    <td colspan="4" class="text-underline border-right-solid  font-weight-bold mt-12 font-13">
                        RE. OUR QUOTATION NO. {{$quotation->reference_no}}
                        <br/>
                        DATED {{ \Carbon\Carbon::parse($quotation->issue_date)->format('d/m/y') }}
                    </td>
                    <td style="padding-top: 20px;" class="text-center hr-padding font-weight-bold border-right-solid  border-dash-bottom">$ {{ number_format($quotation->grand_total_from_quotation ?? 0, '2' , '.', ',') }}
                        <hr style="margin: 0; padding: 0; border: none; height: 1px; background: #000000;">
                    </td>
                </tr>
                <tr>
                    <td class="text-center border-right-solid  border-left-solid">B</td>
                    <td colspan="4" class="text-underline border-right-solid font-weight-bold mt-12 font-11">Schedule of Bills:</td>
                    <td class="border-right-solid  "></td>
                </tr>
                @foreach ($bill_schedules as $key => $value)
                    <tr class={{ $key + 1 == count($bill_schedules) ? "border-bottom-solid" : ""}}>
                        <td class="text-center border-right-solid  border-left-solid">B.{{ $key + 1 }}</td>
                        <td colspan="4" class="border-right-solid  ">{{ $value->type_invoice_statement }}</td>
                        <td class="text-center border-right-solid ">$ {{ number_format($value->amount ?? 0, '2' , '.', ',') }}</td>
                    </tr>
                @endforeach
                @php
                $sub_total= floatval($invoice->total_amount ?? 0);
                $gst = floatval($invoice->total_amount ?? 0) * ($invoice->tax) / 100;
                $total_payable  = floatval($sub_total) + floatval($gst);
                @endphp
                <tr>
                    <td class="text-center border-left-solid border-dash-bottom"></td>
                    <td colspan="4" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Sub Total (Before GST) :</td>
                    <td class="text-center border-right-solid border-dash-bottom">$ {{ number_format($sub_total ?? 0, '2' , '.', ',') }}</td>
                </tr>
                <tr>
                    <td class="text-center border-left-solid border-dash-bottom"></td>
                    <td colspan="4" class="text-right border-right-solid border-dash-bottom mt-12 font-11">Add {{$invoice->tax}}% GST :</td>
                    <td class="text-center border-right-solid border-bottom-solid">$ {{ number_format($gst, '2' , '.', ',') }}</td>
                </tr>
                <tr>
                    <td class="text-center border-left-solid border-bottom-solid"></td>
                    <td colspan="4" class="text-right border-right-solid border-bottom-solid font-weight-bold mt-12 font-11">Total Payable :</td>
                    <td class="text-center border-right-solid border-bottom-solid font-weight-bold">$ {{ number_format($total_payable ?? 0, '2' , '.', ',') }}</td>
                </tr>
                </tbody>
			</table>
		</div>
        <div class="font-13 mb-20">
            <span class="mt-12 d-block">
                Please examine this Invoice immediately. If no discrepancy is reported within 3 working days from the date above, it is deemed to be correct and accepted by you. Kindly issue, transfer payment / cheque payable to:
            <span class="mt-12 d-block font-weight-bold">Multi Contracts. Pte Ltd' UOB Ltd Account No. 769-3347-150  or Paynow to ROC No. 202230596D</span>
            </span>
        </div>
        <div class="font-13 font-weight-bold">MULTI CONTRACTS PTE LTD</div>
        <img src="{{ public_path('image/signature_invoice.png') }}" title="header" class="signature border-bottom-solid">
        <div class="font-13">Authorised Signature
        </div>
    </body>
</html>
