<?php

namespace App\Repositories;

use App\Models\QuotationNote;

class QuotationNoteRepository
{
    public function create(array $request)
    {
        return QuotationNote::create($request);
    }

    public function update($quotationNoteId, $updateData)
    {
        return QuotationNote::where('id', $quotationNoteId)->update($updateData);
    }

    public function delete($quotationNoteId)
    {
        return QuotationNote::where('id', $quotationNoteId)->delete();
    }

    public function multiDeleteQuotationNote($quotationNoteId)
    {
        return QuotationNote::whereIn('id', $quotationNoteId)->delete();
    }

    public function deleteAllByQuotationId($quotationId)
    {
        return QuotationNote::where('quotation_id', $quotationId)->delete();
    }

    public function getNoteForQuotation($quotationNoteId)
    {
        return QuotationNote::select([
                'id',
                'quotation_id',
                'description',
                'type',
                'order',
            ])->where('quotation_id', $quotationNoteId)->orderBy('order', 'ASC')->get();
    }
}
