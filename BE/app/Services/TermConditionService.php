<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\TermConditionRepository;
use App\Repositories\QuotationRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TermConditionService
{
    private $termConditionRepository;
    private $activityRepository;
    /**
     * @var QuotationRepository
     */
    private $quotationRepository;

    public function __construct(
        TermConditionRepository $termConditionRepository,
        ActivityRepository $activityRepository,
        QuotationRepository $quotationRepository
    )
    {
        $this->termConditionRepository = $termConditionRepository;
        $this->activityRepository = $activityRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getTermConditions($quotationId)
    {
        $results = $this->termConditionRepository->getTermConditionForQuotation($quotationId);
        return $results;
    }

    public function handleTermConditions($credentials)
    {
        try {
            DB::beginTransaction();
            //delete
            if (!empty($credentials['delete'])) {
                $this->termConditionRepository->multiDeleteTermCondition($credentials['delete']);
            }

            //create
            foreach ($credentials['create'] as $createData) {
                $createData['quotation_id'] = $credentials['quotation_id'];
                $this->termConditionRepository->create($createData);
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $term_condition_id = $updateData['id'];
                unset($updateData['id']);
                $updateData['quotation_id'] = $credentials['quotation_id'];
                $this->termConditionRepository->update($term_condition_id, $updateData);
            }

            $result = $this->termConditionRepository->getTermConditionForQuotation($credentials['quotation_id']);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "TermConditionService" FUNCTION "handleTermConditions" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function deleteAllTermConditions($quotationId)
    {
        try {
            $result = $this->termConditionRepository->deleteAllByQuotationId($quotationId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "TermConditionService" FUNCTION "deleteAllTermConditions" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function updateOrderNumber($credentials)
    {
        try {
            $result = false;
            foreach ($credentials['term_conditions'] as $updateData) {
                $term_condition_id = $updateData['term_condition_id'];
                unset($updateData['term_condition_id']);
                $result = $this->termConditionRepository->update($term_condition_id, $updateData);
            }

            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            Log::error('CLASS "TermConditionService" FUNCTION "updateOrderNumber" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }
}
