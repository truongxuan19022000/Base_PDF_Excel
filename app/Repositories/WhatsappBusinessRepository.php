<?php

namespace App\Repositories;

use App\Models\WhatsappBusiness;

class WhatsappBusinessRepository
{
    public function create(array $request)
    {
        return WhatsappBusiness::create($request);
    }

    public function getListWhatsappBusiness($searchParams, $paginate = true)
    {
        $sql = WhatsappBusiness::select([
                'id',
                'account_name',
                'phone_number',
                'graph_version',
                'status'
            ])->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('account_name', 'LIKE', '%'. $searchParams['search'] .'%')
                        ->orWhere('phone_number', 'LIKE', '%' . $searchParams['search'] . '%');
                }
            });

        $sql->orderBy('created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->paginate(config('common.paginate'));
    }

    public function getWhatsappBusinessDetail($businessId)
    {
        return WhatsappBusiness::where('id', $businessId)->first();
    }

    public function getWhatsappBusinessSendMessage()
    {
        return WhatsappBusiness::where('status', WhatsappBusiness::STATUS_ON)->first();
    }

    public function getWhatsappBusinessByPhone($phoneNumber, $phoneNumberId)
    {
        return WhatsappBusiness::where('status', WhatsappBusiness::STATUS_ON)
                ->where('phone_number', $phoneNumber)
                ->where('phone_number_id', $phoneNumberId)
                ->first();
    }

    public function update($businessId, $updateData)
    {
        return WhatsappBusiness::where('id', $businessId)->update($updateData);
    }

    public function delete($businessId)
    {
        return WhatsappBusiness::where('id', $businessId)->delete();
    }

    public function multiDeleteWhatsappBusiness($businessId)
    {
        return WhatsappBusiness::whereIn('id', $businessId)->delete();
    }
}
