<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\MaterialRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MaterialService
{
    private $materialRepository;
    private $activityRepository;

    public function __construct(
        MaterialRepository $materialRepository,
        ActivityRepository $activityRepository
    )
    {
        $this->materialRepository = $materialRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getMaterials($searchParams)
    {
        $materials = $this->materialRepository->getMaterials($searchParams);

        $results = [
            'materials' => $materials
        ];

        return $results;
    }

    public function getMaterialsForQuotation($searchParams, $per_page)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $materials = $this->materialRepository->getMaterialsForQuotation($searchParams, $per_page, $paginate);

        $results = [
            'materials' => $materials
        ];

        return $results;
    }

    public function createMaterial($credentials)
    {
        try {
            $credentials['created_at'] = Carbon::now();
            $credentials['updated_at'] = null;
            $result = $this->materialRepository->create($credentials);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'material_id' =>  $result->id,
                'type'         => Activity::TYPE_MATERIALS,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_CREATED,
                'created_at'   => $result['created_at'],
            ];
            $this->activityRepository->create($activity_logs);

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "MaterialService" FUNCTION "createMaterial" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function delete($materialId)
    {
        try {
            $result = $this->materialRepository->delete($materialId);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'material_id' =>  $materialId,
                'type'         => Activity::TYPE_MATERIALS,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_DELETED,
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MaterialService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getMaterialDetail($materialId)
    {
        $material = $this->materialRepository->getMaterialDetail($materialId);
        $activity = $this->activityRepository->getActivities(['material_id' => $materialId]);

        $results = [
            'materials' => $material ?? null,
            'activity' => $activity ?? null
        ];

        return $results;
    }

    public function updateMaterial($credentials)
    {
        try {
            $materialId = $credentials['material_id'];
            $currentMaterial = $this->materialRepository->getMaterialDetail($materialId);
            $credentials['updated_at'] = Carbon::now();
            unset($credentials['material_id']);
            $result = $this->materialRepository->update($materialId, $credentials);
            if (!$result) {
                return false;
            }
            unset($credentials['updated_at']);
            $message = [];
            foreach ($credentials as $key => $value) {
                if ($currentMaterial[$key] != $value) {
                    $content = [
                      'field' => $key,
                      'oldValue' => $currentMaterial[$key],
                      'newValue' => $value
                    ];
                    $message[] = $content;
                }
            }
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'material_id' =>  $materialId,
                'type'         => Activity::TYPE_MATERIALS,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_UPDATED,
                'message'      => json_encode($message),
                'created_at'   => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MaterialService" FUNCTION "updateMaterial" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function multiDeleteMaterial($materialIds)
    {
        try {
            $result = $this->materialRepository->multiDeleteMaterial($materialIds);
            if (!$result) {
                return false;
            }

            $user = Auth::guard('api')->user();
            $materials = $this->materialRepository->findMaterialMultiDeleted($materialIds);
            foreach ($materials as $material) {
                $activity_logs = [
                    'material_id' =>  $material->id,
                    'type'         => Activity::TYPE_MATERIALS,
                    'user_id'      => $user->id,
                    'action_type'  => Activity::ACTION_DELETED,
                    'created_at'   => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MaterialService" FUNCTION "multiDeleteMaterial" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
