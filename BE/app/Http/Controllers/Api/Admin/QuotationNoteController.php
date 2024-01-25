<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\QuotationNoteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class QuotationNoteController extends Controller
{
    private $quotationNoteService;

    public function __construct(QuotationNoteService $quotationNoteService)
    {
        $this->quotationNoteService = $quotationNoteService;
    }

    /**
     * @OA\Get(
     *     path="/admin/quotation-notes",
     *     tags={"Quotation-Notes"},
     *     summary="Get list of quotation notes",
     *     description="Get list of quotation notes.",
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
    public function getQuotationNotes(Request $request)
    {
        $quotationId = $request->quotation_id;
        $results = $this->quotationNoteService->getQuotationNotes($quotationId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-notes/handle",
     *     tags={"Quotation-Notes"},
     *     summary="Handle quotation notes",
     *     description="Handle quotation notes",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="description", type="string", example="create new"),
     *                      @OA\Property(property="type", type="number", example=1),
     *                      @OA\Property(property="order", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="description", type="string", example="update note id 2"),
     *                      @OA\Property(property="type", type="number", example=2),
     *                      @OA\Property(property="order", type="number", example=2),
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
    public function handleQuotationNotes(Request $request)
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
            'create.*.type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],
            'create.*.order' => [
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
            'update.*.order' => [
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

        $results = $this->quotationNoteService->handleQuotationNotes($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/quotation-notes/delete-all",
     *     tags={"Quotation-Notes"},
     *     summary="Delete all quotation notes",
     *     description="Delete all quotation notes by quotation_id",
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
    public function deleteAllQuotationNotes(Request $request)
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

        $result = $this->quotationNoteService->deleteAllQuotationNotes($credentials['quotation_id']);
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
