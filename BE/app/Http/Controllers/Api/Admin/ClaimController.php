<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Claim;
use App\Repositories\ActivityRepository;
use App\Services\ClaimService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ClaimController extends Controller
{
    private $claimService;
    private $activityRepository;

    public function __construct(ClaimService $claimService, ActivityRepository $activityRepository)
    {
        $this->claimService = $claimService;
        $this->activityRepository = $activityRepository;
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
     *          name="status",
     *          in="query",
     *          description="1:Pending, 2:Paid",
     *          @OA\Schema(type="string"),
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
     *                 @OA\Property(property="quotation_id", type="number"),
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
        $code = 'claim';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Claim::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'claim_no' => [
                'required',
                'string',
                Rule::unique('claims', 'claim_no')->whereNull('deleted_at')
            ],
            'quotation_id' => [
                'required',
                'nullable',
                'numeric',
                Rule::exists('quotations', 'id')
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
        $checkClaim = $this->claimService->checkExistClaim($credentials['quotation_id']);
        if ($checkClaim) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null,
                'message' => 'Selected Quotation has already had different Claims.'
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
     * @OA\Post(
     *     path="/admin/claims/copy",
     *     tags={"Claims"},
     *     summary="Create claim",
     *     description="Create claim",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="claim_id", type="number"),
     *                 @OA\Property(property="claim_no", type="string"),
     *                 @OA\Property(property="quotation_id", type="number"),
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
    public function copyClaim(Request $request)
    {
        $code = 'claim';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Claim::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'claim_no' => [
                'required',
                'string',
                Rule::unique('claims', 'claim_no')->whereNull('deleted_at')
            ],
            'quotation_id' => [
                'nullable',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'issue_date' => 'date',
            'claim_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->copyClaim($credentials);
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
        $result = $this->claimService->getClaimById($claimId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/claims/claim-progress",
     *     tags={"Claims"},
     *     summary="get claim progress",
     *     description="get claim progress",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="quotation_section_id",
     *          in="query",
     *          description="ID of the product",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="product_id",
     *          in="query",
     *          description="ID of the product",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="other_fee_id",
     *          in="query",
     *          description="ID of the other fee",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getClaimProgress(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_section_id' => 'required|numeric',
            'product_id' => 'numeric',
            'other_fee_id' => 'numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $result = $this->claimService->getClaimProgress($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/claims/{claimId}/detail/quotations",
     *     tags={"Claims"},
     *     summary="Get quotation sections, product of claim",
     *     description="Get quotation sections, product of claim",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="claimId",
     *          in="path",
     *          description="get products and quotation section by quotation",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getClaimByQuotationId($claimId)
    {
        $result = $this->claimService->getClaimByQuotationId($claimId);
        $result['claim_previous'] = getPreviousClaims($result);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result
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
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *                 @OA\Property(property="payment_received_date", type="string", example="2023/09/20", description="Y/m/d"),
     *                 @OA\Property(property="actual_paid_amount", type="number", example="12000"),
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
        $code = 'claim';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Claim::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required|numeric',
            'claim_no' => [
                'required',
                'string',
                Rule::unique('claims', 'claim_no')->ignore($credentials['claim_id'])->whereNull('deleted_at')
            ],
            'quotation_id' => [
                'required',
                'numeric',
                Rule::exists('quotations', 'id')
            ],
            'issue_date' => 'nullable|date',
            'payment_received_date' => 'nullable|date',
            'actual_paid_amount' => 'nullable|numeric',
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
     * @OA\Post(
     *     path="/admin/claims/update-tax",
     *     tags={"Claims"},
     *     summary="Update tax of claim",
     *     description="Update tax of claim",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="claim_id", type="number"),
     *                 @OA\Property(property="gst_rates", type="number"),
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
    public function updateTax(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required|numeric',
            'gst_rates' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->claimService->updateTax($credentials);
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
     * @OA\Post(
     *     path="/admin/claims/update-claim-progress",
     *     tags={"Claims"},
     *     summary="Update claim",
     *     description="Update claim",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="claim_id", type="number"),
     *                 @OA\Property(property="accumulative_from_claim", type="number"),
     *                 @OA\Property(property="subtotal_from_claim", type="number"),
     *                 @OA\Property(property="claim_progress_id", type="number"),
     *                 @OA\Property(property="quotation_section_id", type="number"),
     *                 @OA\Property(property="product_id", type="number"),
     *                 @OA\Property(property="other_fee_id", type="number"),
     *                 @OA\Property(property="claim_number", type="number"),
     *                 @OA\Property(property="claim_percent", type="number"),
     *                 @OA\Property(property="current_amount", type="number"),
     *                 @OA\Property(property="previous_amount", type="number"),
     *                 @OA\Property(property="accumulative_amount", type="number"),
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
    public function updateClaimProgress(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'claim_id' => 'required|numeric',
            'accumulative_from_claim' => 'required|numeric',
            'subtotal_from_claim' => 'required|numeric',
            'claim_progress_id' => 'required|numeric',
            'quotation_section_id' => 'numeric',
            'product_id' => 'numeric',
            'other_fee_id' => 'numeric',
            'claim_number' => 'string',
            'claim_percent' => 'numeric',
            'current_amount' => 'numeric',
            'previous_amount' => 'numeric',
            'accumulative_amount' => 'numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $claim = $this->claimService->getClaimById($credentials['claim_id']);
        $credentials['tax'] = $claim['claim']->tax;
        if (isset($claim['claim']) && $claim['claim']->is_copied == 1) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.cannot_update')
            ]);
        }
        $result = $this->claimService->updateClaimProgress($credentials);
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
        $code = 'claim';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Claim::class, $code, $mode]);
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
        $code = 'claim';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Claim::class, $code, $mode]);
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
     *     summary="Exports list of Claims",
     *     description="Exports list of Claims.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="claim_ids",
     *          in="query",
     *          description="export for claims",
     *          @OA\Schema(
     *               @OA\Property(property="claim_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="claim_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="claim_ids[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="send_mail",
     *          in="query",
     *          description="Check the authentication of sending mail.",
     *          @OA\Schema(type="number"),
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
        $credentials = $request->all();
        if (isset($credentials['send_mail'])) {
            $code = 'claim';
            $mode = config('role.role_mode.send');
            $this->authorize('send', [Claim::class, $code, $mode]);
        }
        $rule = [
            'claim_ids' => ['required', 'array'],
            'claim_ids.*' => ['required', 'numeric'],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }
        $claimIdsString = implode(',', $credentials['claim_ids']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/claim/' . $claimIdsString,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/claims/total-revenue",
     *     tags={"Claims"},
     *     summary="Filter total revenue Claims",
     *     description="Filter total revenue Claims.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="time",
     *          in="query",
     *          description="this_month, last_month, this_year, last_year",
     *          example="this_month",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getTotalRevenue(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'time' => 'required|in:this_month,last_month,this_year,last_year',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $results = $this->claimService->getTotalRevenue($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/claims/total-amount",
     *     tags={"Claims"},
     *     summary="Filter total amount Claims",
     *     description="Filter total amount Claims.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="time",
     *          in="query",
     *          description="this_month, last_month, this_year, last_year",
     *          example="this_month",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getTotalClaimAmount(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'time' => 'required|in:this_month,last_month,this_year,last_year',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $results = $this->claimService->getTotalClaimAmount($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/claims/total-amount-per-month",
     *     tags={"Claims"},
     *     summary="Filter total amount Claims",
     *     description="Filter total amount Claims.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="time",
     *          in="query",
     *          description="this_year, last_year",
     *          example="this_month",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getTotalClaimAmountPerMonth(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'time' => 'required|in:this_year,last_year',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $results = $this->claimService->getTotalClaimAmountPerMonth($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/claims/update-order-number",
     *     tags={"Claims"},
     *     summary="Update order number of claims.",
     *     description="Update order number of claims.",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="quotation_sections", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="quotation_section_id", type="number", example="2"),
     *                      @OA\Property(property="claim_order_number", type="number", example=2),
     *                  )
     *              ),
     *              @OA\Property(property="products", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="product_id", type="number", example="2"),
     *                      @OA\Property(property="claim_order_number", type="number", example=2),
     *                  )
     *              ),
     *              @OA\Property(property="other_fees", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="other_fee_id", type="number", example="2"),
     *                      @OA\Property(property="claim_order_number", type="number", example=2),
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
            'quotation_sections' => 'array',
            'quotation_sections.*.quotation_section_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['quotation_sections']);
                }),
                'numeric'
            ],
            'quotation_sections.*.claim_order_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['quotation_sections']);
                }),
                'numeric'
            ],
            'products' => 'array',
            'products.*.product_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['products']);
                }),
                'numeric'
            ],
            'products.*.claim_order_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['products']);
                }),
                'numeric'
            ],
            'other_fees' => 'array',
            'other_fees.*.other_fee_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['other_fees']);
                }),
                'numeric'
            ],
            'other_fees.*.claim_order_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['other_fees']);
                }),
                'numeric'
            ],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->claimService->updateOrderNumber($credentials);

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
     * @OA\Get(
     *     path="/admin/claims/export-pdf",
     *     tags={"Claims"},
     *     summary="Claims export PDF",
     *     description="Claims export PDF",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="claim_id", example=13),
     *     )
     * ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportPDF(Request $request)
    {
        if (isset($credentials['send_mail'])) {
            $code = 'claim';
            $mode = config('role.role_mode.send');
            $this->authorize('send', [Claim::class, $code, $mode]);
        }
        $claimId = $request->claim_id;
        $user = Auth::guard('api')->user();
        $activity_logs = [
            'claim_id'        => $claimId,
            'type'         => Activity::TYPE_CLAIM,
            'user_id'      => $user->id,
            'action_type'  => Activity::ACTION_DOWNLOADED,
            'created_at'   => Carbon::now(),
        ];
        $this->activityRepository->create($activity_logs);
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-pdf/claim/' . $claimId,
        ]);
    }
}
