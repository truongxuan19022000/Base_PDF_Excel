<?php

namespace App\Repositories;

use App\Models\ClaimLogs;

class ClaimLogsRepository
{
    public function create(array $request)
    {
        return ClaimLogs::create($request);
    }

    public function delete($ClaimLogsId)
    {
        return ClaimLogs::where('id', $ClaimLogsId)->delete();
    }

    public function multiDeleteClaimLogss($ClaimLogsId)
    {
        return ClaimLogs::whereIn('id', $ClaimLogsId)->delete();
    }

    public function findClaimLogsDeleted($ClaimLogsId)
    {
        return ClaimLogs::onlyTrashed()->where('id', $ClaimLogsId)->first();
    }

    public function findClaimLogsMultiDeleted($ClaimLogsId)
    {
        return ClaimLogs::onlyTrashed()->whereIn('id', $ClaimLogsId)->get();
    }

    public function update($ClaimLogsId, $updateData)
    {
        return ClaimLogs::where('id', $ClaimLogsId)->update($updateData);
    }

    public function getClaimLogByClaimId($ClaimId)
    {
        return ClaimLogs::where('claim_id', $ClaimId)->get();
    }
}
