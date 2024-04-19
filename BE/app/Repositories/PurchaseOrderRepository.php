<?php

namespace App\Repositories;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;

class PurchaseOrderRepository
{
    public function create(array $request)
    {
        return PurchaseOrder::create($request);
    }

    public function getPurchaseOrders($searchParams, $paginate = true)
    {
        $sql = PurchaseOrder::select([
            'id',
            'vendor_id',
            'purchase_order_no',
            'issue_date',
            'status',
            'subtotal',
            'shipping_fee',
            'discount_amount',
            'tax',
            'total_amount',
            'created_at',
        ])->where('vendor_id', $searchParams['vendor_id'])
            ->where(function ($query) use ($searchParams) {
                if (isset($searchParams['search'])) {
                    $query->where('purchase_order_no', 'LIKE', '%'. $searchParams['search'] .'%');
                }
            });
        if (isset($searchParams['purchase_order_id']) && is_array($searchParams['purchase_order_id'])) {
            $sql->whereIn('purchase_orders.id', $searchParams['purchase_order_id']);
        }
        if (isset($searchParams['status']) && is_array($searchParams['status'])) {
            $sql->orderBy('purchase_orders.status', $searchParams['status']);
        }
        if (isset($searchParams['start_date'])) {
            $sql->whereDate('purchase_orders.created_at', '>=', $searchParams['start_date']);
        }
        if (isset($searchParams['end_date'])) {
            $sql->whereDate('purchase_orders.created_at', '<=', $searchParams['end_date']);
        }
        $sql->orderBy('purchase_orders.created_at', 'DESC');

        if (!$paginate) {
            return $sql->get();
        }
        return $sql->paginate(config('common.paginate'));
    }

    public function countAllPurchaseOrders()
    {
        return PurchaseOrder::count();
    }

    public function getPurchaseOrderDetail($purchaseOrderId)
    {
        $sql = PurchaseOrder::with([
            'purchase_order_items' => function ($qr) {
                $qr->select([
                    'id',
                    'order_number',
                    'purchase_order_id',
                    'item_code',
                    'item_description',
                    'quantity',
                    'unit_price',
                    'created_at',
                ]);
                $qr->orderBy('order_number', 'asc');
            }
        ])->select([
            'id',
            'vendor_id',
            'purchase_order_no',
            'issue_date',
            'status',
            'subtotal',
            'shipping_fee',
            'discount_amount',
            'discount_type',
            'tax',
            'total_amount',
            'created_at',
        ])->with(['vendor' => function ($qr) {
            $qr->select([
                'id',
                'vendor_name',
                'company_name',
                'phone',
                'email',
                'address',
                'postal_code',
                'created_at',
            ]);
        }]);

        return $sql->where('purchase_orders.id', $purchaseOrderId)->first();
    }

    public function getPurchaseOrderByVendor($purchaseOrderId)
    {
        $sql = PurchaseOrder::with([
            'purchase_order_items' => function ($qr) {
                $qr->select([
                    'id',
                    'order_number',
                    'purchase_order_id',
                    'item_code',
                    'item_description',
                    'quantity',
                    'unit_price',
                    'created_at',
                ]);
                $qr->orderBy('order_number', 'asc');
            }
        ])->with(['vendor' => function ($qr) {
            $qr->select([
                'id',
                'vendor_name',
                'company_name',
                'phone',
                'email',
                'address',
                'postal_code',
                'created_at',
            ]);
        }])->select([
            'id',
            'vendor_id',
            'purchase_order_no',
            'issue_date',
            'status',
            'subtotal',
            'shipping_fee',
            'discount_amount',
            'discount_type',
            'tax',
            'total_amount',
            'created_at',
        ]);
        return $sql->where('purchase_orders.id', $purchaseOrderId)->first();
    }


    public function delete($purchaseOrderId)
    {
        return PurchaseOrder::where('id', $purchaseOrderId)->delete();
    }

    public function update($purchaseOrderId, $updateData)
    {
        return PurchaseOrder::where('id', $purchaseOrderId)->update($updateData);
    }

    public function multiDeletePurchaseOrders($purchaseOrderIds)
    {
        return PurchaseOrder::whereIn('id', $purchaseOrderIds)->delete();
    }

    public function createPurchaseOrderItem(array $request)
    {
        return PurchaseOrderItem::create($request);
    }

    public function updatePurchaseOrderItem($purchaseOrderItemId, $updateData)
    {
        return PurchaseOrderItem::where('id', $purchaseOrderItemId)->update($updateData);
    }

    public function multiDeletePurchaseOrderItems($purchaseOrderItemIds)
    {
        return PurchaseOrderItem::whereIn('id', $purchaseOrderItemIds)->delete();
    }
}
