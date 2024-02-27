<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\QuotationSectionService;
use App\Services\ProductService;
use App\Services\ScrapService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class QuotationSectionController extends Controller
{
    private $quotationSectionService;
    private $productService;
    private $scrapService;

    public function __construct(
        QuotationSectionService $quotationSectionService,
        ProductService $productService,
        ScrapService $scrapService
    ) {
        $this->quotationSectionService = $quotationSectionService;
        $this->productService = $productService;
        $this->scrapService = $scrapService;
    }

    /**
     * @OA\Get(
     *     path="/admin/quotation-sections",
     *     tags={"Quotation-Sections"},
     *     summary="Get list of quotation sections",
     *     description="Get list of quotation sections.",
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
    public function getQuotationSections(Request $request)
    {
        $quotationId = $request->quotation_id;
        $data = $this->quotationSectionService->handleCalculateQuotation($quotationId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $data
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/create",
     *     tags={"Quotation-Sections"},
     *     summary="Create new quotation sections",
     *     description="Create new quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="section_name", type="string"),
     *                 @OA\Property(property="order_number", type="number"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function createQuotationSection(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
            'section_name' => 'required|string|max:255',
            'order_number' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationSectionService->createQuotationSection($credentials);

        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $result['data']
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/update",
     *     tags={"Quotation-Sections"},
     *     summary="Update quotation sections",
     *     description="Update quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_section_id", type="number"),
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="section_name", type="string"),
     *                 @OA\Property(property="order_number", type="number"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateQuotationSection(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_section_id' => 'required|numeric',
            'quotation_id' => 'required|numeric',
            'section_name' => 'required|string|max:255',
            'order_number' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationSectionService->updateQuotationSection($credentials);

        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $result['data']
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/update-order-number",
     *     tags={"Quotation-Sections"},
     *     summary="update order number of quotation-sections.",
     *     description="update order number of quotation-sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_sections", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="quotation_section_id", type="number", example="2"),
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
            'quotation_sections' => 'required|array',
            'quotation_sections.*.quotation_section_id' => [
                'required', 'numeric'
            ],
            'quotation_sections.*.order_number' => [
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

        $result = $this->quotationSectionService->updateOrderNumber($credentials);

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

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/handle",
     *     tags={"Quotation-Sections"},
     *     summary="Handle quotation sections",
     *     description="Handle quotation sections",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="section_name", type="string", example="section A"),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="section_name", type="string", example="update section id 2"),
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
    public function handleQuotationSections(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'create' => 'array',
            'create.*.section_name' => [
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
            'update.*.section_name' => [
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

        $results = $this->quotationSectionService->handleQuotationSections($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/quotation-sections/delete",
     *     tags={"Quotation-Sections"},
     *     summary="Delete quotation section",
     *     description="Delete quotation section",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="quotation_section_id", example=1),
     *             @OA\Property(property="quotation_id", example=1),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_section_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationSectionService->delete($credentials['quotation_section_id'], $credentials['quotation_id']);
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
