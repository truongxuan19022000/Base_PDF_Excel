<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductItemService;
use App\Services\ProductTemplateService;
use App\Services\ScrapService;
use App\Services\MaterialService;
use App\Services\QuotationSectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductItemController extends Controller
{
    private $productItemService;

    private $productTemplateService;

    private $quotationSectionService;

    private $materialService;

    public function __construct(
        ProductItemService $productItemService,
        ProductTemplateService $productTemplateService,
        QuotationSectionService $quotationSectionService,
        MaterialService $materialService
    ) {
        $this->productItemService = $productItemService;
        $this->productTemplateService = $productTemplateService;
        $this->quotationSectionService = $quotationSectionService;
        $this->materialService = $materialService;
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
            'quotation_section_id' => 'required|integer'
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $afterCalculate = $this->calculateQuotationAmount($credentials);
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
            'total_cost_of_items' => $afterCalculate['totalCostOfItems'],
            'scraps' => $afterCalculate['scraps'],
            'product_template_materials' => $afterCalculate['afterCalculate']['product_template_materials']
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
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
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
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productItemService->deleteProductItem($credentials['product_item_id']);
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

    private function calculateQuotationAmount($credentials)
    {
        $afterCalculate = [];
        $totalCostOfItems = 0;
        $scraps = [];
        if (isset($credentials['product_template_id']) && $credentials['type'] == config('common.material_type.product')) {
            $productTemplate = $this->productTemplateService->getProductTemplateDetail($credentials['product_template_id']);
            foreach ($productTemplate['product_templates']->productTemplateMaterial as $product) {
                // If check item is aluminum, calculate according to the following formula:
                if ($product->category === "Aluminium") {
                    $aluminium = $this->quotationSectionService->calculateTypeAluminium($credentials, $product);
                    $totalCostOfItems = $totalCostOfItems + $aluminium['totalCosOfRawMaterial'];
                    $afterCalculate['product_template_materials'][] = $aluminium['afterCalculate'];
                    $scraps[] = $aluminium['scraps'];
                } else {
                    $other = $this->quotationSectionService->calculateTypeOther($credentials, $product);
                    $afterCalculate['product_template_materials'][] = $other['afterCalculate'];
                    $totalCostOfItems = $totalCostOfItems + $other['totalCostOfItems'];
                }
            }
        } else {
            $detail = $this->materialService->getMaterialDetail($credentials['material_id']);
            $meterialType = $this->quotationSectionService->calculateMaterial($credentials, $detail['materials']);
            $afterCalculate['product_template_materials'][] = $meterialType['afterCalculate'];
            $totalCostOfItems = $totalCostOfItems + $meterialType['totalCostOfItems'];
        }

        return [
            'totalCostOfItems' => $totalCostOfItems,
            'afterCalculate' => $afterCalculate,
            'scraps' => $scraps
        ];
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

        $afterCalculate = $this->calculateQuotationAmount($credentials);
        return response()->json([
            'total_cost_of_items' => $afterCalculate['totalCostOfItems'],
            'product_template_materials' => $afterCalculate['afterCalculate']['product_template_materials']
        ]);
    }
}
