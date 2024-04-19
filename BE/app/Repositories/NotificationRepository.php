<?php

namespace App\Repositories;

use App\Models\Notification;

class NotificationRepository
{
    public function create(array $request, $quotationId)
    {
        return Notification::updateOrCreate(
            ['quotation_id' => $quotationId],
            [
                'type' => $request['type'],
                'status' => $request['status'],
                'user_id' => $request['user_id'],
            ],
        );
    }

    public function getNotifications($searchParams, $paginate = true)
    {
        $sql = Notification::join('quotations', 'quotations.id', 'notifications.quotation_id')
            ->join('users', 'users.id', 'notifications.user_id')
            ->select([
                'notifications.id',
                'quotation_id',
                'quotations.reference_no',
                'quotations.id as quotation_id',
                'notifications.type',
                'notifications.status',
                'users.name',
                'users.username',
                'notifications.created_at',
            ]);

        if (isset($searchParams['notification_id']) && is_array($searchParams['notification_id'])) {
            $sql->whereIn('notifications.id', $searchParams['notification_id']);
        }

        if (isset($searchParams['type']) && is_array($searchParams['type'])) {
            $sql->whereIn('notifications.type', $searchParams['type']);
        }

        if (!$paginate) {
            return $sql->get();
        }

        return $sql->where('notifications.status', config('common.notification_status.unread'))
            ->orderBy('notifications.created_at', 'DESC')->paginate(config('common.paginate'));
    }

    public function getNotificationDetail($notificationId)
    {
        $sql = Notification::join('quotations', 'quotations.id', 'notifications.quotation_id')
            ->join('users', 'users.id', 'notifications.user_id')
            ->select([
                'notifications.id',
                'quotation_id',
                'quotations.reference_no',
                'quotations.id as quotation_id',
                'notifications.type',
                'notifications.status',
                'users.name',
                'users.username',
                'notifications.created_at',
            ]);
        return $sql->where('notifications.id', $notificationId)->first();
    }

    public function countAllNotifications($searchParams)
    {
        $sql = Notification::query();

        if (isset($searchParams['type']) && is_array($searchParams['type'])) {
            $sql->whereIn('notifications.type', $searchParams['type']);
        }

        return $sql->where('status', config('common.notification_status.unread'))->count();
    }

    public function update($notificationId, $updateData)
    {
        return Notification::where('id', $notificationId)->update($updateData);
    }

    public function updateAllNotifications()
    {
        return Notification::where('status', config('common.notification_status.unread'))
            ->update(['status' => config('common.notification_status.read')]);
    }

}
