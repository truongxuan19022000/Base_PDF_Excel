<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportCustomer;
use App\Http\Controllers\Controller;
use App\Services\PurchaseOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class PurchaseOrderController extends Controller
{
    private $purchaseOrderService;

    public function __construct(PurchaseOrderService $purchaseOrderService)
    {
        $this->purchaseOrderService = $purchaseOrderService;
    }

    /**
     * @OA\Get(
     *     path="/admin/purchase-orders",
     *     tags={"Purchase-Orders"},
     *     summary="Get list purchase order",
     *     description="Get list purchase Order.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with purchase_order_no",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="vendor_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getPurchaseOrders(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'vendor_id' => [
                'required',
                'numeric',
                Rule::exists('vendors', 'id')->whereNull('deleted_at')
            ],
        ];
        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $results = $this->purchaseOrderService->getPurchaseOrders($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/create",
     *     tags={"Purchase-Orders"},
     *     summary="Create purchase order",
     *     description="Create purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_no", type="string"),
     *                 @OA\Property(property="vendor_id", type="number"),
     *                 @OA\Property(property="issue_date", type="date"),
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
    public function createPurchaseOrder(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_no' => [
                'required',
                Rule::unique('purchase_orders', 'purchase_order_no')->whereNull('deleted_at')
            ],
            'vendor_id' => [
                'required',
                'numeric',
                Rule::exists('vendors', 'id')->whereNull('deleted_at')
            ],
            'issue_date' => 'required|date',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->purchaseOrderService->createPurchaseOrder($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/purchase-orders/{purchaseOrderId}/edit",
     *     tags={"Purchase-Orders"},
     *     summary="Edit purchaseorder",
     *     description="Edit purchaseorder",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="purchaseOrderId",
     *          in="path",
     *          description="ID of the purchaseOrder to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($purchaseOrderId)
    {
        $customer = $this->purchaseOrderService->getPurchaseOrderDetail($purchaseOrderId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $customer
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/update",
     *     tags={"Purchase-Orders"},
     *     summary="Update purchase order",
     *     description="Update purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_id", type="number"),
     *                 @OA\Property(property="purchase_order_no", type="string"),
     *                 @OA\Property(property="issue_date", type="string"),
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
    public function updatePurchaseOrder(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
            'purchase_order_no' => [
                'required',
                Rule::unique('purchase_orders', 'purchase_order_no')->ignore($credentials['purchase_order_id'])
            ],
            'issue_date' => 'date',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $result = $this->purchaseOrderService->updatePurchaseOrder($credentials);
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

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/update-status",
     *     tags={"Purchase-Orders"},
     *     summary="Update status of purchase order",
     *     description="Update status of purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_id", type="number"),
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
    public function updateStatus(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $result = $this->purchaseOrderService->updateStatus($credentials);
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

    /**
     * @OA\Delete(
     *     path="/admin/purchase-orders/delete",
     *     tags={"Purchase-Orders"},
     *     summary="Delete purchase order",
     *     description="Delete Purchase order",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="purchase_order_id", example=1),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->purchaseOrderService->delete($credentials['purchase_order_id']);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.delete_failed')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.delete_success')
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/multi-delete",
     *     tags={"Purchase-Orders"},
     *     summary="Multiple delete purchase order",
     *     description="Multiple delete purchase order",
     *     security={{"bearer":{}}},
     *  @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="purchase_order_ids", type="array", @OA\Items(type="number"), example={3, 4}),
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeletePurchaseOrder(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_ids' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->purchaseOrderService->multiDeletePurchaseOrders($credentials['purchase_order_ids']);
        if (!$result) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.delete_failed')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.delete_success')
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/handle-items",
     *     tags={"Purchase-Orders"},
     *     summary="Handle purchase orders item",
     *     description="Handle purchase orders item",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="purchase_order_id", type="number", example=1),
     *              @OA\Property(property="subtotal", type="number", example=1233),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="item_code", type="string", example="code 1"),
     *                      @OA\Property(property="item_description", type="string", example="create new"),
     *                      @OA\Property(property="quantity", type="number", example=1),
     *                      @OA\Property(property="unit_price", type="number", example=1),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="item_code", type="string", example="code 2"),
     *                      @OA\Property(property="item_description", type="string", example="update note id 2"),
     *                      @OA\Property(property="quantity", type="number", example=2),
     *                      @OA\Property(property="unit_price", type="number", example=2),
     *                      @OA\Property(property="order_number", type="number", example=2),
     *                  )
     *              ),
     *              @OA\Property(property="delete", type="array", @OA\Items(type="number"), example={3, 4}),
     *          )
     *      ),
     *      @OA\Response(
     *          response="200",
     *          description="Successful",
     *      )
     * )
     *
     */
    public function handlePurchaseOrderItems(Request $request)
    {
        $credentials = $request->all();

        $rule = [
            'purchase_order_id' =>  [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
            'subtotal' =>  [
                'required',
                'numeric',
            ],
            'create' => 'array',
            'create.*.item_code' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'string'
            ],
            'create.*.item_description' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'string'
            ],
            'create.*.quantity' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],
            'create.*.unit_price' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],
            'create.*.order_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],

            'update' => 'array',
            'update.*.id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],
            'update.*.item_code' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'string'
            ],
            'update.*.item_description' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'string'
            ],
            'update.*.quantity' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],
            'update.*.unit_price' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],
            'update.*.order_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],

            'delete' => 'array',
            'delete.*' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['delete']);
                }),
                'numeric'
            ]
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $results = $this->purchaseOrderService->handlePurchaseOrderItems($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/update-shipping",
     *     tags={"Purchase-Orders"},
     *     summary="Update shipping fee of purchase order",
     *     description="Update shipping fee of purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_id", type="number"),
     *                 @OA\Property(property="shipping_fee", type="number"),
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
    public function updateShippingFee(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
            'shipping_fee' => [
                'required',
                'numeric',
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $credentials = $validator->validated();
        $result = $this->purchaseOrderService->update($credentials);
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

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/update-discount",
     *     tags={"Purchase-Orders"},
     *     summary="Update discount of purchase order",
     *     description="Update discount of purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_id", type="number"),
     *                 @OA\Property(property="discount_amount", type="number"),
     *                 @OA\Property(property="discount_type", type="number"),
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
    public function updateDiscountAmount(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
            'discount_amount' => [
                'required',
                'numeric',
            ],
            'discount_type' => [
                'required',
                'numeric',
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $credentials = $validator->validated();
        $result = $this->purchaseOrderService->update($credentials);
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

    /**
     * @OA\Post(
     *     path="/admin/purchase-orders/update-tax",
     *     tags={"Purchase-Orders"},
     *     summary="Update tax of purchase order",
     *     description="Update tax of purchase order",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="purchase_order_id", type="number"),
     *                 @OA\Property(property="tax", type="number"),
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
    public function updateTax(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'purchase_order_id' => [
                'required',
                'numeric',
                Rule::exists('purchase_orders', 'id')->whereNull('deleted_at')
            ],
            'tax' => [
                'required',
                'numeric',
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $credentials = $validator->validated();
        $result = $this->purchaseOrderService->update($credentials);
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

    /**
     * @OA\Get(
     *     path="/admin/purchase-orders/export-pdf",
     *     tags={"Purchase-Orders"},
     *     summary="Purchase export PDF",
     *     description="Purchase export PDF",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="purchase_order_id", example=13),
     *     )
     * ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportPDF(Request $request)
    {
        $purchase_order_id = $request->purchase_order_id;
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-pdf/purchase-order/' . $purchase_order_id,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/purchase-orders/export",
     *     tags={"Purchase-Orders"},
     *     summary="Exports list of Customers",
     *     description="Exports list of Customers.",
     *     security={{"bearer":{}}},
     *    @OA\Parameter(
     *          name="purchase_order_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="purchase_order_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="purchase_order_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="vendor_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportPurchaseOrder(Request $request)
    {
        $credentials = $request->all();
        $purchaseOrderIdsString = isset($credentials['purchase_order_ids']) ? implode(',', $credentials['purchase_order_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/purchase-order/' . $purchaseOrderIdsString,
        ]);
    }
}
