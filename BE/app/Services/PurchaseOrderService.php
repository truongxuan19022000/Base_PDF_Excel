<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\PurchaseOrder;
use App\Repositories\ActivityRepository;
use App\Repositories\PurchaseOrderRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PurchaseOrderService
{
    private $purchaseOrderRepository;
    /**
     * @var ActivityRepository
     */
    private $activityRepository;

    public function __construct(
        PurchaseOrderRepository $purchaseOrderRepository,
        ActivityRepository $activityRepository
    )
    {
        $this->purchaseOrderRepository = $purchaseOrderRepository;
        $this->activityRepository = $activityRepository;
    }

    public function getPurchaseOrders($searchParams)
    {
        $paginate = true;
        if (isset($searchParams['paginate']) && $searchParams['paginate'] == 0) {
            $paginate = false;
        }
        $results = $this->purchaseOrderRepository->getPurchaseOrders($searchParams, $paginate);
        return $results;
    }

    public function delete($purchaseOrderId)
    {
        try {
            $result = $this->purchaseOrderRepository->delete($purchaseOrderId);
            if (!$result) {
                return false;
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "PurchaseOrderService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function createPurchaseOrder($credentials)
    {
        try {
            DB::beginTransaction();
            $purchaseOrder = [
                'purchase_order_no' => $credentials['purchase_order_no'],
                'vendor_id' => $credentials['vendor_id'],
                'issue_date' => $credentials['issue_date'],
                'status' => 1,
                'created_at' => Carbon::now(),
                'updated_at' => null,
            ];
            $result = $this->purchaseOrderRepository->create($purchaseOrder);
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'purchase_order_id' => $result->id,
                'type' => Activity::TYPE_PURCHASE,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_CREATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "PurchaseOrderService" FUNCTION "createPurchaseOrder" ERROR: ' . $e->getMessage());
        }
        return [
            'status' => false,
        ];
    }

    public function updatePurchaseOrder($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'purchase_order_no' => $credentials['purchase_order_no'],
                'issue_date' => isset($credentials['issue_date']) ? $credentials['issue_date'] : Carbon::now(),
                'subtotal' => !empty($credentials['subtotal']) ? $credentials['subtotal'] : 0,
                'total_amount' => !empty($credentials['total_amount']) ? $credentials['total_amount'] : 0,
                'updated_at' => Carbon::now(),
            ];
            $result = $this->purchaseOrderRepository->update($credentials['purchase_order_id'], $updateData);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'purchase_order_id' => $credentials['purchase_order_id'],
                'type' => Activity::TYPE_PURCHASE,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "PurchaseOrderService" FUNCTION "updatePurchaseOrder" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function updateStatus($credentials)
    {
        try {
            DB::beginTransaction();
            $updateData = [
                'status' => PurchaseOrder::SENT,
                'updated_at' => Carbon::now(),
            ];
            $result = $this->purchaseOrderRepository->update($credentials['purchase_order_id'], $updateData);
            if (!$result) {
                return false;
            }
            $user = Auth::guard('api')->user();
            $activity_logs = [
                'purchase_order_id' => $credentials['purchase_order_id'],
                'type' => Activity::TYPE_PURCHASE,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "PurchaseOrderService" FUNCTION "updateStatus" ERROR: ' . $e->getMessage());
        }

        return false;
    }

    public function multiDeletePurchaseOrders($purchaseOrderIds)
    {
        try {
            $result = $this->purchaseOrderRepository->multiDeletePurchaseOrders($purchaseOrderIds);
            if (!$result) {
                return false;
            }
            foreach ($purchaseOrderIds as $id) {
                $user = Auth::guard('api')->user();
                $activity_logs = [
                    'purchase_order_id' => $id,
                    'type' => Activity::TYPE_PURCHASE,
                    'user_id' => $user->id,
                    'action_type' => Activity::ACTION_DELETED,
                    'created_at' => Carbon::now(),
                ];
                $this->activityRepository->create($activity_logs);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "PurchaseOrderService" FUNCTION "multiDeletesPurchaseOrder" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getPurchaseOrderDetail($purchaseOrderId)
    {
        $purchaseOrders = $this->purchaseOrderRepository->getPurchaseOrderDetail($purchaseOrderId);
        $activities = $this->activityRepository->getActivities(['purchase_order_id' => $purchaseOrderId]);
        $results = [
            'purchase_orders' => $purchaseOrders,
            'activities' => $activities
        ];
        return $results;
    }

    public function getPurchaseOrderByVendor($purchaseOrderId)
    {
        $results = $this->purchaseOrderRepository->getPurchaseOrderByVendor($purchaseOrderId);
        return $results;
    }

    public function handlePurchaseOrderItems($credentials)
    {
        try {
            DB::beginTransaction();
            //create
            foreach ($credentials['create'] as $createData) {
                $createData['purchase_order_id'] = $credentials['purchase_order_id'];
                $this->purchaseOrderRepository->createPurchaseOrderItem($createData);
            }

            //update
            foreach ($credentials['update'] as $updateData) {
                $purchaseOrderItemId = $updateData['id'];
                unset($updateData['id']);
                $updateData['purchase_order_id'] = $credentials['purchase_order_id'];
                $this->purchaseOrderRepository->updatePurchaseOrderItem($purchaseOrderItemId, $updateData);
            }

            //delete
            if (!empty($credentials['delete'])) {
                $this->purchaseOrderRepository->multiDeletePurchaseOrderItems($credentials['delete']);
            }

            $result = $this->purchaseOrderRepository->getPurchaseOrderDetail($credentials['purchase_order_id']);
            $gst = floatval($credentials['subtotal']) * floatval($result->tax) / 100;
            $total_amount = floatval($credentials['subtotal']) + floatval($result->shipping_fee) - floatval($result->discount_amount) + floatval($gst);
            $this->updatePurchaseOrder([
                'purchase_order_no' => $result->purchase_order_no,
                'purchase_order_id' => $credentials['purchase_order_id'],
                'issue_date' => $result->issue_date,
                'subtotal' => $credentials['subtotal'],
                'total_amount' => $total_amount
            ]);

            DB::commit();
            return [
                'status' => true,
                'data' => $result
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "PurchaseOrderService" FUNCTION "handlePurchaseOrderItems" ERROR: ' . $e->getMessage());
            return [
                'status' => false,
            ];
        }
    }

    public function update($credentials)
    {
        try {
            DB::beginTransaction();
            $purchase_order_id = $credentials['purchase_order_id'];
            unset($credentials['purchase_order_id']);
            $credentials['updated_at'] = Carbon::now();
            $result = $this->purchaseOrderRepository->update($purchase_order_id, $credentials);
            if (!$result) {
                return false;
            }
            // update total amount
            $purchase_order = $this->purchaseOrderRepository->getPurchaseOrderDetail($purchase_order_id);
            $gst = floatval($purchase_order->subtotal) * floatval($purchase_order->tax) / 100;
            $total_amount = floatval($purchase_order->subtotal) + floatval($purchase_order->shipping_fee) - floatval($purchase_order->discount_amount) + floatval($gst);
            $this->purchaseOrderRepository->update($purchase_order_id, ['total_amount' => $total_amount]);

            $user = Auth::guard('api')->user();
            $activity_logs = [
                'purchase_order_id' => $purchase_order_id,
                'type' => Activity::TYPE_PURCHASE,
                'user_id' => $user->id,
                'action_type' => Activity::ACTION_UPDATED,
                'created_at' => Carbon::now(),
            ];
            $this->activityRepository->create($activity_logs);
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('CLASS "PurchaseOrderService" FUNCTION "update" ERROR: ' . $e->getMessage());
        }

        return false;
    }
}
