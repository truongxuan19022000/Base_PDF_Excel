<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\QuotationSectionService;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class QuotationSectionController extends Controller
{
    private $quotationSectionService;
    private $productService;

    public function __construct(
        QuotationSectionService $quotationSectionService,
        ProductService $productService
    ) {
        $this->quotationSectionService = $quotationSectionService;
        $this->productService = $productService;
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
        $results = $this->quotationSectionService->getQuotationSections($quotationId);
        $finalData = [];
        $sumSections = 0;
        $sectionsTemp = [];
        foreach ($results['quotation_sections'] as $quotation_sections) {
            $productsTemp = [];
            $sumProducts = 0;
            $totalProduct = 0;
            foreach ($quotation_sections->products as $products) {
                $productItemsTemp = [];
                $sumItems = 0;
                $otherItemSubTotal = 0;
                $AluminiumItemSubTotal = 0;
                $otherSubtotal = 0;
                $sub_total = 0;
                foreach ($products->product_items as $product_items) {
                    $sumAluminium = 0;
                    $otherSum = 0;
                    $materials = [];
                    $productTemplate = [];
                    $scraps = [];
                    $quantityUnit = 0;
                    $credentials = [
                        "product_id" => $product_items['product_id'],
                        "type" => $product_items['type'],
                        "width" => $products['width'],
                        "height" => $products['height'],
                        "no_of_panels" => $product_items['no_of_panels'],
                        "product_template_id" => $product_items['product_template_id'],
                        "quotation_section_id" => $products['quotation_section_id'],
                        // "quantity" => $products['quotation_section_id'],
                    ];

                    if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                        $credentials["quantity"] = $products['quantity'];
                        foreach ($product_items['product_template']->productTemplateMaterial as $product) {
                            // If check item is aluminum, calculate according to the following formula:
                            if ($product->category === "Aluminium") {
                                $aluminium = $this->quotationSectionService->calculateTypeAluminium($credentials, $product);
                                $productTemplate[] = $aluminium['afterCalculate'];
                                $scraps[] = $aluminium['scraps'];
                                $sumAluminium += $aluminium['totalCosOfRawMaterial'];
                                $AluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * $sumAluminium;
                            } else {
                                $other = $this->quotationSectionService->calculateTypeOther($credentials, $product);
                                $productTemplate[] = $other['afterCalculate'];
                                $sumAluminium += $other['totalCostOfItems'];
                                $AluminiumItemSubTotal = ($products['width'] / 1000 * $products['height'] / 1000) * $sumAluminium;
                            }
                        }
                    } else {
                        $credentials["quantity"] = $product_items['quantity'];
                        $credentials["unit_price"] = $product_items['unit_price'];
                        $meterialType = $this->quotationSectionService->calculateMaterial($credentials, $product_items['materials']);
                        $quantityUnit = $meterialType['quantity_unit'];
                        if ($product_items->type == 3) {
                            $materials[] = $meterialType['afterCalculate'];
                            $otherSum =  $product_items['unit_price'];
                            $otherItemSubTotal = $product_items['unit_price'] * $product_items['quantity'];
                        } else {
                            $otherSum =  $product_items['unit_price'];
                            $otherItemSubTotal = $meterialType['subTotal'];
                        }
                        $sumItems += $otherItemSubTotal;
                    }

                    if (!empty($product_items['product_template_id']) && $product_items['type'] == config('common.material_type.product')) {
                        $sub_total = $AluminiumItemSubTotal;
                    } else {
                        $sub_total = $otherItemSubTotal;
                    }

                    $productItemsTemp[] = [
                        'id' => intval($product_items['id']),
                        'product_id' => intval($product_items['product_id']),
                        'material_id' => intval($product_items['material_id']),
                        'product_template_id' => $product_items['product_template_id'],
                        'no_of_panels' => $product_items['no_of_panels'],
                        'order_number' => $product_items['order_number'],
                        'type' => intval($product_items['type']),
                        'quantity' => $product_items['quantity'],
                        'quantity_unit' => intval($quantityUnit),
                        'title' => $product_items['title'],
                        'service_type' => intval($product_items['service_type']),
                        // 'unit_price' => $product_items['unit_price'],
                        'product_template' => $productTemplate,
                        'materials' => $materials,
                        'unit_price' => ($sumAluminium != 0) ? $sumAluminium : $otherSum,
                        'sub_total' => $sub_total,
                    ];
                }
                $sumProducts = $AluminiumItemSubTotal + $sumItems;
                $productsTemp[] = [
                    'productId' => intval($products['productId']),
                    'quotation_section_id' => intval($products['quotation_section_id']),
                    'order_number' => intval($products['order_number']),
                    'product_code' => $products['product_code'],
                    'profile' => $products['profile'],
                    'glass_type' => $products['glass_type'],
                    'storey' =>intval( $products['storey']),
                    'area' => intval($products['area']),
                    'width' => $products['width'],
                    'width_unit' => intval($products['width_unit']),
                    'height' => $products['height'],
                    'height_unit' => intval($products['height_unit']),
                    'quantity' => $products['quantity'],
                    'sub_total' => $sumProducts,
                    'product_items' => $productItemsTemp
                ];

                $this->productService->updateSubTotal(intval($products['productId']), $sumProducts);
                $totalProduct = $sumProducts * $products['quantity'];
            }

            $sectionsTemp[] = [
                'id' => intval($quotation_sections['id']),
                'quotation_id' => intval($quotation_sections['quotation_id']),
                'order_number' => intval($quotation_sections['order_number']),
                'section_name' => $quotation_sections['section_name'],
                'products' => $productsTemp
            ];

            $finalData = $sectionsTemp;
            $sumSections += $totalProduct;
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => [
                'finalData' => $finalData,
                'sumSections' => $sumSections,
                'discount' => $results['quotations']->discount_amount ?? null,
                'other_fees' => $results['quotations']['other_fees']
            ],
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

        $result = $this->quotationSectionService->delete($credentials['quotation_section_id']);
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
