<?php

namespace App\Repositories;

use App\Models\TermCondition;

class TermConditionRepository
{
    public function create(array $request)
    {
        return TermCondition::create($request);
    }

    public function update($term_condition_id, $updateData)
    {
        return TermCondition::where('id', $term_condition_id)->update($updateData);
    }

    public function delete($term_condition_id)
    {
        return TermCondition::where('id', $term_condition_id)->delete();
    }

    public function multiDeleteTermCondition($term_condition_id)
    {
        return TermCondition::whereIn('id', $term_condition_id)->delete();
    }

    public function deleteAllByQuotationId($quotationId)
    {
        return TermCondition::where('quotation_id', $quotationId)->delete();
    }

    public function getTermConditionForQuotation($term_condition_id)
    {
        return TermCondition::select([
            'id',
            'order_number',
            'quotation_id',
            'description',
            'created_at',
        ])->where('quotation_id', $term_condition_id)->orderBy('order_number', 'ASC')->get();
    }
}
