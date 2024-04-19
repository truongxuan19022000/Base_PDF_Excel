<?php

namespace App\Services;

use App\Exports\ExportNotification;
use App\Repositories\ActivityRepository;
use App\Repositories\BillScheduleRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\QuotationRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private $notificationRepository;
    private $quotationRepository;

    public function __construct(
        NotificationRepository $notificationRepository,
        QuotationRepository $quotationRepository
    ) {
        $this->notificationRepository = $notificationRepository;
        $this->quotationRepository = $quotationRepository;
    }

    public function getNotifications($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $notifications = $this->notificationRepository->getNotifications($searchParams, $paginate);
        $notifications_count = $this->notificationRepository->countAllNotifications($searchParams);

        $results = [
            'notifications' => $notifications,
            'notifications_count' => $notifications_count ?? 0
        ];

        return $results;
    }

    public function updateNotification($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'status' => config('common.notification_status.read'),
                'updated_at'   => Carbon::now(),
            ];
            if (isset($credentials['status'])) {
                $this->notificationRepository->updateAllNotifications();
            } else {
                $this->notificationRepository->update($credentials['notification_id'], $updateData);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "NotificationService" FUNCTION "updateNotification" ERROR: ' . $e->getMessage());
        }

        return false;
    }

}
