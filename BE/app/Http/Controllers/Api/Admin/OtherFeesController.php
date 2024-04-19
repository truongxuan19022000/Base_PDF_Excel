<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\OtherFeeService;
use App\Services\QuotationNoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class OtherFeesController extends Controller
{
    private $otherFeeService;

    public function __construct(OtherFeeService $otherFeeService)
    {
        $this->otherFeeService = $otherFeeService;
    }

    /**
     * @OA\Get(
     *     path="/admin/other-fees",
     *     tags={"Other-Fees"},
     *     summary="Get list of other fees",
     *     description="Get list of other fees.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="quotation_id",
     *          in="query",
     *          @OA\Schema(type="number")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getOtherFees(Request $request)
    {
        $quotationId = $request->quotation_id;
        $results = $this->otherFeeService->getOtherFees($quotationId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/other-fees/handle",
     *     tags={"Other-Fees"},
     *     summary="Handle other fees",
     *     description="Handle other fees",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="grand_total", type="number", example=12000),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="description", type="string", example="create new"),
     *                      @OA\Property(property="type", type="number", description="1: Excluded, 2: Included", example=1),
     *                      @OA\Property(property="amount", type="number", example=12000),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="description", type="string", example="update note id 2"),
     *                      @OA\Property(property="type", type="number", description="1: Excluded, 2: Included", example=123),
     *                      @OA\Property(property="amount", type="number", example=2),
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
    public function handleOtherFees(Request $request)
    {
        $credentials = $request->all();

        $rule = [
            'quotation_id' =>  [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'grand_total' => 'required|numeric',
            'create' => 'array',
            'create.*.description' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'string'
            ],
            'create.*.type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],
            'create.*.amount' => [
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
            'update.*.description' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'string'
            ],
            'update.*.type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],
            'update.*.amount' => [
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

        $results = $this->otherFeeService->handleOtherFees($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/other-fees/delete-all",
     *     tags={"Other-Fees"},
     *     summary="Delete all other fees",
     *     description="Delete all other fees by quotation_id",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *          )
     *      ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function deleteAllOtherFees(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->otherFeeService->deleteAllOtherFees($credentials['quotation_id']);
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
     *     path="/admin/other-fees/update-order-number",
     *     tags={"Other-Fees"},
     *     summary="Update order number of other-fees.",
     *     description="Update order number of other-fees.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="other_fees", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="other_fee_id", type="number", example="2"),
     *                      @OA\Property(property="order_number", type="number", example=2),
     *                  )
     *              ),
     *          )
     *      ),
     *      @OA\Response(
     *          response="200",
     *          description="Successful",
     *      )
     * )
     *
     */
    public function updateOrderNumber(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'other_fees' => 'required|array',
            'other_fees.*.other_fee_id' => [
                'required', 'numeric'
            ],
            'other_fees.*.order_number' => [
                'required', 'numeric'
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->otherFeeService->updateOrderNumber($credentials);

        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.cannot_update')
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.update_success')
        ], 200);
    }
}
