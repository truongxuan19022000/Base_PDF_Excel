<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Imports\ImportMultiMaterial;
use App\Models\Material;
use App\Services\MaterialService;
use App\Services\ProductItemService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

class MaterialController extends Controller
{
    private $materialService;
    /**
     * @var ProductItemService
     */
    private $productItemService;

    public function __construct(MaterialService $materialService, ProductItemService $productItemService)
    {
        $this->materialService = $materialService;
        $this->productItemService = $productItemService;
    }

    /**
     * @OA\Get(
     *     path="/admin/materials",
     *     tags={"Materials"},
     *     summary="Get a list of materials",
     *     description="Get a list of all registered materials.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with item, code, price",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="category",
     *          in="query",
     *          description="Aluminium, Glass, Hardware, Services",
     *          @OA\Schema(
     *               @OA\Property(property="category[0]", type="array", @OA\Items(type="string"), example="Aluminium"),
     *               @OA\Property(property="category[1]", type="array", @OA\Items(type="string"), example="Glass"),
     *               @OA\Property(property="category[2]", type="array", @OA\Items(type="string"), example="Hardware"),
     *               @OA\Property(property="category[3]", type="array", @OA\Items(type="string"), example="Services"),
     *          )
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
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getMaterials(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->materialService->getMaterials($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/materials/all",
     *     tags={"Materials"},
     *     summary="Get a list of materials for quoatation",
     *     description="Get a list of materials for quoatation",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with item",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="service_type",
     *          in="query",
     *          description="Search with service_type",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          description="Edit quantity of list materials",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="category",
     *          in="query",
     *          description="Aluminium, Glass, Hardware, Services",
     *          @OA\Schema(
     *               @OA\Property(property="category[0]", type="array", @OA\Items(type="string"), example="Aluminium"),
     *               @OA\Property(property="category[1]", type="array", @OA\Items(type="string"), example="Glass"),
     *               @OA\Property(property="category[2]", type="array", @OA\Items(type="string"), example="Hardware"),
     *               @OA\Property(property="category[3]", type="array", @OA\Items(type="string"), example="Services"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getMaterialsForQuotation(Request $request)
    {
        $searchParams = $request->all();
        $per_page = $searchParams['per_page'] ?? config('common.paginate');

        $results = $this->materialService->getMaterialsForQuotation($searchParams, $per_page);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/materials/create",
     *     tags={"Materials"},
     *     summary="Create new Material",
     *     description="Create new Material",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *              @OA\Property(property="item", type="string", example="item3"),
     *              @OA\Property(property="code", type="string", example="CA-450535"),
     *              @OA\Property(property="category", type="string", example="Aluminium", description="Aluminium, Glass, Hardware, Services"),
     *              @OA\Property(property="profile", type="number", description="1: Euro, 2: Local"),
     *              @OA\Property(property="door_window_type", type="number", description="
     *              1: Swing Door (SWD),
     *              2: Sliding Door / Window (SLD),
     *              3: Top Hung / Fixed Panel (FTC),
     *              4: Slide & Fold Door (S&F),
     *              5: Fixed / Hung Window (FTC-70's),
     *              6: Sliding Door / Window (SLD-80's),
     *              7: Sliding Door (SLD-80's),
     *              8: Sliding Window (SLD-80's),
     *              9: Flush Door,
     *              10: Louvre Insert,
     *              11: Substation Door,
     *              12: Slide & Fold Door (S&F-DR),
     *              13: Adj. Glass Louvre Window,
     *              14: BF-TH & Fixed"),
     *              @OA\Property(property="service_type", type="number", example="0", description="1:Aluminium, 2:Glass, 3:Hardware, 4:Services"),
     *              @OA\Property(property="inner_side", type="number", description="1: Checked, 2: unChecked"),
     *              @OA\Property(property="outer_side", type="number", description="1: Checked, 2: unChecked"),
     *              @OA\Property(property="weight", type="number", example="0.975"),
     *              @OA\Property(property="raw_length", type="number", example="5.80"),
     *              @OA\Property(property="raw_girth", type="number", example="5.80"),
     *              @OA\Property(property="min_size", type="number", example="10"),
     *              @OA\Property(property="price", type="number", example="31000"),
     *              @OA\Property(property="price_unit", type="number", example="1", description="1: pcs, 2: m2, 3: m, 4: panel"),
     *              @OA\Property(property="coating_price_status", type="number", description="1: Checked, 2: unChecked", example="2"),
     *              @OA\Property(property="coating_price", type="number", example="10"),
     *              @OA\Property(property="coating_price_unit", type="number", description="1: m2")
     *              )
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function createMaterial(Request $request)
    {
        $code = 'inventory_materials';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Material::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'item' => [
                'required',
                'string',
                'max:255',
                Rule::unique('materials')->where(function ($query) use ($credentials) {
                    if (!empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium')) {
                        return $query->where('category', $credentials['category'])->where('door_window_type', $credentials['door_window_type'])->whereNull('deleted_at');
                    } elseif ($credentials['category'] === config('common.material_category.services')) {
                        return $query->where('service_type', $credentials['service_type'])->whereNull('deleted_at');
                    } else {
                        return $query->where('category', $credentials['category'])->whereNull('deleted_at');
                    }
                }),
            ],
            'code' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('materials')->where(function ($query) use ($credentials) {
                    if (!empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium')) {
                        return $query->where('category', $credentials['category'])->where('door_window_type', $credentials['door_window_type'])->whereNull('deleted_at');
                    } else {
                        return $query->where('category', $credentials['category'])->whereNull('deleted_at');
                    }
                }),
            ],
            'category' => [
                'required',
                Rule::in(array_values(config('common.material_category'))),
            ],
            'profile' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(1, 2),
                'nullable',
                'numeric'
            ],
            'door_window_type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(range(1, 14)),
                'nullable',
                'numeric'
            ],
            'service_type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.services');
                }),
                Rule::in(1, 2, 3, 4, 5),
                'numeric',
                'nullable'
            ],
            'inner_side' => ['numeric', 'nullable', Rule::in(1, 2)],
            'outer_side' => ['numeric', 'nullable', Rule::in(1, 2)],
            'weight' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'raw_length' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'raw_girth' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'min_size' => [
                'numeric',
                'nullable'
            ],
            'price' => ['required', 'numeric'],
            'price_unit' => ['required', 'numeric', Rule::in(1, 2, 3, 4)],
            'coating_price_status' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(1, 2),
                'numeric',
                'nullable'
            ],
            'coating_price' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['coating_price_status']) && $credentials['coating_price_status'] == 1;
                }),
                'numeric',
                'nullable'
            ],
            'coating_price_unit' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['coating_price_status']) && $credentials['coating_price_status'] == 1;
                }),
                'numeric',
                'nullable'
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->materialService->createMaterial($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_material_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_material_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/materials/{materialId}/edit",
     *     tags={"Materials"},
     *     summary="Get material detail",
     *     description="Get material detail",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="materialId",
     *     in="path",
     *     description="ID of the material to edit",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($materialId)
    {
        $materials = $this->materialService->getMaterialDetail($materialId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $materials
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/materials/update",
     *     tags={"Materials"},
     *     summary="Update Material",
     *     description="Update Material",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *              @OA\Property(property="material_id", type="number", example="1"),
     *              @OA\Property(property="item", type="string", example="item3"),
     *              @OA\Property(property="code", type="string", example="CA-450535"),
     *              @OA\Property(property="category", type="string", example="Aluminium", description="Aluminium, Glass, Hardware, Services"),
     *              @OA\Property(property="profile", type="number", description="1: Euro, 2: Local"),
     *              @OA\Property(property="door_window_type", type="number", description="
     *              1: Swing Door (SWD),
     *              2: Sliding Door / Window (SLD),
     *              3: Top Hung / Fixed Panel (FTC),
     *              4: Slide & Fold Door (S&F),
     *              5: Fixed / Hung Window (FTC-70's),
     *              6: Sliding Door / Window (SLD-80's),
     *              7: Sliding Door (SLD-80's),
     *              8: Sliding Window (SLD-80's),
     *              9: Flush Door,
     *              10: Louvre Insert,
     *              11: Substation Door,
     *              12: Slide & Fold Door (S&F-DR),
     *              13: Adj. Glass Louvre Window,
     *              14: BF-TH & Fixed"),
     *              @OA\Property(property="service_type", type="number", example="0", description="1:Aluminium, 2:Glass, 3:Hardware, 4:Services"),
     *              @OA\Property(property="inner_side", type="number", description="1: Checked, 2: unChecked"),
     *              @OA\Property(property="outer_side", type="number", description="1: Checked, 2: unChecked"),
     *              @OA\Property(property="weight", type="number", example="0.975"),
     *              @OA\Property(property="raw_length", type="number", example="5.80"),
     *              @OA\Property(property="raw_girth", type="number", example="5.80"),
     *              @OA\Property(property="min_size", type="number", example="10"),
     *              @OA\Property(property="price", type="number", example="31000"),
     *              @OA\Property(property="price_unit", type="number", example="1", description="1: pcs, 2: m2, 3: m, 4: panel"),
     *              @OA\Property(property="coating_price_status", type="number", description="1: Checked, 2: unChecked", example="2"),
     *              @OA\Property(property="coating_price", type="number", example="10"),
     *              @OA\Property(property="coating_price_unit", type="number", description="1: m2")
     *              )
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateMaterial(Request $request)
    {
        $code = 'inventory_materials';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Material::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'material_id' => ['required', 'numeric', Rule::exists('materials', 'id')],
            'item' => [
                'required',
                'string',
                'max:255',
                Rule::unique('materials')->where(function ($query) use ($credentials) {
                    if (!empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium')) {
                        return $query->where('door_window_type', $credentials['door_window_type'])->whereNull('deleted_at');
                    } elseif ($credentials['category'] === config('common.material_category.services')) {
                        return $query->where('service_type', $credentials['service_type'])->whereNull('deleted_at');
                    } else {
                        return $query->where('category', $credentials['category'])->whereNull('deleted_at');
                    }
                })->ignore($credentials['material_id'])
            ],
            'code' => [
                'nullable',
                'string',
                'max:100',
                Rule::unique('materials')->where(function ($query) use ($credentials) {
                    if (!empty($credentials['category']) && $credentials['category'] === config('common.material_category.aluminium')) {
                        return $query->where('door_window_type', $credentials['door_window_type']);
                    } else {
                        return $query->where('category', $credentials['category']);
                    }
                })->ignore($credentials['material_id'])->whereNull('deleted_at')
            ],
            'category' => [
                'required',
                Rule::in(array_values(config('common.material_category'))),
            ],
            'profile' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(1, 2),
                'nullable',
                'numeric'
            ],
            'door_window_type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(range(1, 14)),
                'nullable',
                'numeric'
            ],
            'service_type' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.services');
                }),
                'numeric',
                'nullable'
            ],
            'inner_side' => ['numeric', 'nullable', Rule::in(1, 2)],
            'outer_side' => ['numeric', 'nullable', Rule::in(1, 2)],
            'weight' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'raw_length' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'raw_girth' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                'numeric',
                'nullable'
            ],
            'min_size' => [
                'numeric',
                'nullable'
            ],
            'price' => ['required', 'numeric'],
            'price_unit' => ['required', 'numeric', Rule::in(1, 2, 3, 4)],
            'coating_price_status' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['category'] === config('common.material_category.aluminium');
                }),
                Rule::in(1, 2),
                'numeric',
                'nullable'
            ],
            'coating_price' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['coating_price_status']) && $credentials['coating_price_status'] == 1;
                }),
                'numeric',
                'nullable'
            ],
            'coating_price_unit' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['coating_price_status']) && $credentials['coating_price_status'] == 1;
                }),
                'numeric',
                'nullable'
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $check = $this->productItemService->checkExistMaterial($credentials['material_id']);
        if ($check)  {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.cannot_update')
            ]);
        }
        $result = $this->materialService->updateMaterial($credentials);
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
     *     path="/admin/materials/delete",
     *     tags={"Materials"},
     *     summary="Delete material",
     *     description="Delete material",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="material_id", example=1),
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
        $code = 'inventory_materials';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Material::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'material_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->materialService->delete($credentials['material_id']);
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
     *     path="/admin/materials/multi-delete",
     *     tags={"Materials"},
     *     summary="Multiple delete material",
     *     description="Multiple Delete material",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="material_ids", type="array", @OA\Items(type="number"), example="[1,2,3]"),
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
    public function multiDeleteMaterial(Request $request)
    {
        $code = 'inventory_materials';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Material::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'material_ids' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->materialService->multiDeleteMaterial($credentials['material_ids']);
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
     *     path="/admin/materials/export",
     *     tags={"Materials"},
     *     summary="Exports a list of materials",
     *     description="Exports a list of materials.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="material_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="material_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="material_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="material_ids[2]", type="array", @OA\Items(type="number"), example="3"),
     *               @OA\Property(property="material_ids[3]", type="array", @OA\Items(type="number"), example="4"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function exportMaterials(Request $request)
    {
        $credentials = $request->all();
        $materialIdsString = isset($credentials['material_ids']) ? implode(',', $credentials['material_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/material/' . $materialIdsString,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/materials/import",
     *     tags={"Materials"},
     *     summary="import a list of materials",
     *     description="import a list of materials.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="file", type="file", format="file", description="required if type: document (csv,xlsx)"),
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
    public function importMaterials(Request $request)
    {
        try {
            $credentials = $request->all();
            $rule = [
                'file' => 'required|file|max:20480|mimes:xlsx',
            ];

            $validator = Validator::make($credentials, $rule);
            if ($validator->fails()) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'message' => $validator->messages()
                ]);
            }
            Excel::import(new ImportMultiMaterial(), $credentials['file']);
            return response()->json([
                'status' => config('common.response_status.success'),
                'message' => trans('message.upload_material_success')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                ['error' => $e->getMessage()]
            ]);
        }
    }

}
