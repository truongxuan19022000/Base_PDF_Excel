<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scrap;
use App\Services\ScrapService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ScrapController extends Controller
{
    private $scrapService;

    public function __construct(ScrapService $scrapService)
    {
        $this->scrapService = $scrapService;
    }

    /**
     * @OA\Get(
     *     path="/admin/scraps",
     *     tags={"Scraps"},
     *     summary="Get list scrap",
     *     description="Get list scrap.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with product code, item",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="quotation_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="product_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="material_id",
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
    public function getScraps(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'material_id' => [
                'required',
                'numeric',
                Rule::exists('materials', 'id')
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $results = $this->scrapService->getScraps($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/scraps/scrap-managements",
     *     tags={"Scraps"},
     *     summary="Get list scrap managements",
     *     description="Get list scrap managements.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with product code, item, code, reference_no",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="scrap_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="start_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="end_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="min_length",
     *          in="query",
     *          description="scrap_length",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="max_length",
     *          in="query",
     *          description="scrap_length",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getScrapManagements(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->scrapService->getScrapManagements($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/scraps/create",
     *     tags={"Scraps"},
     *     summary="Create scrap",
     *     description="Create scrap",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="product_id", type="number"),
     *                 @OA\Property(property="material_id", type="number"),
     *                 @OA\Property(property="scrap_length", type="number"),
     *                 @OA\Property(property="cost_of_scrap", type="number"),
     *                 @OA\Property(property="status", type="number", description="1: unused, 2: used"),
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
    public function createScrap(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'product_id' => [
                'required',
                'numeric',
                Rule::exists('products', 'id')
            ],
            'material_id' => [
                'required',
                'numeric',
                Rule::exists('materials', 'id')
            ],
            'scrap_length' => 'required|numeric',
            'cost_of_scrap' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->scrapService->createScrap($credentials);
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
     *     path="/admin/scraps/{scrapId}/detail",
     *     tags={"Scraps"},
     *     summary="Edit scrap",
     *     description="Edit scrap",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="scrapId",
     *          in="path",
     *          description="ID of the scrap to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getScrapDetail($scrapId)
    {
        $customer = $this->scrapService->getScrapDetail($scrapId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $customer
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/scraps/update",
     *     tags={"Scraps"},
     *     summary="Update scrap",
     *     description="Update scrap",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="scrap_id", type="number"),
     *                 @OA\Property(property="status", type="number", description="1: unused, 2: used, 3:scrapped"),
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
    public function updateScrap(Request $request)
    {
        $code = 'scrap_management';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Scrap::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'scrap_id' => [
                'required',
                'numeric',
                Rule::exists('scraps', 'id')
            ],
            'status' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->scrapService->updateStatus($credentials);
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
     *     path="/admin/scraps/delete",
     *     tags={"Scraps"},
     *     summary="Delete scrap",
     *     description="Delete Scrap",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="scrap_id", example=1),
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
        $code = 'scrap_management';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Scrap::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'scrap_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->scrapService->delete($credentials['scrap_id']);
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
     *     path="/admin/scraps/multi-delete",
     *     tags={"Scraps"},
     *     summary="Multiple delete scrap",
     *     description="Multiple Delete Claims",
     *     security={{"bearer":{}}},
     *  @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="scrap_id", type="array", @OA\Items(type="number"), example={3, 4}),
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeleteScraps(Request $request)
    {
        $code = 'scrap_management';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Scrap::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'scrap_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->scrapService->multiDeleteScraps($credentials['scrap_id']);
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
     *     path="/admin/scraps/export",
     *     tags={"Scraps"},
     *     summary="Exports list of Scraps",
     *     description="Exports list of Scraps.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="scrap_ids",
     *          in="query",
     *          description="export for scraps",
     *          @OA\Schema(
     *               @OA\Property(property="scrap_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="scrap_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="scrap_ids[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportScraps(Request $request)
    {
        $credentials = $request->all();

        $scrapIdsString = isset($credentials['scrap_ids']) ? implode(',', $credentials['scrap_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/scrap/' . $scrapIdsString,
        ]);
    }
}
