<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportMultiNotification;
use App\Http\Controllers\Controller;
use App\Imports\ImportMultiNotification;
use App\Services\NotificationService;
use App\Services\ProductItemService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    private $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * @OA\Get(
     *     path="/admin/notifications",
     *     tags={"Notifications"},
     *     summary="Get a list of notifications",
     *     description="Get a list of all registered notifications.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search refence_no",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="type",
     *          in="query",
     *          description="1: Draft, 2: Pending Approval, 3: Approved, 4: Rejected, 5: Cancelled",
     *          @OA\Schema(
     *               @OA\Property(property="type[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="type[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="type[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="Unread: 0, Read: 1",
     *          @OA\Schema(
     *               @OA\Property(property="status[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="status[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getNotifications(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->notificationService->getNotifications($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/notifications/update",
     *     tags={"Notifications"},
     *     summary="Update notification",
     *     description="Update notification",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="notification_id", type="number"),
     *                 @OA\Property(property="status", type="number"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function updateNotification(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'status' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !isset($credentials['notification_id']);
                }),
            ],
            'notification_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !isset($credentials['status']);
                }),
                'numeric'
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->notificationService->updateNotification($credentials);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.cannot_update')
            ]);
        }
        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.update_success')
        ]);
    }

}
