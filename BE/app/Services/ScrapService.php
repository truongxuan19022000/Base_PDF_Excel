<?php

namespace App\Services;

use App\Repositories\ScrapRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScrapService
{
    private $scrapRepository;

    public function __construct(
        ScrapRepository $scrapRepository
    )
    {
        $this->scrapRepository = $scrapRepository;
    }

    public function getScraps($searchParams)
    {

        $scraps = $this->scrapRepository->getScraps($searchParams);
        $results = [
            'scraps' => $scraps
        ];

        return $results;
    }

    public function getScrapsByQuotationId($quotationId, $product_item_id, $product_template_material_id)
    {
        $scraps = $this->scrapRepository->getScrapsByQuotationId($quotationId, $product_item_id, $product_template_material_id);
        return $scraps;
    }

    public function getScrapById($scrapId)
    {
        $result = $this->scrapRepository->getScrapDetail($scrapId);
        return $result;
    }

    public function delete($scrapId)
    {
        try {
            $result = $this->scrapRepository->delete($scrapId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ScrapService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function deleteScrapByQuotation($data)
    {
        try {
            $result = $this->scrapRepository->deleteScrapByQuotation($data['quotation_id'], $data['product_item_id'], $data['product_template_material_id']);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ScrapService" FUNCTION "deleteScrapByQuotation" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createScrap($credentials)
    {
        try {
            DB::beginTransaction();
            $scrap = [
                'quotation_id' => $credentials['quotation_id'],
                'product_item_id' => $credentials['product_item_id'],
                'product_template_material_id' => $credentials['product_template_material_id'],
                'scrap_length' => $credentials['scrap_length'],
                'scrap_weight' => $credentials['scrap_weight'],
                'cost_of_scrap' => $credentials['cost_of_scrap'],
                'status' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->scrapRepository->create($scrap);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ScrapService" FUNCTION "createScrap" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateStatus($credentials)
    {
        try {
            DB::beginTransaction();
            $scrap = [
                'status' => $credentials['status'],
                'updated_at' => Carbon::now(),
            ];
            $result = $this->scrapRepository->update($credentials['scrap_id'], $scrap);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ScrapService" FUNCTION "updateStatus" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updateScrap($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'quotation_id' => $credentials['quotation_id'],
                'product_item_id' => $credentials['product_item_id'],
                'product_template_material_id' => $credentials['product_template_material_id'],
                'scrap_length' => $credentials['scrap_length'],
                'scrap_weight' => $credentials['scrap_weight'],
                'cost_of_scrap' => $credentials['cost_of_scrap'],
                'status' => $credentials['status'],
                'updated_at' => Carbon::now(),
            ];

            $result = $this->scrapRepository->update($credentials['scrap_id'], $updateData);
            if (!$result) {
                return false;
            }
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ScrapService" FUNCTION "updateScrap" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateOrInsert($scrap)
    {
        try {
            DB::beginTransaction();
                $checkExist = $this->scrapRepository->checkExist($scrap['quotation_id'], $scrap['product_item_id'], $scrap['product_template_material_id']);
                if ($checkExist == 0) {
                    $scrap['created_at'] = Carbon::now();
                    $scrap['updated_at'] = null;
                    $this->scrapRepository->create($scrap);
                } else {
                    $updateData = [
                        'scrap_length' => $scrap['scrap_length'],
                        'cost_of_scrap' => $scrap['cost_of_scrap'],
                        'updated_at' => Carbon::now()
                    ];
                    $this->scrapRepository->updateByMulticolumn($scrap, $updateData);
                }
            DB::commit();
            return [
                'status' => true
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "ScrapService" FUNCTION "updateOrInsert " ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }
}
