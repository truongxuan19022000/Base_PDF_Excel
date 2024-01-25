<?php

namespace App\Services;

use App\Models\Activity;
use App\Repositories\ActivityRepository;
use App\Repositories\QuotationNoteRepository;
use App\Repositories\QuotationRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class QuotationNoteService
{
    private $quotationNoteRepository;
    private $activityRepository;
    /**
     * @var QuotationRepository
     */
    private $quotationRepository;

    public function __construct(
        QuotationNoteRepository $quotationNotepository,
        ActivityRepository $activityRepository,
        QuotationRepository $quotationRepository
    ) {
        $this->quotationNoteRepository = $quotationNotepository;
        $this->activityRepository = $activityRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getQuotationNotes($quotationId) {
        $quotation_notes = $this->quotationNoteRepository->getNoteForQuotation($quotationId);

        $results = [
            'quotation_notes' => $quotation_notes,
        ];

        return $results;
    }

    public function handleQuotationNotes($credentials)
    {
        try {
            DB::beginTransaction();
            //create
            foreach ($credentials['create'] as $createData) {
                $createData['quotation_id'] = $credentials['quotation_id'];
                $quotation_note = $this->quotationNoteRepository->create($createData);
                if ($quotation_note){
                    $this->insertNoteActivity($credentials['quotation_id'],Activity::ACTION_CREATED,$quotation_note['id']);
                }
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $quotationNoteId = $updateData['id'];
                unset($updateData['id']);
                $updateData['quotation_id'] = $credentials['quotation_id'];
                $quotation_note = $this->quotationNoteRepository->update($quotationNoteId, $updateData);
                if (!empty($quotation_note)){
                    $this->insertNoteActivity($credentials['quotation_id'],Activity::ACTION_UPDATED,$quotationNoteId);
                }
            }

            //delete
            if (!empty($credentials['delete'])) {
                $quotation_note = $this->quotationNoteRepository->multiDeleteQuotationNote($credentials['delete']);
                if (!empty($quotation_note)){
                    foreach ($credentials['delete'] as $quotation_note_id) {
                        $this->insertNoteActivity($credentials['quotation_id'],Activity::ACTION_DELETED,$quotation_note_id);
                    }
                }

            }

            $result = $this->quotationNoteRepository->getNoteForQuotation($credentials['quotation_id']);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "QuotationNoteService" FUNCTION "handleQuotationNotes" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function insertNoteActivity($quotation_id, $action, $quotation_note_id)
    {
        try {
            $quotation = $this->quotationRepository->getQuotationDetail($quotation_id);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'customer_id' => $quotation->customer_id,
                'quotation_id' => $quotation->id,
                'quotation_note_id' => $quotation_note_id,
                'type' => Activity::TYPE_QUOTATION_NOTES,
                'user_id' => $user->id,
                'action_type' => $action,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationNoteService" FUNCTION "handleQuotationNotes" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function deleteAllQuotationNotes($quotationId)
    {
        try {
            $result = $this->quotationNoteRepository->deleteAllByQuotationId($quotationId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "QuotationNoteService" FUNCTION "deleteAllQuotationNotes" ERROR: ' . $e->getMessage());
        }
        return false;
    }
}
