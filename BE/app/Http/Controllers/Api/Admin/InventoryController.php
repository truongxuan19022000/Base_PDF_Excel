<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportInventory;
use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class InventoryController extends Controller
{
    private $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * @OA\Get(
     *     path="/admin/inventories",
     *     tags={"Inventories"},
     *     summary="Get a list of inventories",
     *     description="Get a list of all registered inventories.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="path",
     *          description="Search with category, item, sku_code",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getInventories(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->inventoryService->getInventories($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/inventories/create",
     *     tags={"Inventories"},
     *     summary="Create new inventory",
     *     description="Create new inventory",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="category", type="string"),
     *              @OA\Property(property="item", type="string"),
     *              @OA\Property(property="sku_code", type="string"),
     *              @OA\Property(property="type", type="string"),
     *              @OA\Property(property="thickness", type="string"),
     *              @OA\Property(property="price", type="string")
     *          )
     *      ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function createInventory(Request $request)
    {
        $code = 'inventory';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Inventory::class, $code, $mode]);
        $credentials = $request->all();

        $rule = [
            'category' => 'required|string|max:255',
            'item' => 'required|string|max:255',
            'sku_code' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'thickness' => 'required|string|max:255',
            'price' => 'required|string|max:255',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->inventoryService->createInventory($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_inventory_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_inventory_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/inventories/{inventoryId}/edit",
     *     tags={"Inventories"},
     *     summary="Get inventory detail",
     *     description="Get inventory detail",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="inventoryId",
     *     in="path",
     *     description="ID of the inventory to edit",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($inventoryId)
    {
        $inventory = $this->inventoryService->getInventoryDetail($inventoryId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $inventory
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/inventories/update",
     *     tags={"Inventories"},
     *     summary="Update inventory",
     *     description="Update inventory",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="inventory_id"),
     *              @OA\Property(property="category", type="string"),
     *              @OA\Property(property="item", type="string"),
     *              @OA\Property(property="sku_code", type="string"),
     *              @OA\Property(property="type", type="string"),
     *              @OA\Property(property="thickness", type="string"),
     *              @OA\Property(property="price", type="string")
     *          )
     *      ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateInventory(Request $request)
    {
        $code = 'inventory';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Inventory::class, $code, $mode]);
        $credentials = $request->all();

        $rule = [
            'inventory_id' => 'required',
            'category' => 'required|string|max:255',
            'item' => 'required|string|max:255',
            'sku_code' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'thickness' => 'required|string|max:255',
            'price' => 'required|string|max:255',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->inventoryService->updateInventory($credentials);
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
     *     path="/admin/inventories/delete",
     *     tags={"Inventories"},
     *     summary="Delete Inventory",
     *     description="Delete Inventory",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="inventory_id", example=1),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $code = 'inventory';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Inventory::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'inventory_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->inventoryService->delete($credentials['inventory_id']);
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
     *     path="/admin/inventories/multi-delete",
     *     tags={"Inventories"},
     *     summary="Multiple delete inventory",
     *     description="Multiple Delete Inventory",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="inventory_id", type="array", @OA\Items(type="number"), example="1"),
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeleteInventory(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'inventory_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->inventoryService->multiDeleteInventory($credentials['inventory_id']);
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
     * @OA\Get(
     *     path="/admin/inventories/export",
     *     tags={"Inventories"},
     *     summary="Export a list of inventories",
     *     description="Export a list of inventories.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="path",
     *          description="Search with category, item, sku_code",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function exportInventories(Request $request)
    {
        $searches = $request->all();
        return Excel::download(new ExportInventory($searches), 'inventories.csv', ExcelExcel::CSV);
    }
}
