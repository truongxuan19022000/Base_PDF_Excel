<?php

namespace App\Repositories;

use App\Models\ClaimProgress;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClaimProgressRepository
{
    public function create(array $request)
    {
        return ClaimProgress::create($request);
    }

    public function delete($ClaimProgressId)
    {
        return ClaimProgress::where('id', $ClaimProgressId)->delete();
    }

    public function multiDeleteClaimProgresss($ClaimProgressId)
    {
        return ClaimProgress::whereIn('id', $ClaimProgressId)->delete();
    }

    public function findClaimProgressDeleted($ClaimProgressId)
    {
        return ClaimProgress::onlyTrashed()->where('id', $ClaimProgressId)->first();
    }

    public function findClaimProgressMultiDeleted($ClaimProgressId)
    {
        return ClaimProgress::onlyTrashed()->whereIn('id', $ClaimProgressId)->get();
    }

    public function update($ClaimProgressId, $updateData)
    {
        return ClaimProgress::where('id', $ClaimProgressId)->update($updateData);
    }

    public function getClaimProgressByClaimLog($ClaimProgressId)
    {
        return ClaimProgress::where('id', $ClaimProgressId)->first();
    }

    public function getClaimProgress($credentials)
    {
        $sql = ClaimProgress::where('quotation_section_id', $credentials['quotation_section_id']);
        if (!empty($credentials['product_id'])) {
            $sql->where('product_id', $credentials['product_id']);
        }
        if (!empty($credentials['other_fee_id'])) {
            $sql->where('other_fee_id', $credentials['other_fee_id']);
        }

        return $sql->orderBy('created_at', 'desc')->get();
    }
}
