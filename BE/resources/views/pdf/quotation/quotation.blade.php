<html>
    <head>
        <style>
            @page {
                margin: 140px 48px 100px 48px;
            }

            header {
                position: fixed;
                top: -100px;
                left: 0px;
                right: 0px;
                height: 60px;
				min-height: 60px;
				bottom: 24px
            }

            img {
                width: 100%
            }

			.content-header {
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

			.text-red {
				color: red;
			}

			.border-dash-right {
				border-right: 1px dashed #ccc;
			}

			.boder-left-solid {
				border-left: 1px solid #ccc;
			}

			.boder-right-solid {
				border-right: 1px solid #ccc;
			}

			.boder-bottom-solid {
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
			<img src="{{ public_path('image/header.png') }}" title="header">
		</header>

		<div class="content">
			@if ($quotation)
			<div class="content-header" style="position: relative;">
				<div class="header-content-left" style="position: absolute; top: 0; left: 0">
					<div style="margin-bottom: 12px">Our Reference: {{ $quotation->reference_no }}</div>
					<div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
					<div>{{ $quotation->customer->address['address_1'] }}</div>
					<div>{{ $quotation->customer->address['address_2'] }}</div>
					<div class="mb-20">{{ $quotation->customer->postal_code }}</div>
					<div class="font-weight-bold text-underline">Attention: {{ $quotation->customer->name }}</div>
				</div>
				<div class="header-content-right" style="position: absolute; top: 0; right: 0;">
					<div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::now()->format('j-M-y') }}</div>
					<div>Tel: {{ $quotation->customer->phone_number }}</div>
					<div>Fax: </div>
					<div>Email: {{ $quotation->customer->email }}</div>
					<div class="mb-20" style="visibility: hidden;">Email: htar@jinmac.org</div>
					<div style="visibility: hidden;">By Email only</div>
				</div>
			</div>
			<div class="header-description w-100 font-weight-bold mt-12 font-13" style="margin-top: {{ !empty($quotation->customer->company_name) ? '120px' : '110px' }}">{{ $quotation['description'] }}</div>
			@endif
			<div class="font-13 mt-12">We thank you for inviting us to quote for the above-mentioned works. We are pleased to append herein our quotation with our terms and condition for your perusal and confirmation.</div>
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
			<tbody class="text-red">
				<tr class="boder-bottom-solid">
					<td class="text-center border-dash-right boder-left-solid">A</td>
					<td class="text-underline border-dash-right">General information or/and note for deviation</td>
					<td class="border-dash-right"></td>
					<td class="border-dash-right"></td>
					<td class="border-dash-right"></td>
					<td class="boder-right-solid"></td>
				</tr>
				@if (count($quotation_notes) > 0)
				@foreach ($quotation_notes as $key => $value)
				<tr class={{ $key + 1 == count($quotation_notes->toArray()) ? "boder-bottom-solid" : ""}}>
					<td class="text-center border-dash-right boder-left-solid">A.{{ $key + 1 }}</td>
                    <td class="border-dash-right">{!! nl2br(e($value['description'])) !!}</td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center border-dash-right"></td>
					<td class="text-center boder-right-solid">{{ $value['type'] ? config('quotation.note_type')[$value['type']] : '' }}</td>
				</tr>
				@endforeach
				@endif
			</tbody>
		</table>
		<div class="page_break"></div>
		<div class="second-page">
			@if ($quotation)
			<div class="content">
				<div class="content-header" style="position: relative">
					<div class="header-content-left" style="position: absolute; top: 0; left: 0">
						<div style="margin-bottom: 12px">Our Reference: {{ $quotation['reference_no'] }}</div>
						<div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
						<div style="visibility: hidden;">Email: {{ $quotation->customer->email }}</div>
						<div class="font-weight-bold text-underline">Attention: {{ $quotation->customer->name }}</div>
					</div>
					<div class="header-content-right" style="position: absolute; top: 0; right: 0;">
						<div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::now()->format('j-M-y') }}</div>
						<div style="visibility: hidden;">Email</div>
						<div class="" style="visibility: hidden;">By Email only</div>
						<div class="" style="visibility: hidden;">By Email only</div>
					</div>
				</div>
				<div class="header-description w-100 font-weight-bold mt-12 font-13" style="margin-top: 80px">{{ $quotation['description'] }}</div>
			</div>
			@endif
			<table class="mt-24 page-1">
				<thead>
					<tr class="boder-bottom-solid">
						<th width="10%">S/N</th>
						<th width="60%" colspan="4" class="description-column">DESCRIPTION</th>
						<th width="5%">UNIT</th>
						<th width="5%">QTY</th>
						<th width="10%">U/RATE</th>
						<th width="10%">RATE</th>
					</tr>
				</thead>
				<tbody>
					<tr class="boder-bottom-solid">
						<td class="text-center border-dash-right boder-left-solid">B</td>
						<td colspan="4" class="text-underline border-dash-right font-weight-bold">Schedule of Bills / Quotation:</td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="boder-right-solid"></td>
					</tr>
					@if (count($quotation_sections) > 0)
                        <tr>
                            <td class="text-center border-dash-right boder-left-solid">B.1</td>
                            <td colspan="4" class="border-dash-right">Supply, delivery and installation of POWDER COATED finish aluminium framed doors and windows, complete with ironmongeries or/and accessories to given schedule described but to aluminium fabricator details. </td>
                            <td class="border-dash-right"></td>
                            <td class="border-dash-right"></td>
                            <td class="border-dash-right"></td>
                            <td class="boder-right-solid"></td>
                        </tr>
                    @php
                        $sumProducts = 0;
                    @endphp
					@foreach ($quotation_sections as $key => $value)
						<tr class={{ $key + 1 == count($quotation_sections) ? "boder-bottom-solid" : ""}}>
							<td class="text-center border-dash-right boder-left-solid">B.1.{{ $key + 1 }}</td>
							<td colspan="4" class="text-underline border-dash-right font-weight-bold">{{ $value['section_name'] }}</td>
							<td class="border-dash-right"></td>
							<td class="border-dash-right"></td>
							<td class="border-dash-right"></td>
							<td class="boder-right-solid"></td>
						</tr>
						@foreach ($value->products as $item_key => $item_value)
						<tr class={{ $item_key + 1 == count($value->products) ? "boder-bottom-solid" : ""}}>

							<td class="text-center border-dash-right boder-left-solid">B.1.{{ $key + 1 }}.{{ $item_key + 1 }}</td>
                            <td class="font-weight-bold" colspan="1">{{ $item_value->product_code }}</td>
                            <td class="text-italic" colspan="1">
                                {{
                                   (empty($item_value->storey_text) ? ($item_value->storey ? config('common.storey_type')[$item_value->storey] : '') : $item_value->storey_text) .';'.
                                   (empty($item_value->area_text) ? ($item_value->area ? config('common.area_type')[$item_value->area] : '') : $item_value->area_text)
                                }}
                            </td>
                            <td class="text-italic" colspan="1">{{ $item_value->glass_type }}</td>
                            <td class="font-weight-bold border-dash-right" colspan="1">{{ $item_value->width.' x '.$item_value->height . ' '. 'mm'}}</td>
							<td class="text-center border-dash-right font-weight-bold">No</td>
							<td class="text-center border-dash-right font-weight-bold">{{ $item_value->quantity }}</td>
							<td class="text-center border-dash-right font-weight-bold">$ {{ number_format($item_value->subtotal, '2' , '.', ',') }}</td>
							<td class="text-center boder-right-solid font-weight-bold">$ {{ number_format($item_value->subtotal * $item_value->quantity, '2' , '.', ',') }}</td>
						</tr>
						@php
							$sumProducts += $item_value->subtotal * $item_value->quantity;
						@endphp
						@endforeach
					@endforeach
					@endif
				</tbody>
			</table>
		</div>
		<div class="page_break"></div>
		<div class="last-page">
			<div class="content">
				@if ($quotation)
				<div class="content-header" style="position: relative">
					<div class="header-content-left" style="position: absolute; top: 0; left: 0">
						<div style="margin-bottom: 12px">Our Reference: {{ $quotation->reference_no }}</div>
						<div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
						<div style="visibility: hidden;">Email: htar@jinmac.org</div>
						<div class="font-weight-bold text-underline">Attention: {{ $quotation->customer->name }}</div>
					</div>
					<div class="header-content-right" style="position: absolute; top: 0; right: 0">
						<div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::now()->format('j-M-y') }}</div>
						<div style="visibility: hidden;">Email: htar@jinmac.org</div>
						<div class=""style="visibility: hidden;">By Email only</div>
						<div class=""style="visibility: hidden;">By Email only</div>
					</div>
				</div>
				<div class="header-description w-100 font-weight-bold mt-12 font-13" style="margin-top: 80px">{{ $quotation['description'] }}</div>
				@endif
			</div>
			<table class="mt-12 page-1">
				<thead>
					<tr>
						<th style="width: 8%">S/N</th>
						<th class="description-column" style="width: 50%">DESCRIPTION</th>
						<th style="width: 4%">UNIT</th>
						<th style="width: 4%">QTY</th>
						<th style="min-width: 15%">U/RATE</th>
						<th style="min-width: 3%">RATE</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="text-center border-dash-right boder-left-solid">C</td>
                        <td class="text-underline border-dash-right"><span class="font-weight-bold">Other Fees : (Optional)</span></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="border-dash-right"></td>
						<td class="boder-right-solid"></td>
					</tr>
					@if ($other_fees)
					@foreach ($other_fees as $key => $item)
						<tr class={{ $key + 1 == count($other_fees) ? "boder-bottom-solid" : ""}}>
							<td class="text-center border-dash-right boder-left-solid">C.{{ $key+1 }}</td>
							<td class="border-dash-right">{{ $item->description }}</td>
							<td class="text-center border-dash-right font-weight-bold">Sum</td>
							<td class="text-center border-dash-right font-weight-bold"></td>
							<td class="text-center border-dash-right font-weight-bold"></td>
							@php
								$otherFeetype = config('quotation.other_fee_type');
								$flippedArray = array_flip($otherFeetype);
								$flippedArray = array_map('ucfirst', $flippedArray);
							@endphp
							<td class="text-center boder-right-solid font-weight-bold">{{ $item->type == config('quotation.other_fee_type.excluded') ? $flippedArray[$item->type] : number_format($item->amount, '2' , '.', ',') }}</td>
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
						<td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">C.6</td>
						<td></td>
						<td class="text-center font-weight-bold" colspan="3" style="border-left: 1px solid #ccc">Sub Total for C (Before GST):</td>
						<td class="text-center font-weight-bold">$ {{ number_format(($sumOtherFee ?? 0), '2' , '.', ',')}}</td>
					</tr>
					<tr  style="border: 1px solid #ccc">
						<td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">D.1</td>
						<td></td>
						<td class="text-center font-weight-bold" colspan="3" style="border-left: 1px solid #ccc">Total for B + C (Before GST):</td>
						<td class="text-center font-weight-bold">$ {{ number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0), '2' , '.', ',') }}</td>
					</tr>
				</tbody>
			</table>
            @if(strlen($quotation['description']) > 175 || count($other_fees) > 3)
                <div class="page_break"></div>
            @endif
			<div class="w-100 text-underline font-weight-bold mt-12"><div class="font-13" style="margin-left: 44px">TERMS & CONDITIONS</div></div>
			<table style="margin-left: 24px; width: 98%">
				<tbody>
					<tr>
						<td style="width: 3%" class="vertical-top">1</td>
						<td>Above amount quoted subjected to prevailing GST.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">2</td>
						<td>Above amount and quantities quoted are based on the information / drawing provided by you at the time of preparing the quotation and subjected to remeasurement, if deviated from the original design intent. (without specification)</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">3</td>
						<td>The above aluminium framing offer herein are extruded in 6063-T5 alloy with one coat polyester powder coated finish system  (minimum 35 microns), cut and conventional assembled to aluminium fabricator details with one layer of protection tape onto surface finished. Subjected to remeasurement, if deviated from the original design intent.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">4</td>
						<td>Clients' to provide free and full general facilities inclusive attendance on site for materials hoisting, lift access for uploading & placing of materials to upper level, working staging, platform, works at height equipments, scaffolding, elevated mobile platform, grouting materials, water & electricity and including forming of opening, hacking and making good of concrete structures or adjacent finishes during the course of our installation works.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">5</td>
						<td>All steel framing support, RC stiffeners or lintel in connection to our aluminium works shall be provided by Clients'.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">6</td>
						<td>Terms of payments shall be {{ $quotation['terms_of_payment_confirmation'] }}% upon confirmation. Balance {{ $quotation['terms_of_payment_balance'] }}% shall be payable through our monthly progress claims with payments to be made to us within 30 days from the date of submission of each progress claim (e.g.: 45% on installation of outer frame, 55% on installation of inner panel against value of rate priced or based on individual element breakdown. The deposit sum collected shall be offset or deduction make in the way of monthly drawdown against the percentage of works done certified) and without retention.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">7</td>
						<td>Validity period of our quotation offer is 7 days from the date of this quotation.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">8</td>
						<td>Any items not specifically called out herein must be considered exclusive from this quotation.</td>
					</tr>
					<tr>
						<td style="width: 3%" class="vertical-top">9</td>
						<td>In case of discrepancy, this quotation shall take precedence.</td>
					</tr>
				</tbody>
			</table>

			<table class="mt-12">
				<tbody>
					<tr>
						<td style="width: 80%">Total amount for the above mentioned works quoted in Singapore dollar (Before GST) : </td>
						<td class="font-weight-bold text-right text-underline">$ {{ number_format(($sumOtherFee ?? 0) + ($sumProducts ?? 0), '2' , '.', ',') }}</td>
					</tr>
				</tbody>
			</table>
			<div class="font-13">
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
			<div class="font-13 font-weight-bold">Multi Contracts</div>
			<img src="{{ public_path('image/signature.png') }}" title="header" class="signature">
			<table>
				<tbody>
					<tr>
						<td style="width: 25%; border-top: 1px solid #000" class="text-left vertical-top">Mr. Shamus Tan</td>
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
