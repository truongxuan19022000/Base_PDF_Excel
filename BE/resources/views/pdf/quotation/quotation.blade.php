<html>
    <head>
        <style>
            @page {
                margin: 160px 48px 50px 48px;
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

            .content {
                position: fixed;
                top: -140px;
                left: 0px;
                right: 0px;
                height: 60px;
                min-height: 60px
            }

            .image-title {
                margin-top: -120px;
                left: 0px;
                right: 0px;
            }

            .page-num:before {
                content: counter(page);
            }

            img {
                width: 100%
            }

			.content-header {
				width: 100%;
				font-size: 12px;
			}

            .content-first-header {
				width: 100%;
				font-size: 12px;
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

			.font-12 {
				font-size: 12px;
			}

			.mt-12 {
				margin-top: 8px;
			}

			table {
				width: 100%;
				border-collapse: collapse;
				margin-top: 8px;
				font-size: 11px;
			}

			th {
				border: 1px solid #ccc;
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

			.border-dash-right {
				border-right: 1px dashed #ccc;
			}

			.border-left-solid {
				border-left: 1px solid #ccc;
			}

			.border-right-solid {
				border-right: 1px solid #ccc;
			}

			.border-bottom-solid {
				border-bottom: 1px solid #ccc;
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

            .pt-60 {
                padding-top: 60px;
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
        </style>
        <title>{{ $quotation ? $quotation->reference_no : null }}</title>
    </head>
    <body>
        <header>
            <span class="page-num font-12"></span>
        </header>
        <div class="image-title">
            <img src="{{ public_path('image/header.jpg') }}"  title="header">
        </div>

		<div class="content-first-header">
			@if ($quotation)
			<div class="content-first-header" style="position: relative;">
				<div class="header-content-left" style="position: absolute; top: 0; left: 0">
					<div style="margin-bottom: 12px">Our Reference: {{ $quotation->reference_no }}</div>
					<div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
					<div>{{ $quotation->customer->address['address_1'] }}</div>
					<div>{{ $quotation->customer->address['address_2'] }}</div>
					<div class="mb-20">{{ $quotation->customer->postal_code }}</div>
					<div class="font-weight-bold text-underline mb-20">Attention: Mr/Ms.{{ $quotation->customer->name }}</div>
					<div>Dear Mister/Madam</div>
				</div>
				<div class="header-content-right" style="position: absolute; top: 0; right: 0;">
					<div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y') }}</div>
					<div>Tel: {{ $quotation->customer->phone_number }}</div>
					<div>Fax: </div>
					<div>Email: {{ $quotation->customer->email }}</div>
					<div class="mb-20" style="visibility: hidden;">Email: htar@jinmac.org</div>
					<div style="visibility: hidden;">By Email only</div>
				</div>
			</div>
			<div class="header-description w-100 font-weight-bold mt-12 font-12" style="margin-top: {{ !empty($quotation->customer->company_name) ? '140px' : '130px' }}">{{ $quotation['description'] }}</div>
			@endif
			<div class="font-12 mt-12">{{ $quotation['quotation_description'] }}</div>
		</div>
		<table class="mt-24 page-1">
			<thead>
				<tr>
					<th style="width: 8%">S/N</th>
					<th class="description-column">DESCRIPTION</th>
					<th style="width: 4%">UNIT</th>
					<th style="width: 4%">QTY</th>
					<th style="min-width: 15%">U/RATE</th>
					<th style="min-width: 3%">RATE</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-bottom-solid">
					<td class="text-center border-dash-right border-left-solid">A</td>
					<td class="text-underline border-dash-right">General information or/and note for deviation</td>
					<td class="border-dash-right"></td>
					<td class="border-dash-right"></td>
					<td class="border-dash-right"></td>
					<td class="border-right-solid"></td>
				</tr>
				@if (count($quotation_notes) > 0)
				@foreach ($quotation_notes as $key => $value)
				<tr class={{ $key + 1 == count($quotation_notes->toArray()) ? "border-bottom-solid" : ""}}>
					<td class="text-center border-dash-right border-left-solid">A.{{ $key + 1 }}</td>
                    <td class="border-dash-right">{!! nl2br(e($value['description'])) !!}</td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center border-right-solid">{{ $value['type'] ? config('quotation.note_type')[$value['type']] : '' }}</td>
				</tr>
				@endforeach
				@endif
			</tbody>
		</table>
		<div class="page_break"></div>
        @if ($quotation)
            <div class="content" style="margin-bottom: 200px">
                <div class="content-header" style="position: relative;">
                    <div class="header-content-left" style="position: absolute; top: 0; left: 0">
                        <div style="margin-bottom: 12px">Our Reference: {{ $quotation['reference_no'] }}</div>
                        <div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
                        <div style="visibility: hidden;">Email: {{ $quotation->customer->email }}</div>
                        <div class="font-weight-bold text-underline">Attention: Mr/Ms.{{ $quotation->customer->name }}</div>
                    </div>
                    <div class="header-content-right" style="position: absolute; top: 0; right: 0;">
                        <div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y') }}</div>
                        <div style="visibility: hidden;">Email</div>
                        <div class="" style="visibility: hidden;">By Email only</div>
                        <div class="" style="visibility: hidden;">By Email only</div>
                    </div>
                </div>
                <div class="header-description w-100 font-weight-bold mt-12 font-12" style="margin-top: 80px;padding-bottom: 100px;">{{ $quotation['description'] }}</div>
            </div>
        @endif
		<div class="second-page">

			<table class="mt-24 page-1">
				<thead>
					<tr class="border-bottom-solid">
						<th width="5%">S/N</th>
						<th width="65%" colspan="4" class="description-column">DESCRIPTION</th>
						<th width="3%">UNIT</th>
						<th width="3%">QTY</th>
						<th width="12%">U/RATE</th>
						<th width="15%">RATE</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-bottom-solid">
						<td class="text-center border-dash-right border-left-solid">B</td>
						<td colspan="4" class="text-underline border-dash-right font-weight-bold">Schedule of Bills / Quotation:</td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-right-solid"></td>
					</tr>
					@if (count($quotation_sections) > 0)
                        <tr>
                            <td class="text-center border-dash-right border-left-solid">B.1</td>
                            <td colspan="4" class="border-dash-right">Supply, delivery and installation of POWDER COATED finish aluminium framed doors and windows, complete with ironmongeries or/and accessories to given schedule described but to aluminium fabricator details. </td>
                            <td class="border-dash-right"></td>
                            <td class="border-dash-right"></td>
                            <td class="border-dash-right"></td>
                            <td class="border-right-solid"></td>
                        </tr>
                    @php
                        $sumProducts = 0;
                    @endphp
					@foreach ($quotation_sections as $key => $value)
						<tr class={{ $key + 1 == count($quotation_sections) ? "border-bottom-solid" : ""}}>
							<td class="text-center border-dash-right border-left-solid">B.1.{{ $key + 1 }}</td>
							<td colspan="4" class="text-underline border-dash-right font-weight-bold">{{ $value['section_name'] }}</td>
							<td class="border-dash-right"></td>
							<td class="border-dash-right"></td>
							<td class="border-dash-right"></td>
							<td class="border-right-solid"></td>
						</tr>
						@foreach ($value->products as $item_key => $item_value)
						<tr class={{ $item_key + 1 == count($value->products) ? "border-bottom-solid" : ""}}>

							<td class="text-center border-dash-right border-left-solid">B.1.{{ $key + 1 }}.{{ $item_key + 1 }}</td>
                            <td class="font-weight-bold text-left" colspan="1" width="15%">{{ $item_value->product_code }}</td>
                            <td class="text-italic text-left" colspan="1" width="15%">
                                {{ ($item_value->storey_text ?? '').';'.($item_value->area_text ?? '') }}
                            </td>
                            <td class="text-italic text-left" colspan="1" width="20%">{{ $item_value->glass_type }}</td>
                            <td class="font-weight-bold border-dash-right text-left" colspan="1" width="15%">{{ $item_value->width.' x '.$item_value->height . ' '. 'mm'}}</td>
							<td class="text-center border-dash-right font-weight-bold">No</td>
							<td class="text-center border-dash-right font-weight-bold">{{ $item_value->quantity }}</td>
							<td class="text-center border-dash-right font-weight-bold text-left">$ {{ number_format($item_value->subtotal, '2' , '.', ',') }}</td>
							<td class="text-center border-right-solid font-weight-bold text-left">$ {{ number_format($item_value->subtotal * $item_value->quantity, '2' , '.', ',') }}</td>
						</tr>
						@php
							$sumProducts += $item_value->subtotal * $item_value->quantity;
                            $last_key = 0;
						@endphp
						@endforeach
					@endforeach
					@endif
				</tbody>
			</table>
		</div>
		<div class="page_break"></div>
		<div class="last-page">
			<table class="mt-12 page-1">
				<thead>
					<tr>
						<th width="5%">S/N</th>
						<th width="55%" class="description-column">DESCRIPTION</th>
						<th width="5%">UNIT</th>
						<th width="5%">QTY</th>
						<th width="3%">U/RATE</th>
						<th width="15%">RATE</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="text-center border-dash-right border-left-solid">C</td>
                        <td class="text-underline border-dash-right"><span class="font-weight-bold">Other Fees : (Optional)</span></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-right-solid"></td>
					</tr>
					@if ($other_fees)
					@foreach ($other_fees as $key => $item)
						<tr class={{ $key + 1 == count($other_fees) ? "border-bottom-solid" : ""}}>
							<td class="text-center border-dash-right border-left-solid">C.{{ $key+1 }}</td>
							<td class="border-dash-right">{{ $item->description }}</td>
							<td class="text-center border-dash-right font-weight-bold">Sum</td>
							<td class="text-center border-dash-right font-weight-bold"></td>
							<td class="text-center border-dash-right font-weight-bold"></td>
							@php
								$otherFeetype = config('quotation.other_fee_type');
								$flippedArray = array_flip($otherFeetype);
								$flippedArray = array_map('ucfirst', $flippedArray);
								$last_key = $key;
							@endphp
							<td class="text-center border-right-solid font-weight-bold">{{ $item->type == config('quotation.other_fee_type.excluded') ? $flippedArray[$item->type] : number_format($item->amount, '2' , '.', ',') }}</td>
						</tr>
					@endforeach
					@php
						$sumOtherFee = 0;
						foreach ($other_fees as $key => $item) {
							if ($item->type == config('quotation.other_fee_type.included')) {
								$sumOtherFee += $item->amount;
							}
						}
					@endphp
					@endif
					<tr style="border: 1px solid #ccc">
						<td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">C. {{ $last_key + 2 }}</td>
						<td class="text-right font-weight-bold border-right-solid" colspan="4">Sub Total for C (Before GST):</td>
						<td class="text-center font-weight-bold">$ {{ number_format(($sumOtherFee ?? 0), '2' , '.', ',')}}</td>
					</tr>
					<tr  style="border: 1px solid #ccc">
						<td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">D.1</td>
						<td class="text-right font-weight-bold border-right-solid" colspan="4">Total for B + C (Before GST):</td>
						<td class="text-center font-weight-bold">$ {{ number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0), '2' , '.', ',') }}</td>
					</tr>
                    <tr  style="border: 1px solid #ccc">
						<td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">D.2</td>
						<td class="text-right font-weight-bold border-right-solid" colspan="4">Discount:</td>
						<td class="text-center font-weight-bold">$ ({{ number_format(floatval($quotation->discount_amount), '2' , '.', ',') }})</td>
					</tr>
                    <tr  style="border: 1px solid #ccc">
                        <td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">D.3</td>
                        <td class="text-right font-weight-bold border-right-solid" colspan="4">Total for B + C - D2 (Before GST):</td>
                        <td class="text-center font-weight-bold">$ {{ number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0) - (floatval($quotation->discount_amount ?? 0)), '2' , '.', ',') }}</td>
                    </tr>
				</tbody>
			</table>
            @if(strlen($quotation['description']) > 175 || count($other_fees) > 3)
                <div class="page_break"></div>
            @endif
			<div class="w-100 text-underline font-weight-bold mt-12"><div class="font-13" style="margin-left: 44px">TERMS & CONDITIONS</div></div>
			<table style="margin-left: 24px; width: 98%">
				<tbody>
                @if($term_conditions)
                    @foreach($term_conditions as $term_condition)
                        <tr>
                            <td style="width: 3%" class="vertical-top">{{ $term_condition->order_number }}</td>
                            <td>{!! nl2br(e($term_condition->description)) !!}</td>
                        </tr>
                    @endforeach
                @endif
				</tbody>
			</table>

			<table class="mt-12">
				<tbody>
					<tr>
						<td style="width: 80%">Total amount for the above mentioned works quoted in Singapore dollar (Before GST) : </td>
						<td class="font-weight-bold text-right text-underline">$ {{ number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0) - (floatval($quotation->discount_amount ?? 0)), '2' , '.', ',') }}</td>
					</tr>
				</tbody>
			</table>
			<div class="font-12">
				<span class="mt-12 d-block">We trust that above offer is in line with your requirements and looking forward to receive your valuable confirmation.</span>
				<span class="mt-12 d-block">Please do not hesitate to contact the undersigned should you need further assistance or clarification.</span>
				<span class="mt-12 d-block">Thank You.</span>
			</div>

			<table>
				<tbody>
					<tr>
						<td style="width: 25%" class="text-left">Yours faithfully,</td>
						<td style="width: 25%"></td>
						<td style="width: 25%"></td>
						<td style="width: 25%" class="text-center">Accepted & Confirmed</td>
					</tr>
				</tbody>
			</table>
            <div class="font-12 font-weight-bold">Multi Contracts</div>
            @if($quotation->status === config('quotation.status.approved'))
                <img src="{{ public_path('image/signature.png') }}" title="header" class="signature">
            @else
                <div style="visibility: hidden; margin-top: 40px;"></div>
            @endif
			<table>
				<tbody>
					<tr>
						<td style="width: 25%; border-top: 1px solid #000" class="text-left vertical-top">
							{{ ($quotation->status === config('quotation.status.approved')) ? "Mr. Shamus Tan" : null }}
						</td>
						<td style="width: 25%;"></td>
						<td style="width: 25%"></td>
						<td style="width: 25%; border-top: 1px solid #000">
							<span class="d-block">Name & Company</span>
							<span class="d-block">Designation:</span>
							<span class="d-block">Signature</span>
							<span class="d-block">Date:</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
    </body>
</html>
