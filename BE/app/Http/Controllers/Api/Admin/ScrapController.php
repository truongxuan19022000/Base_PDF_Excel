<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        $customer = $this->scrapService->getScrapById($scrapId);
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
    public function updateScrap(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'scrap_id' => [
                'required',
                'numeric',
                Rule::exists('scraps', 'id')
            ],
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

        $result = $this->scrapService->updateScrap($credentials);
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
}
