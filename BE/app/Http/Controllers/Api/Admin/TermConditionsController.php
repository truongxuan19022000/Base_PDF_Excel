<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\TermConditionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TermConditionsController extends Controller
{
    private $termConditionsService;

    public function __construct(TermConditionService $termConditionsService)
    {
        $this->termConditionsService = $termConditionsService;
    }

    /**
     * @OA\Get(
     *     path="/admin/term-conditions",
     *     tags={"Term-Conditions"},
     *     summary="Get list of term conditions",
     *     description="Get list of term conditions.",
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
    public function getTermConditions(Request $request)
    {
        $quotationId = $request->quotation_id;
        $results = $this->termConditionsService->getTermConditions($quotationId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/term-conditions/handle",
     *     tags={"Term-Conditions"},
     *     summary="Handle term conditions",
     *     description="Handle term conditions",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="description", type="string", example="create new"),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="description", type="string", example="update note id 2"),
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
    public function handleTermConditions(Request $request)
    {
        $credentials = $request->all();

        $rule = [
            'quotation_id' =>  [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'create' => 'array',
            'create.*.description' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'string'
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

        $results = $this->termConditionsService->handleTermConditions($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/term-conditions/delete-all",
     *     tags={"Term-Conditions"},
     *     summary="Delete all term conditions",
     *     description="Delete all term conditions by quotation_id",
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
    public function deleteAllTermConditions(Request $request)
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

        $result = $this->termConditionsService->deleteAllTermConditions($credentials['quotation_id']);
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
     *     path="/admin/term-conditions/update-order-number",
     *     tags={"Term-Conditions"},
     *     summary="Update order number of term-conditions.",
     *     description="Update order number of term-conditions.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="term_conditions", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="term_condition_id", type="number", example="2"),
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
            'term_conditions' => 'required|array',
            'term_conditions.*.term_condition_id' => [
                'required', 'numeric'
            ],
            'term_conditions.*.order_number' => [
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

        $result = $this->termConditionsService->updateOrderNumber($credentials);

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
