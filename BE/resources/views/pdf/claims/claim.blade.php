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
            font-weight: normal;
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

        .pt-20 {
            padding-top: 20px;
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
    <title>{{ !empty($claim['claim_no']) ? $claim['claim_no'] : null }}</title>
</head>
<body>
    <header>
        <span class="page-num font-12"></span>
    </header>
    <div class="image-title">
        <img src="{{ public_path('image/header.jpg') }}" height="100px"  title="header">
    </div>

    <div class="content pt-20">
        @php
            $total_current = 0;
            $last_key = 0;
            $total_accumulative = 0;
            $discount_amount = 0;
        @endphp
        @if ($quotation)
            <div class="content-header" style="position: relative;">
                <div class="header-content-left" style="position: absolute; top: 0; left: 0">
                    <div style="margin-bottom: 12px">Our Claim Reference No: {{ $claim['claim_no'] }}</div>
                    <div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
                    <div>{{ $quotation->customer->address['address_1'] }}</div>
                    <div>{{ $quotation->customer->address['address_2'] }}</div>
                    <div class="mb-20">{{ $quotation->customer->postal_code }}</div>
                    <div class="mb-20 font-weight-bold text-underline">Attention: {{ $quotation->customer->name }}</div>
                    <div class="mb-20">Dear Sir/Madam,</div>
                </div>
                <div class="header-content-right" style="position: absolute; top: 0; right: 0;">
                    <div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::parse($claim->issue_date)->format('j-M-y') }}</div>
                    <div>HP:  {{ $quotation->customer->phone_number }}</div>
                    <div>email:  {{ $quotation->customer->email }}</div>
                    <div class="font-weight-bold" style="visibility: hidden;">text</div>
                    <div class="mb-20" style="visibility: hidden;">text</div>
                    <div class="mb-20" style="visibility: hidden;">text</div>
                    <div class="mb-20 font-weight-bold text-underline">By Email only</div>
                </div>
            </div>
            <div class="header-description w-100 font-weight-bold mt-12 font-12" style="margin-top: {{ !empty($quotation->customer->company_name) ? '150px' : '130px' }}">{{ $quotation['description'] }}</div>
        @endif
        <div class="font-12 mt-12">We are please to submit our claim for your response certificate and kind payment :</div>
    </div>
    <div class="second-page pt-20">
        <table class="mt-24 page-1">
            <thead>
            <tr class="border-bottom-solid">
                <th width="5%">S/N</th>
                <th width="85%" colspan="4" class="description-column">DESCRIPTION</th>
                <th width="3%">UNIT</th>
                <th width="3%">QTY</th>
                <th width="7%">RATE</th>
                <th width="7%">AMOUNT</th>
                <th width="5%">DONE</th>
                <th width="5%">CURRENT</th>
                <th width="5%">PREVIOUS</th>
                <th width="5%">ACCUMULATIVE</th>
            </tr>
            </thead>
            <tbody>
            <tr class="border-bottom-solid">
                <td class="text-center border-right-solid border-left-solid">A</td>
                <td colspan="4" class="text-underline border-right-solid font-weight-bold">
                    REF. OUR QUOTATION NO. {{ $quotation->refence_no }} DATED {{ \Carbon\Carbon::parse($quotation->issue_date)->format('d/m/y') }}
                </td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
            </tr>
            <tr class="border-bottom-solid">
                <td class="text-center border-right-solid border-left-solid">B</td>
                <td colspan="4" class="text-underline border-right-solid font-weight-bold">Schedule of Bills / Quotation:</td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
            </tr>
            @if (count($quotation_sections) > 0)
                <tr>
                    <td class="text-center border-right-solid border-left-solid">B.1</td>
                    <td colspan="4" class="border-right-solid">Supply, delivery and installation of POWDER COATED finish aluminium framed doors and windows, complete with ironmongeries or/and accessories to given schedule described but to aluminium fabricator details. </td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                    <td class="border-right-solid"></td>
                </tr>

                @foreach ($quotation_sections as $key => $value)
                    <tr class={{ $key + 1 == count($quotation_sections) ? "border-bottom-solid" : ""}}>
                        <td class="text-center border-right-solid border-left-solid">B.1.{{ $key + 1 }}</td>
                        <td colspan="4" class="text-underline border-right-solid font-weight-bold">{{ $value['section_name'] }}</td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                        <td class="border-right-solid"></td>
                    </tr>
                    @foreach ($value->products as $item_key => $item_value)
                        @php
                            $claim_progress = $item_value->claim_progress[0];
                        @endphp
                        @if($claim_progress)
                        <tr class={{ $item_key + 1 == count($value->products) ? "border-bottom-solid" : ""}}>

                            <td class="text-center border-right-solid border-left-solid">B.1.{{ $key + 1 }}.{{ $item_key + 1 }}</td>
                            <td class="font-weight-bold" colspan="1">{{ $item_value->product_code }}</td>
                            <td class="text-italic" colspan="1">
                                {{ ($item_value->storey_text ?? '').';'.($item_value->area_text ?? '') }}
                            </td>
                            <td class="text-italic" colspan="1">{{ $item_value->glass_type }}</td>
                            <td class="font-weight-bold border-right-solid" colspan="1">{{ $item_value->width.' x '.$item_value->height . ' '. 'mm'}}</td>
                            <td class="text-center border-right-solid font-weight-bold">No</td>
                            <td class="text-center border-right-solid font-weight-bold">{{ $item_value->quantity }}</td>
                            <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($item_value->subtotal, '2' , '.', ',') }}</td>
                            <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($item_value->subtotal * $item_value->quantity, '2' , '.', ',') }}</td>
                            <td class="text-center border-right-solid font-weight-bold">{{ intval($claim_progress['claim_percent']) }}%</td>
                            <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['current_amount'], '2' , '.', ',') }}</td>
                            <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['previous_amount'], '2' , '.', ',') }}</td>
                            <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['accumulative_amount'], '2' , '.', ',') }}</td>
                        </tr>
                        @endif
                        @php
                            $total_current += isset($claim_progress['current_amount']) ? floatval($claim_progress['current_amount']) : 0;
                            $total_accumulative += isset($claim_progress['accumulative_amount']) ? floatval($claim_progress['accumulative_amount']) : 0;
                        @endphp
                    @endforeach
                @endforeach
            @endif
            </tbody>
        </table>
    </div>
    <div class="page_break pt-20"></div>
    <div class="last-page pt-20">
        <div class="content">
            @if ($quotation)
                <div class="content-header" style="position: relative; margin-top: -20px !important;" >
                    <div class="header-content-left" style="position: absolute; top: 0; left: 0">
                        <div style="margin-bottom: 12px">Our Claim Reference No: {{ $claim['claim_no'] }}</div>
                        <div class="font-weight-bold">{{ $quotation->customer->company_name }}</div>
                        <div style="visibility: hidden;">Email: htar@jinmac.org</div>
                    </div>
                    <div class="header-content-right" style="position: absolute; top: 0; right: 0">
                        <div style="margin-bottom: 12px">Date: {{ \Carbon\Carbon::parse($claim->issue_date)->format('j-M-y') }}</div>
                        <div style="visibility: hidden;">Email: htar@jinmac.org</div>
                        <div class=""style="visibility: hidden;">By Email only</div>
                        <div class=""style="visibility: hidden;">By Email only</div>
                    </div>
                </div>
                <div class="header-description w-100 font-weight-bold mt-12 font-12" style="margin-top: 60px">{{ $quotation['description'] }}</div>
            @endif
        </div>
        <table class="mt-12 page-1">
            <thead>
            <tr class="border-bottom-solid">
                <th width="5%">S/N</th>
                <th width="80%" colspan="4" class="description-column">DESCRIPTION</th>
                <th width="3%">UNIT</th>
                <th width="3%">QTY</th>
                <th width="3%">RATE</th>
                <th width="8%">AMOUNT</th>
                <th width="8%">DONE</th>
                <th width="8%">CURRENT</th>
                <th width="10%">PREVIOUS</th>
                <th width="10%">ACCUMULATIVE</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td class="text-center border-right-solid border-left-solid">C</td>
                <td colspan="4" class="text-underline border-right-solid"><span class="font-weight-bold">Other Fees : (Optional)</span></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
                <td class="border-right-solid"></td>
            </tr>
            @if ($other_fees)
                @foreach ($other_fees as $key => $item)
                    @php
                        $claim_progress = $item->claim_progress[0];
                        $last_key = $key;
                    @endphp
                    <tr class={{ $key + 1 == count($other_fees) ? "border-bottom-solid" : ""}}>
                        <td class="text-center border-right-solid border-left-solid">C.{{ $key+1 }}</td>
                        <td colspan="4" class="border-right-solid">{{ $item->description }}</td>
                        <td class="text-center border-right-solid font-weight-bold">sum</td>
                        <td class="text-center border-right-solid font-weight-bold"></td>
                        <td class="text-center border-right-solid font-weight-bold"></td>
                        <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($item->amount, '2' , '.', ',') }}</td>
                        <td class="text-center border-right-solid font-weight-bold">{{ intval($claim_progress['claim_percent']) }}%</td>
                        <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['current_amount'], '2' , '.', ',') }}</td>
                        <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['previous_amount'], '2' , '.', ',') }}</td>
                        <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['accumulative_amount'], '2' , '.', ',') }}</td>
                       </tr>
                @endforeach
                @php
                    $total_current += isset($claim_progress['current_amount']) ? floatval($claim_progress['current_amount']) : 0;
                    $total_accumulative += isset($claim_progress['accumulative_amount']) ? floatval($claim_progress['accumulative_amount']) : 0;
                @endphp
            @endif
            @if ($discount->discount_amount)
                @php
                    $claim_progress = $discount->claim_progress[0];
                    $discount_amount = $claim_progress['accumulative_amount'];
                    $discount_current = $claim_progress['current_amount'];
                @endphp
                <tr class={{ $key + 1 == count($other_fees) ? "border-bottom-solid" : ""}}>
                    <td class="text-center border-right-solid border-left-solid">D</td>
                    <td colspan="4" class="border-right-solid">Discount</td>
                    <td class="text-center border-right-solid font-weight-bold"></td>
                    <td class="text-center border-right-solid font-weight-bold"></td>
                    <td class="text-center border-right-solid font-weight-bold"></td>
                    <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($discount->discount_amount, '2' , '.', ',') }}</td>
                    <td class="text-center border-right-solid font-weight-bold">{{ intval($claim_progress['claim_percent']) }}%</td>
                    <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['current_amount'], '2' , '.', ',') }}</td>
                    <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['previous_amount'], '2' , '.', ',') }}</td>
                    <td class="text-center border-right-solid font-weight-bold">$ {{ number_format($claim_progress['accumulative_amount'], '2' , '.', ',') }}</td>
                   </tr>
            @endif
            @php
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

            @endphp
            <tr class={{ $key + 1 == count($other_fees) ? "border-bottom-solid" : ""}}>
                <td class="text-center border-right-solid border-left-solid">E</td>
                <td colspan="4" class="border-right-solid font-weight-bold">Less payment Received</td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
                <td class="text-center border-right-solid font-weight-bold"></td>
            </tr>
            <tr class={{ $key + 1 == count($other_fees) ? "border-bottom-solid" : ""}}>
                <td class="text-center border-right-solid border-left-solid">E.1</td>
                <td colspan="4" class="text-left border-right-solid">Payment Received 01 - Deposit / Down payemnt received dated {{\Carbon\Carbon::parse($quotation->issue_date)->format('j-M-y')}}</td>
                <td class="text-center border-right-solid"></td>
                <td class="text-center border-right-solid"></td>
                <td class="text-center border-right-solid"></td>
                <td class="text-center border-right-solid">($ {{  number_format($deposit, '2' , '.', ',')  }})</td>
                <td class="text-center border-right-solid">{{ $overall_progress }} %</td>
                <td class="text-center border-right-solid">($ {{  number_format($offset_current, '2' , '.', ',')  }})</td>
                <td class="text-center border-right-solid">($ {{  number_format($offset_previous, '2' , '.', ',')  }})</td>
                <td class="text-center border-right-solid">($ {{  number_format($accumulative_current, '2' , '.', ',')  }})</td>
            </tr>
            @if($claims_copied)
            @foreach($claims_copied as $key => $claim_copied)
                <tr  style="border: 1px solid #ccc">
                    <td class="text-center" style="border-right: 1px solid #ccc">E.{{ $key + 2 }}</td>
                    <td class="text-left border-right-solid" colspan="4">
                        Payment Received 0{{ $key + 2 }} - Claim 0{{ $key + 1 }} payment received dated {{\Carbon\Carbon::parse($claim_copied->payment_received_date)->format('j-M-y') }}
                    </td>
                    <td class="border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center border-right-solid"></td>
                    <td class="text-center ">($ {{ number_format($claim_copied->actual_paid_amount / (1 + floatval($previous_claim['tax']) / 100), '2' , '.', ',') }})</td>
                </tr>
            @endforeach
            @endif
            <tr style="border: 1px solid #ccc">
                <td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">F.1</td>
                <td></td>
                <td class="text-right font-weight-bold border-right-solid" colspan="10">SUB TOTAL FOR THIS CLAIM / BALANCE DUE (Before GST) :</td>
                <td class="text-center font-weight-bold">
                    @if($subtotal_from_claim > 0)
                        $ {{ number_format(($subtotal_from_claim ?? 0), '2' , '.', ',')}}
                    @else
                        ($ {{ number_format((abs($subtotal_from_claim) ?? 0), '2' , '.', ',')}})
                    @endif
                </td>
            </tr>
            <tr  style="border: 1px solid #ccc">
                <td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">F.2</td>
                <td></td>
                <td class="text-right font-weight-bold border-right-solid" colspan="10">ADD {{ $claim['tax'] }}% GST :</td>
                <td class="text-center font-weight-bold">
                    @if($gst > 0)
                        $ {{ number_format($gst, '2' , '.', ',') }}
                    @else
                        ($ {{ number_format(abs($gst), '2' , '.', ',') }})
                    @endif
                </td>
            </tr>
            <tr  style="border: 1px solid #ccc">
                <td class="text-center font-weight-bold" style="border-right: 1px solid #ccc">F.3</td>
                <td></td>
                <td class="text-right font-weight-bold border-right-solid" colspan="10">TOTAL FROM THIS CLAIM / BALANCE DUE (Inclusive GST) :</td>
                <td class="text-center font-weight-bold">
                    @if($subtotal_from_claim > 0 || $gst > 0)
                        $ {{ number_format(($subtotal_from_claim ?? 0) + ($gst ?? 0), '2' , '.', ',') }}
                    @else
                        ($ {{ number_format((abs($subtotal_from_claim) ?? 0) + ($gst ?? 0), '2' , '.', ',') }})
                    @endif
                </td>
            </tr>
            </tbody>
        </table>
        <div class="font-12 mb-20">
            <span class="mt-12 d-block">We would be delight to receive the above payment in due course.</span>
            <span class="mt-12 d-block">Please do not hesitate to contact the undersign should hyou need further clarification.</span>
            <span class="mt-12 d-block">Thank You.</span>
            <span class="mt-12 d-block">Yours faithfully,</span>
        </div>

        <div class="font-12 font-weight-bold">MULTI CONTRACTS PTE LTD</div>
        <img src="{{ public_path('image/signature_invoice.png') }}" title="header" class="signature border-bottom-solid">
        <div class="font-12">Mr. Shamus Tan</div>
    </div>
</body>
</html>
