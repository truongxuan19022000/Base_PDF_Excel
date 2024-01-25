<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportClaim;
use App\Http\Controllers\Controller;
use App\Services\ClaimService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class ClaimController extends Controller
{
    private $claimService;

    public function __construct(ClaimService $claimService)
    {
        $this->claimService = $claimService;
    }

    /**
     * @OA\Get(
     *     path="/admin/claims",
     *     tags={"Claims"},
     *     summary="Get list claim",
     *     description="Get list claim.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with claim_no, reference_no, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="start_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="end_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getClaims(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->claimService->getClaims($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/claims/create",
     *     tags={"Claims"},
     *     summary="Create claim",
     *     description="Create claim",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="claim_no", type="string"),
     *                 @OA\Property(property="reference_no", type="string"),
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="price", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function createClaim(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_no' => [
                'required',
                'string',
                Rule::unique('claims', 'claim_no')
            ],
            'reference_no' => [
                'required',
                'string',
                Rule::unique('claims', 'reference_no')
            ],
            'customer_id' => [
                'nullable',
                'numeric',
                Rule::exists('customers', 'id')
            ],
            'price' => 'required|numeric',
            'issue_date' => 'required|date',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->createClaim($credentials);
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
     * @OA\Get(
     *     path="/admin/claims/{claimId}/detail",
     *     tags={"Claims"},
     *     summary="Edit claim",
     *     description="Edit claim",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="claimId",
     *          in="path",
     *          description="ID of the claim to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getClaimDetail($claimId)
    {
        $customer = $this->claimService->getClaimById($claimId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $customer
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/claims/update",
     *     tags={"Claims"},
     *     summary="Update claim",
     *     description="Update claim",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="claim_id", type="number"),
     *                 @OA\Property(property="claim_no", type="string"),
     *                 @OA\Property(property="reference_no", type="string"),
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="price", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function updateClaim(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required|numeric',
            'claim_no' => [
                'required',
                'string',
                Rule::unique('claims', 'claim_no')->ignore($credentials['claim_id'])
            ],
            'reference_no' => [
                'required',
                'string',
                Rule::unique('claims', 'reference_no')->ignore($credentials['claim_id'])
            ],
            'price' => 'required|numeric',
            'customer_id' => [
                'required',
                'numeric',
                Rule::exists('customers', 'id')
            ],
            'issue_date' => 'required|date',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->updateClaim($credentials);
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
     *     path="/admin/claims/delete",
     *     tags={"Claims"},
     *     summary="Delete claim",
     *     description="Delete Claim",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="claim_id", example=1),
     *     )
     * ),
     * @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function delete(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->delete($credentials['claim_id']);
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
     *     path="/admin/claims/multi-delete",
     *     tags={"Claims"},
     *     summary="Multiple delete claim",
     *     description="Multiple Delete Claims",
     *     security={{"bearer":{}}},
     *  @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="claim_id", type="array", @OA\Items(type="number"), example={3, 4}),
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function multiDeleteClaims(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->multiDeleteClaims($credentials['claim_id']);
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
     *     path="/admin/claims/export",
     *     tags={"Claims"},
     *     summary="Export list of Claims",
     *     description="Export list of Claims.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with claim_no, reference_no, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="claim_id",
     *          in="query",
     *          description="export for claims",
     *          @OA\Schema(
     *               @OA\Property(property="claim_id[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="claim_id[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="claim_id[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="start_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Parameter(
     *          name="end_date",
     *          in="query",
     *          description="Y-m-d",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportClaims(Request $request)
    {
        $searchs = $request->all();
        return Excel::download(new ExportClaim($searchs), 'claims.csv', ExcelExcel::CSV);
    }
}
