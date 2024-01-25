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
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }

        $scraps = $this->scrapRepository->getScraps($searchParams, $paginate);
        $results = [
            'scraps' => $scraps
        ];

        return $results;
    }

    public function getScrapById($scrapId)
    {
        $scrap = $this->scrapRepository->getScrapDetail($scrapId);
        $results = [
            'scrap' => $scrap,
        ];

        return $results;
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

    public function createScrap($credentials)
    {
        try {
            DB::beginTransaction();
            $scrap = [
                'quotation_section_id' => $credentials['quotation_section_id'],
                'product_id' => $credentials['product_id'],
                'scrap_length' => $credentials['scrap_length'],
                'cost_of_scrap' => $credentials['cost_of_scrap'],
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

    public function updateScrap($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'quotation_section_id' => $credentials['quotation_section_id'],
                'product_id' => $credentials['product_id'],
                'scrap_length' => $credentials['scrap_length'],
                'cost_of_scrap' => $credentials['cost_of_scrap'],
                'created_at' => Carbon::now(),
                'updated_at' => null,
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

    public function updateOrInsert($scraps)
    {
        try {
            DB::beginTransaction();
            foreach ($scraps as $scrap) {
                $checkExsit = $this->scrapRepository->checkExsit($scrap['quotation_section_id'], $scrap['product_id'], $scrap['material_id']);
                if ($checkExsit == 0) {
                    $this->scrapRepository->create($scrap);
                } else {
                    $updateData = [
                        'scrap_length' => $scrap['scrap_length'],
                        'cost_of_scrap' => $scrap['cost_of_scrap']
                    ];
                    $this->scrapRepository->updateByMulticolumn($scrap, $updateData);
                }
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
