<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\ScrapRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScrapService
{
    private $scrapRepository;
    /**
     * @var ActivityRepository
     */
    private $activityRepository;

    public function __construct(
        ScrapRepository $scrapRepository,
        ActivityRepository $activityRepository
    )
    {
        $this->scrapRepository = $scrapRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getScraps($searchParams)
    {

        $scraps = $this->scrapRepository->getScraps($searchParams);
        $results = [
            'scraps' => $scraps
        ];

        return $results;
    }

    public function getScrapManagements($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }

        $results = $this->scrapRepository->getScrapManagements($searchParams,$paginate);
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
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'scrap_id'     => $result->id,
                'type'         => Activity::TYPE_SCRAP,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
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
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'scrap_id'     => $credentials['scrap_id'],
                'type'         => Activity::TYPE_SCRAP,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_UPDATED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
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
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'scrap_id'     => $credentials['scrap_id'],
                'type'         => Activity::TYPE_SCRAP,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_UPDATED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
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
            $user = Auth::guard('api')->user();

            $checkExist = $this->scrapRepository->checkExist($scrap['quotation_id'], $scrap['product_item_id'], $scrap['product_template_material_id']);
            if ($checkExist == 0) {
                $scrap['created_at'] = Carbon::now();
                $scrap['updated_at'] = null;
                $result = $this->scrapRepository->create($scrap);
                $activity_logs = [
                    'scrap_id' => $result->id,
                    'type' => Activity::TYPE_SCRAP,
                    'user_id' => $user->id,
                    'action_type' => Activity::ACTION_CREATED,
                    'created_at' => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
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

    public function multiDeleteScraps($scrapIds)
    {
        try {
            $result = $this->scrapRepository->multiDeleteScraps($scrapIds);
            if (!$result) {
                return false;
            }
            foreach ($scrapIds as $id) {
                $user = Auth::guard('api')->user();
                $activity_logs = [
                    'scrap_id'     => $id,
                    'type'         => Activity::TYPE_SCRAP,
                    'user_id'      => $user->id,
                    'action_type'  => Activity::ACTION_DELETED,
                    'created_at'   => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ScrapService" FUNCTION "multiDeletesScrap" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getScrapDetail($scrapId) {
        $scraps = $this->scrapRepository->getScrapDetail($scrapId);
        $activities = $this->activityRepository->getActivities(['scrap_id' => $scrapId]);
        $results = [
            'scraps' => $scraps,
            'activities' => $activities
        ];
        return $results;
    }
}
