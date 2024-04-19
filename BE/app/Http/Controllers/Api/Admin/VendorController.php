<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\VendorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class VendorController extends Controller
{
    private $vendorService;

    public function __construct(VendorService $vendorService)
    {
        $this->vendorService = $vendorService;
    }

    /**
     * @OA\Get(
     *     path="/admin/vendors",
     *     tags={"Vendors"},
     *     summary="Get a list of Vendors",
     *     description="Get a list of all registered Vendors.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with vendor_name, phone, email",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getVendors(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->vendorService->getVendors($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/vendors/create",
     *     tags={"Vendors"},
     *     summary="Create new vendor",
     *     description="Create new vendor",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="vendor_name", type="string"),
     *                 @OA\Property(property="phone", type="number"),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="address_1", type="string"),
     *                 @OA\Property(property="address_2", type="string"),
     *                 @OA\Property(property="postal_code", type="string"),
     *                 @OA\Property(property="company_name", type="string")
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function createVendor(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'vendor_name' => 'required|string|max:100',
            'phone' => [
                'required',
                'numeric',
                Rule::unique('vendors', 'phone')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                })
            ],
            'email' => 'required|email|string|max:255',
            'address_1' => 'required|max:255',
            'address_2' => 'nullable|max:255',
            'postal_code' => 'required|max:50',
            'company_name' => 'nullable|max:255',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $mailExistedMessage = [];
        $checkEmailExists = $this->vendorService->checkEmailExists($credentials['email']);
        if ($checkEmailExists['status']) {
            $mailExistedMessage = [
                'email' => [
                    trans('message.email_exist')
                ]
            ];
        }

        if ($mailExistedMessage) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' =>  $mailExistedMessage
            ]);
        }

        $result = $this->vendorService->createVendor($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_vendor_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_vendor_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/vendors/{vendorId}/detail",
     *     tags={"Vendors"},
     *     summary="Get detail vendor",
     *     description="Get detail vendor",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="vendorId",
     *     in="path",
     *     description="ID of the vendor show detail",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getVendorDetail($vendorId)
    {
        $results = $this->vendorService->getVendorDetail($vendorId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/vendors/update",
     *     tags={"Vendors"},
     *     summary="Update Vendor",
     *     description="Update Vendor",
     *     security={{"bearer":{}}},
     *      @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="vendor_id", type="number"),
     *                 @OA\Property(property="vendor_name", type="string"),
     *                 @OA\Property(property="phone", type="number"),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="address_1", type="string"),
     *                 @OA\Property(property="address_2", type="string"),
     *                 @OA\Property(property="postal_code", type="string"),
     *                 @OA\Property(property="company_name", type="string")
     *             )
     *         )
     *     ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateVendor(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'vendor_id' => 'required',
            'vendor_name' => 'required|string|max:100',
            'phone' => [
                'required',
                'numeric',
                Rule::unique('vendors', 'phone')->where(function ($query) use ($credentials) {
                    return $query->where('id', '!=', $credentials['vendor_id'])->whereNull('deleted_at');
                })
            ],
            'address_1' => 'required|max:255',
            'address_2' => 'nullable|max:255',
            'postal_code' => 'required|max:50',
            'company_name' => 'nullable|max:255',
            'email' => [
                'required',
                'email',
                'string',
                'max:255',
                Rule::unique('vendors', 'email')->where(function ($query) use ($credentials) {
                    return $query->where('id', '!=', $credentials['vendor_id'])->whereNull('deleted_at');
                })
            ]
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->vendorService->updateVendor($credentials);
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
     *     path="/admin/vendors/delete",
     *     tags={"Vendors"},
     *     summary="Delete vendor",
     *     description="Delete Vendor",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="vendor_id", example=1),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'vendor_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->vendorService->delete($credentials['vendor_id']);
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
     *     path="/admin/vendors/multi-delete",
     *     tags={"Vendors"},
     *     summary="Multiple delete vendor",
     *     description="Multiple Delete Vendor",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="vendor_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteVendor(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'vendor_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->vendorService->multiDeleteVendor($credentials['vendor_id']);
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
     *     path="/admin/vendors/export",
     *     tags={"Vendors"},
     *     summary="Exports list of Customers",
     *     description="Exports list of Customers.",
     *     security={{"bearer":{}}},
     *    @OA\Parameter(
     *          name="vendor_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="vendor_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="vendor_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportVendors(Request $request)
    {
        $credentials = $request->all();
        $vendorIdsString = isset($credentials['vendor_ids']) ? implode(',', $credentials['vendor_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/vendor/' . $vendorIdsString,
        ]);
    }
}
