<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use App\Services\QuotationSectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private $productService;
    private $quotationSectionService;

    public function __construct(ProductService $productService,   QuotationSectionService $quotationSectionService)
    {
        $this->productService = $productService;
        $this->quotationSectionService = $quotationSectionService;
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/create",
     *     tags={"Quotation-Sections"},
     *     summary="Create new product to quotation sections",
     *     description="Create new product to quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_section_id", type="number"),
     *                 @OA\Property(property="order_number", type="number", example=1),
     *                 @OA\Property(property="product_code", type="string"),
     *                 @OA\Property(property="profile", type="number", example=1),
     *                 @OA\Property(property="glass_type", type="string", example="6mm Clear Tempered"),
     *                 @OA\Property(property="quantity", type="number", example=2),
     *                 @OA\Property(property="storey", type="number", example="1"),
     *                 @OA\Property(property="storey_text", type="string", example="1st Storey"),
     *                 @OA\Property(property="area", type="number", example="2"),
     *                 @OA\Property(property="area_text", type="string", example="Living Room"),
     *                 @OA\Property(property="width", type="number", example=1500),
     *                 @OA\Property(property="width_unit", type="number", example=0),
     *                 @OA\Property(property="height", type="number", example=3000),
     *                 @OA\Property(property="height_unit", type="number", example=0),
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
    public function createProduct(Request $request)
    {
        $credentials = $request->all();
        $quotation_section_id = $credentials['quotation_section_id'];
        $rule = [
            'quotation_section_id' => [
                'required',
                'numeric',
                Rule::exists('quotation_sections', 'id')
            ],
            'order_number' => 'required|numeric',
            'product_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'product_code')->whereNull('deleted_at')
                    ->where(function ($query) use ($quotation_section_id) {
                        $query->where('quotation_section_id', $quotation_section_id);
                    })
            ],
            'profile' => 'required|numeric',
            'glass_type' => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'storey' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['storey_text']);
                }),
                'numeric'
            ],
            'storey_text' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['storey']);
                }),
                'string'
            ],
            'area' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['area_text']);
                }),
                'numeric'
            ],
            'area_text' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['area']);
                }),
                'string'
            ],
            'width' => 'required|numeric',
            'width_unit' => 'numeric',
            'height' => 'required|numeric',
            'height_unit' => 'numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productService->createProduct($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $result['data']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/update",
     *     tags={"Quotation-Sections"},
     *     summary="Update product to quotation sections",
     *     description="Update product to quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="product_id", type="number"),
     *                 @OA\Property(property="quotation_section_id", type="number"),
     *                 @OA\Property(property="order_number", type="number", example=1),
     *                 @OA\Property(property="product_code", type="string"),
     *                 @OA\Property(property="profile", type="number", example=1),
     *                 @OA\Property(property="glass_type", type="string", example="6mm Clear Tempered"),
     *                 @OA\Property(property="quantity", type="number", example=2),
     *                 @OA\Property(property="storey", type="number", example="1"),
     *                 @OA\Property(property="storey_text", type="string", example="1st Storey"),
     *                 @OA\Property(property="area", type="number", example="2"),
     *                 @OA\Property(property="area_text", type="string", example="Living Room"),
     *                 @OA\Property(property="width", type="number", example=1500),
     *                 @OA\Property(property="width_unit", type="number", example=0),
     *                 @OA\Property(property="height", type="number", example=3000),
     *                 @OA\Property(property="height_unit", type="number", example=0),
     *                 @OA\Property(property="quotation_id", type="number", example=0),
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
    public function updateProduct(Request $request)
    {
        $credentials = $request->all();
        $quotation_section_id = $credentials['quotation_section_id'];
        $rule = [
            'product_id' => [
                'required',
                'numeric',
                Rule::exists('products', 'id')
            ],
            'quotation_section_id' => [
                'required',
                'numeric',
                Rule::exists('quotation_sections', 'id')
            ],
            'order_number' => 'required|numeric',
            'product_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'product_code')
                    ->ignore($credentials['product_id'])
                    ->whereNull('deleted_at')
                    ->where(function ($query) use ($quotation_section_id) {
                        $query->where('quotation_section_id', $quotation_section_id);
                    })
            ],
            'profile' => 'required|numeric',
            'glass_type' => 'required|string|max:255',
            'quantity' => 'required|numeric',
            'storey' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['storey_text']);
                }),
                'numeric'
            ],
            'storey_text' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['storey']);
                }),
                'string'
            ],
            'area' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['area_text']);
                }),
                'numeric'
            ],
            'area_text' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['area']);
                }),
                'string'
            ],
            'width' => 'required|numeric',
            'width_unit' => 'numeric',
            'height' => 'required|numeric',
            'height_unit' => 'numeric',
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productService->updateProduct($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $result['data']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotation-sections/products/detail",
     *     tags={"Quotation-Sections"},
     *     summary="Get detail product in quotation sections",
     *     description="Get detail product in quotation sections",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="product_id", type="number"),
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
    public function getProductDetail(Request $request)
    {
        $productId = $request->product_id;
        $results = $this->productService->getProductDetail($productId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/quotation-sections/products/delete",
     *     tags={"Quotation-Sections"},
     *     summary="Delete product in quotation sections",
     *     description="Delete product in quotation sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="product_id", example=1),
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
    public function deleteProduct(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'product_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productService->deleteProduct($credentials['product_id'], $credentials['quotation_id']);
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
     *     path="/admin/quotation-sections/products/update-order-number",
     *     tags={"Quotation-Sections"},
     *     summary="update order number of product in quotation-sections.",
     *     description="update order number of product in quotation-sections.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_section_id", example=1),
     *              @OA\Property(property="products", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="product_id", type="number", example="1"),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  ),
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
            'quotation_section_id' => 'required|numeric',
            'products' => 'required|array',
            'products.*.product_id' => [
                'required', 'numeric'
            ],
            'products.*.order_number' => [
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

        $result = $this->productService->updateOrderNumber($credentials);

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
