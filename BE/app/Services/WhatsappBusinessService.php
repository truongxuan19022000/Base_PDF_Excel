<?php

namespace App\Services;

use App\Models\WhatsappBusiness;
use App\Repositories\WhatsappBusinessRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WhatsappBusinessService
{
    private $whatsappBusinessRepository;

    public function __construct(WhatsappBusinessRepository $whatsappBusinessRepository)
    {
        $this->whatsappBusinessRepository = $whatsappBusinessRepository;
    }

    public function getListWhatsappBusiness($searchParams)
    {
        $whatsapp_business_accounts = $this->whatsappBusinessRepository->getListWhatsappBusiness($searchParams);
        $results = [
            'whatsapp_business_accounts' => $whatsapp_business_accounts,
        ];

        return $results;
    }

    public function getWhatsappBusinessDetail($businessId)
    {
        return $this->whatsappBusinessRepository->getWhatsappBusinessDetail($businessId);
    }

    public function createWhatsappBusiness($credentials)
    {
        try {
            $data = [
                'account_name' => $credentials['account_name'],
                'whatsapp_business_account_id' => $credentials['whatsapp_business_account_id'],
                'phone_number' => $credentials['phone_number'],
                'phone_number_id' => $credentials['phone_number_id'],
                'graph_version' => $credentials['graph_version'],
                'access_token' => $credentials['access_token'],
                'status' => WhatsappBusiness::STATUS_OFF,
                'created_at' => Carbon::now(),
            ];
            $result = $this->whatsappBusinessRepository->create($data);
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "WhatsappBusinessService" FUNCTION "createWhatsappBusiness" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function updateWhatsappBusiness($credentials)
    {
        try {
            $updateData = [
                'account_name' => $credentials['account_name'],
                'whatsapp_business_account_id' => $credentials['whatsapp_business_account_id'],
                'phone_number' => $credentials['phone_number'],
                'phone_number_id' => $credentials['phone_number_id'],
                'graph_version' => $credentials['graph_version'],
                'access_token' => $credentials['access_token'],
                'status' => WhatsappBusiness::STATUS_OFF,
                'updated_at' => Carbon::now(),
            ];

            $result = $this->whatsappBusinessRepository->update($credentials['whatsapp_business_id'], $updateData);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "WhatsappBusinessService" FUNCTION "updateWhatsappBusiness" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function switchStatusWhatsappBusiness($credentials)
    {
        try {
            $updateData = [
                'status' => $credentials['status'],
                'updated_at' => Carbon::now(),
            ];
            $result = $this->whatsappBusinessRepository->update($credentials['whatsapp_business_id'], $updateData);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "WhatsappBusinessService" FUNCTION "switchStatusWhatsappBusiness" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function getWhatsappBusinessSendMessage()
    {
        return $this->whatsappBusinessRepository->getWhatsappBusinessSendMessage();
    }

    public function delete($businessId)
    {
        try {
            $result = $this->whatsappBusinessRepository->delete($businessId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "WhatsappBusinessService" FUNCTION "delete" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function multiDeleteWhatsappBusiness($businessId)
    {
        try {
            $result = $this->whatsappBusinessRepository->multiDeleteWhatsappBusiness($businessId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "WhatsappBusinessService" FUNCTION "multiDeleteWhatsappBusiness" ERROR: ' . $e->getMessage());
            return false;
        }
    }
}


