<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductTemplate;
use App\Services\ProductItemService;
use App\Services\ProductTemplateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ProductTemplateController extends Controller
{
    private $productTemplateService;
    private $productItemService;

    public function __construct(ProductTemplateService $productTemplateService, ProductItemService $productItemService)
    {
        $this->productTemplateService = $productTemplateService;
        $this->productItemService = $productItemService;
    }

    /**
     * @OA\Get(
     *     path="/admin/product-templates",
     *     tags={"Product-Templates"},
     *     summary="Get a list of product-templates",
     *     description="Get a list of all product-templates.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with item, profile",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="profile",
     *          in="query",
     *          description="Euro: 1, Local: 2",
     *          @OA\Schema(
     *               @OA\Property(property="profile[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="profile[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *      @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          description="edit quantity of list product-templates",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getProductTemplates(Request $request)
    {
        $searchParams = $request->all();
        $per_page = $searchParams['per_page'] ?? config('common.paginate');

        $results = $this->productTemplateService->getProductTemplates($searchParams, $per_page);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/product-templates/all",
     *     tags={"Product-Templates"},
     *     summary="Get a list of product-templates for quotations",
     *     description="Get a list of all product-templates for quotations.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with item, profile",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          description="edit quantity of list product-templates",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getProductTemplatesForQuotations(Request $request)
    {
        $searchParams = $request->all();
        $per_page = $searchParams['per_page'] ?? config('common.paginate');

        $results = $this->productTemplateService->getProductTemplatesForQuotations($searchParams, $per_page);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/product-templates/detail",
     *     tags={"Product-Templates"},
     *     summary="Get product-template",
     *     description="Get product-template.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="product_template_id",
     *          in="query",
     *          description="id of product template",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getProductTemplateDetail(Request $request)
    {
        $productTemplateId = $request->product_template_id;
        $results = $this->productTemplateService->getProductTemplateDetail($productTemplateId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/product-templates/create",
     *     tags={"Product-Templates"},
     *     summary="Create new product template",
     *     description="Create new product template.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="item", type="string"),
     *              @OA\Property(property="profile", type="number", example="1"),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="material_id", type="number", example="1"),
     *                      @OA\Property(property="quantity", type="number", example="1"),
     *                  )
     *              ),
     *          )
     *      ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function createProductTemplate(Request $request)
    {
        $code = 'inventory_product_templates';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [ProductTemplate::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'item' => 'required|string|max:255',
            'profile' => 'required|numeric|in:1,2',
            'create' => 'required|array',
            'create.*.material_id' => [
                'required',
                'numeric',
                Rule::exists('materials', 'id')
            ],
            'create.*.quantity' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $products = $credentials['create'];
        $result = $this->productTemplateService->createProductTemplate($credentials, $products);
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
     * @OA\Post(
     *     path="/admin/product-templates/update",
     *     tags={"Product-Templates"},
     *     summary="Update product template",
     *     description="Update product template.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="product_template_id", type="number", example="14"),
     *              @OA\Property(property="item", type="string"),
     *              @OA\Property(property="profile", type="number", example="1"),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="material_id", type="number", example="1"),
     *                      @OA\Property(property="quantity", type="number", example="1"),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="material_id", type="number", example="2"),
     *                      @OA\Property(property="quantity", type="number", example="3"),
     *                  )
     *              ),
     *              @OA\Property(property="delete", type="array", @OA\Items(type="number"), example={3, 4}),
     *          )
     *      ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateProductTemplate(Request $request)
    {
        $code = 'inventory_product_templates';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [ProductTemplate::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'product_template_id' => [
                'required',
                'numeric',
                Rule::exists('product_templates', 'id')
            ],
            'item' => 'required|string|max:255',
            'profile' => 'required|numeric|in:1,2',
            'create' => 'array',
            'create.*.material_id' => [
                'numeric',
                Rule::exists('materials', 'id'),
            ],
            'create.*.quantity' => 'required|numeric',
            'update' => 'array',
            'update.*.material_id' => [
                'numeric',
                Rule::exists('materials', 'id')
            ],
            'update.*.quantity' => 'required|numeric',
            'delete' => 'array',
            'delete.*.material_id' => [
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
        $check = $this->productItemService->checkExistProductTemplate($credentials['product_template_id']);
        if ($check > 0) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }
        $result = $this->productTemplateService->updateProductTemplate($credentials);
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
     * @OA\Delete(
     *     path="/admin/product-templates/delete",
     *     tags={"Product-Templates"},
     *     summary="Delete material",
     *     description="Delete material",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="product_template_id", example="1"),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $code = 'inventory_product_templates';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [ProductTemplate::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'product_template_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };
        $check = $this->productItemRepository->checkExistProductTemplate($credentials['product_template_id']);
        if ($check > 0) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }
        $result = $this->productTemplateService->delete($credentials['product_template_id']);
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
     *     path="/admin/product-templates/multi-delete",
     *     tags={"Product-Templates"},
     *     summary="Multiple delete material",
     *     description="Multiple Delete material",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="product_template_ids", type="array", @OA\Items(type="number"), example="[1,2,3]"),
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeleteProductTemplate(Request $request)
    {
        $code = 'inventory_product_templates';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [ProductTemplate::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'product_template_ids' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->productTemplateService->multiDeleteProductTemplate($credentials['product_template_ids']);
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
     *     path="/admin/product-templates/export",
     *     tags={"Product-Templates"},
     *     summary="Exports csv product-templates",
     *     description="Exports csv product-templates.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="product_template_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="product_template_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="product_template_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="product_template_ids[2]", type="array", @OA\Items(type="number"), example="3"),
     *               @OA\Property(property="product_template_ids[3]", type="array", @OA\Items(type="number"), example="4"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function exportProductTemplates(Request $request)
    {
        $credentials = $request->all();
        $productTemplateIdsString = isset($credentials['product_template_ids']) ? implode(',', $credentials['product_template_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/product-template/' . $productTemplateIdsString,
        ]);
    }
}
