<?php

namespace App\Repositories;
use App\Models\BillSchedule;

class BillScheduleRepository
{
    public function create(array $request)
    {
        return BillSchedule::create($request);
    }

    public function delete($billScheduleId)
    {
        return BillSchedule::where('id', $billScheduleId)->delete();
    }

    public function multiDeleteBillSchedule($billScheduleIds)
    {
        return BillSchedule::whereIn('id', $billScheduleIds)->delete();
    }

    public function update($billScheduleId, $updateData)
    {
        return BillSchedule::where('id', $billScheduleId)->update($updateData);
    }
}
