<?php

namespace App\Repositories;

use App\Models\OtherFee;

class OtherFeeRepository
{
    public function create(array $request)
    {
        return OtherFee::create($request);
    }

    public function update($other_fee_id, $updateData)
    {
        return OtherFee::where('id', $other_fee_id)->update($updateData);
    }

    public function delete($other_fee_id)
    {
        return OtherFee::where('id', $other_fee_id)->delete();
    }

    public function multiDeleteOtherFee($other_fee_id)
    {
        return OtherFee::whereIn('id', $other_fee_id)->delete();
    }

    public function deleteAllByQuotationId($quotationId)
    {
        return OtherFee::where('quotation_id', $quotationId)->delete();
    }

    public function getOtherFeeForQuotation($other_fee_id)
    {
        return OtherFee::select([
            'id',
            'order_number',
            'quotation_id',
            'description',
            'amount',
            'type',
            'created_at',
        ])->where('quotation_id', $other_fee_id)->orderBy('order_number', 'ASC')->get();
    }
}
