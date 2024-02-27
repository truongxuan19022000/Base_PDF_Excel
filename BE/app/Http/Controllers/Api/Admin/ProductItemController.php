<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductItemService;
use App\Services\ProductTemplateService;
use App\Services\ScrapService;
use App\Services\MaterialService;
use App\Services\QuotationSectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductItemController extends Controller
{
    private $productItemService;

    private $productTemplateService;

    private $quotationSectionService;

    private $materialService;
    private $scrapService;

    public function __construct(
        ProductItemService $productItemService,
        ProductTemplateService $productTemplateService,
        QuotationSectionService $quotationSectionService,
        MaterialService $materialService,
        ScrapService $scrapService
    ) {
        $this->productItemService = $productItemService;
        $this->productTemplateService = $productTemplateService;
        $this->quotationSectionService = $quotationSectionService;
        $this->materialService = $materialService;
        $this->scrapService = $scrapService;
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/items/create",
     *     tags={"Quotation-Sections"},
     *     summary="Create new item to product in quotation sections",
     *     description="Create new item to product in quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="product_id", type="number"),
     *                 @OA\Property(property="material_id", type="number"),
     *                 @OA\Property(property="product_template_id", type="number"),
     *                 @OA\Property(property="quotation_section_id", type="number"),
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="no_of_panels", type="number"),
     *                 @OA\Property(property="order_number", type="number"),
     *                 @OA\Property(property="type", type="number", description="1: Product, 2: Glass, 3: Extra Order"),
     *                 @OA\Property(property="quantity", type="number"),
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="service_type", type="number"),
     *                 @OA\Property(property="unit_price", type="number", description="1: pc, 2: m2, 3: m, 4: panel"),
     *                 @OA\Property(property="height", type="number"),
     *                 @OA\Property(property="width", type="number"),
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
    public function createProductItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_id' => [
                'required',
                'numeric',
                Rule::exists('products', 'id')
            ],
            'material_id' => [
                'numeric',
                Rule::exists('materials', 'id')
            ],
            'product_template_id' => [
                'numeric',
                Rule::exists('product_templates', 'id')
            ],
            'no_of_panels' => 'numeric',
            'order_number' => 'required|numeric',
            'type' => 'required|numeric',
            'quantity' => [
                'numeric',
                Rule::requiredIf(function () use ($credentials) {
                    return isset($credentials['type']) && $credentials['type'] == config('common.material_type.extra_order');
                }),
            ],
            'title' => 'required|string|max:255',
            'service_type' => 'numeric',
            'unit_price' => [
                'numeric',
                Rule::requiredIf(function () use ($credentials) {
                    return isset($credentials['type']) && $credentials['type'] != config('common.material_type.product');
                }),
            ],
            'quotation_section_id' => 'required|integer',
            'quotation_id' => 'required|integer'
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        if ($credentials['type'] == config('common.material_type.product') && (empty($credentials['product_template_id']))) {
            $productTemplateData = [
                'item' => '',
                'profile' => 1,
                'create_type' => 2
            ];
            $productTemplate = $this->productTemplateService->createProductTemplate($productTemplateData, null);
            $credentials['product_template_id'] = $productTemplate['data']->id;
        }
        $result = $this->productItemService->createProductItem($credentials);

        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $result['data'],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/items/update",
     *     tags={"Quotation-Sections"},
     *     summary="Update item to product in quotation sections",
     *     description="Update item to product in quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="product_item_id", type="number"),
     *                 @OA\Property(property="product_id", type="number"),
     *                 @OA\Property(property="material_id", type="number"),
     *                 @OA\Property(property="product_template_id", type="number"),
     *                 @OA\Property(property="no_of_panels", type="number"),
     *                 @OA\Property(property="order_number", type="number"),
     *                 @OA\Property(property="type", type="number", description="1: Product, 2: Glass, 3: Extra Order"),
     *                 @OA\Property(property="quantity", type="number"),
     *                 @OA\Property(property="title", type="string"),
     *                 @OA\Property(property="service_type", type="number"),
     *                 @OA\Property(property="unit_price", type="number", description="1: pc, 2: m2, 3: m, 4: panel"),
     *                 @OA\Property(property="quotation_id", type="number"),
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
    public function updateProductItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_item_id' => [
                'required',
                'numeric',
                Rule::exists('product_items', 'id')
            ],
            'product_id' => [
                'required',
                'numeric',
                Rule::exists('products', 'id')
            ],
            'material_id' => [
                'numeric',
                Rule::exists('materials', 'id')
            ],
            'product_template_id' => [
                'numeric',
                Rule::exists('product_templates', 'id')
            ],
            'no_of_panels' => 'numeric',
            'order_number' => 'required|numeric',
            'type' => 'required|numeric',
            'quantity' => [
                'numeric',
                Rule::requiredIf(function () use ($credentials) {
                    return isset($credentials['type']) && $credentials['type'] == config('common.material_type.extra_order');
                }),
            ],
            'title' => 'required|string|max:255',
            'service_type' => 'numeric',
            'unit_price' => [
                'numeric',
                Rule::requiredIf(function () use ($credentials) {
                    return isset($credentials['type']) && $credentials['type'] != config('common.material_type.product');
                }),
            ],
            'quotation_id' => 'required|integer'
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        if ($credentials['type'] == config('common.material_type.product') && (empty($credentials['product_template_id']))) {
            $productTemplateData = [
                'item' => '',
                'profile' => 1,
                'create_type' => 2
            ];
            $productTemplate = $this->productTemplateService->createProductTemplate($productTemplateData, null);
            $credentials['product_template_id'] = $productTemplate['data']->id;
        }

        $result = $this->productItemService->updateProductItem($credentials);
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
     * @OA\Delete(
     *     path="/admin/quotation-sections/products/items/delete",
     *     tags={"Quotation-Sections"},
     *     summary="Delete item from product in quotation sections",
     *     description="Delete item from product in quotation sections",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="product_item_id", example=1),
     *             @OA\Property(property="quotation_id", type="number"),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function deleteProductItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_item_id' => 'required|numeric',
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productItemService->deleteProductItem($credentials['product_item_id'], $credentials['quotation_id']);
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
     *     path="/admin/quotation-sections/products/material-item/delete",
     *     tags={"Quotation-Sections"},
     *     summary="Delete item from product item in quotation sections",
     *     description="Delete item from product item in quotation sections",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *               @OA\Property(property="product_item_template_id", type="number", example=1),
     *               @OA\Property(property="product_item_id", type="number", example=1),
     *               @OA\Property(property="product_template_material_id", type="number", example=1),
     *               @OA\Property(property="scrap_id", type="number", example=1),
     *               @OA\Property(property="used_scrap_id", type="number", example=1),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function deleteMaterialItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_item_template_id' => 'required|numeric',
            'product_item_id' => 'required|numeric',
            'product_template_material_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productItemService->deleteMaterialItem($credentials);
        $this->quotationSectionService->handleCalculateQuotationForUpdate($credentials['quotation_id']);
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
     *     path="/admin/quotation-sections/products/items/calculate-amount",
     *     tags={"Quotation-Sections"},
     *     summary="Delete item from product in quotation sections",
     *     description="Update calculate amount",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="product_template_id", example=14),
     *             @OA\Property(property="width_quantity", example=4),
     *             @OA\Property(property="height_quantity", example=4),
     *             @OA\Property(property="cost_of_raw_aluminium", example=12.3),
     *             @OA\Property(property="cost_of_powder_coating", example=24.5),
     *             @OA\Property(property="cost_of_scrap", example=4.00),
     *             @OA\Property(property="height", example=3000),
     *             @OA\Property(property="width", example=1500),
     *             @OA\Property(property="material_id", example=1),
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateCalculate(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_template_id' => 'required|numeric',
            'material_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $afterCalculate = $this->productItemService->calculateQuotationAmount($credentials);
        return response()->json([
            'total_cost_of_items' => $afterCalculate['totalCostOfItems'],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/material-item/create",
     *     tags={"Quotation-Sections"},
     *     summary="Create material item in product item",
     *     description="Create material item in product item",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="width", type="number", example="1000", description="width from product"),
     *              @OA\Property(property="height", type="number", example="3000", description="height from product"),
     *              @OA\Property(property="category", type="string", example="Aluminium", description="Aluminium, Glass, Hardware, Services"),
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="material_id", type="number", example=1),
     *              @OA\Property(property="product_template_id", type="number", example=1),
     *              @OA\Property(property="product_item_id", type="number", example=1),
     *              @OA\Property(property="width_quantity", type="number", example=2),
     *              @OA\Property(property="height_quantity", type="number", example=2),
     *              @OA\Property(property="cost_of_powder_coating", type="number", example=14.5),
     *              @OA\Property(property="cost_of_raw_aluminium", type="number", example=52.2),
     *              @OA\Property(property="cost_of_scrap", type="number", example=3.2),
     *              @OA\Property(property="product_template_material_id", type="number", example=1),
     *              @OA\Property(property="scrap_id", type="number", example=1),
     *              @OA\Property(property="scrap_length", type="number", example=2),
     *              @OA\Property(property="scrap_weight", type="number", example=3),
     *              @OA\Property(property="quantity", type="number", example=3),
     *              @OA\Property(property="cost_of_item", type="number", example=3),
     *          )
     *      ),
     *      @OA\Response(
     *          response="200",
     *          description="Successful",
     *      )
     * )
     *
     */
    public function createMaterialItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'width' => 'required|numeric',
            'height' => 'required|numeric',
            'category' => 'required',
            'cost_of_powder_coating' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_raw_aluminium' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_scrap' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_item' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] !== config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'quantity' => ['numeric', 'nullable'],
            'quotation_id' => 'required|numeric',
            'material_id' => 'numeric',
            'product_template_id' => 'required|numeric',
            'product_item_id' => 'required|numeric',
        ];
        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $data =  $this->productItemService->createMaterialItem($credentials);
        if (!$data) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }


        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $data
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/material-item/update",
     *     tags={"Quotation-Sections"},
     *     summary="Update a material item in product item",
     *     description="Update a material item in product item",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="width", type="number", example="1000", description="width from product"),
     *              @OA\Property(property="height", type="number", example="3000", description="height from product"),
     *              @OA\Property(property="category", type="string", example="Aluminium", description="Aluminium, Glass, Hardware, Services"),
     *              @OA\Property(property="product_item_template_id", type="number", example=1),
     *              @OA\Property(property="quotation_id", type="number", example=1),
     *              @OA\Property(property="material_id", type="number", example=1),
     *              @OA\Property(property="product_template_material_id", type="number", example=1),
     *              @OA\Property(property="product_template_id", type="number", example=1),
     *              @OA\Property(property="width_quantity", type="number", example=2),
     *              @OA\Property(property="height_quantity", type="number", example=2),
     *              @OA\Property(property="cost_of_powder_coating", type="number", example=14.5),
     *              @OA\Property(property="cost_of_raw_aluminium", type="number", example=52.2),
     *              @OA\Property(property="cost_of_scrap", type="number", example=3.2),
     *              @OA\Property(property="scrap_id", type="number", example=1),
     *              @OA\Property(property="scrap_length", type="number", example=2),
     *              @OA\Property(property="scrap_weight", type="number", example=3),
     *              @OA\Property(property="quantity", type="number", example=3),
     *              @OA\Property(property="raw_quantity", type="number", example=3),
     *              @OA\Property(property="cost_of_item", type="number", example=3),
     *          )
     *      ),
     *      @OA\Response(
     *          response="200",
     *          description="Successful",
     *      )
     * )
     *
     */
    public function updateMaterialItem(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'width' => 'required|numeric',
            'height' => 'required|numeric',
            'cost_of_powder_coating' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_raw_aluminium' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_scrap' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'cost_of_item' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['category']) && $credentials['category'] !== config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'quantity' => ['numeric', 'nullable'],
            'quotation_id' => 'nullable|numeric',
            'material_id' => 'nullable|numeric',
            'product_template_material_id' => 'nullable|numeric',
            'product_template_id' => 'nullable|numeric',
            'product_item_template_id' => 'required|numeric',
        ];
        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $material_item =  $this->productItemService->updateMaterialItem($credentials['product_item_template_id'], $credentials);
        if (!$material_item) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.update_success')
        ]);
    }

}
