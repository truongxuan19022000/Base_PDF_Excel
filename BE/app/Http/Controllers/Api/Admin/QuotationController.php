<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Quotation;
use App\Models\User;
use App\Repositories\ActivityRepository;
use App\Services\QuotationService;
use App\Services\QuotationSectionService;
use App\Services\QuotationNoteService;
use App\Services\OtherFeeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class QuotationController extends Controller
{
    private $quotationService;

    private $quotationSectionService;

    private $quotationNoteService;

    private $otherFeeService;
    /**
     * @var ActivityRepository
     */
    private $activityRepository;

    public function __construct(
        QuotationService $quotationService,
        QuotationSectionService $quotationSectionService,
        QuotationNoteService $quotationNoteService,
        OtherFeeService $otherFeeService,
        ActivityRepository $activityRepository
    ) {
        $this->quotationService = $quotationService;
        $this->quotationSectionService = $quotationSectionService;
        $this->quotationNoteService = $quotationNoteService;
        $this->otherFeeService = $otherFeeService;
        $this->activityRepository = $activityRepository;
    }

    /**
     * @OA\Get(
     *     path="/admin/quotations",
     *     tags={"Quotations"},
     *     summary="Get list quotation",
     *     description="Get list quotation.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with reference_no, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="1: Draft, 2: Pending Approval, 3: Approved, 4: Rejected, 5: Cancelled",
     *          @OA\Schema(
     *               @OA\Property(property="status[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="status[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="status[2]", type="array", @OA\Items(type="number"), example="3"),
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
    public function getQuotations(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->quotationService->getQuotations($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/quotations/all",
     *     tags={"Quotations"},
     *     summary="Get list quotation",
     *     description="Get list quotation.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="1: Draft, 2: Pending Approval, 3: Approved, 4: Rejected, 5: Cancelled",
     *          @OA\Schema(
     *               @OA\Property(property="status[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="status[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="status[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getAllQuotationsForInvoices(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->quotationService->getAllQuotationsForInvoices($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotations/create",
     *     tags={"Quotations"},
     *     summary="Create quotation",
     *     description="Create quotation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="reference_no", type="string"),
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *                 @OA\Property(property="valid_till", type="string", example="2023/12/12", description="Y/m/d"),
     *                 @OA\Property(property="terms_of_payment_confirmation", type="number", example="30"),
     *                 @OA\Property(property="terms_of_payment_balance", type="number", example="70"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="phone_number", type="number"),
     *                 @OA\Property(property="email", type="string", format="email"),
     *                 @OA\Property(property="address_1", type="string"),
     *                 @OA\Property(property="address_2", type="string"),
     *                 @OA\Property(property="postal_code", type="string"),
     *                 @OA\Property(property="company_name", type="string"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="quotation_description", type="string")
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
    public function createQuotation(Request $request)
    {
        $code = 'quotation';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Quotation::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'reference_no' => [
                'required',
                'string',
                Rule::unique('quotations', 'reference_no')->whereNull('deleted_at')
            ],
            'customer_id' => [
                'nullable',
                'numeric',
                Rule::exists('customers', 'id')
            ],
            'issue_date' => 'required|date',
            'valid_till' => 'required|date|after:issue_date',
            'terms_of_payment_confirmation' => 'required|numeric',
            'terms_of_payment_balance' => 'required|numeric',
            'description' => 'nullable|string',
            'quotation_description' => 'nullable|string',
        ];

        if (!isset($credentials['customer_id'])) {
            $rule['name'] = [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ];
            $rule['email'] = [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ];
            $rule['address_1'] = [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ];
            $rule['address_2'] = [
                'nullable',
                'string',
                'max:255',
            ];
            $rule['postal_code'] = [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ];
            $rule['company_name'] = [
                'nullable',
                'string',
                'max:255',
            ];
            $rule['phone_number'] = [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
                Rule::unique('customers', 'phone_number')->where(function ($query) use ($credentials) {
                    return $query->whereNull('deleted_at');
                }),
                'nullable',
                'numeric',
            ];
        }

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationService->createQuotation($credentials);
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
     * @OA\Get(
     *     path="/admin/quotations/{quotationId}/detail",
     *     tags={"Quotations"},
     *     summary="Edit quotation",
     *     description="Edit quotation",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="quotationId",
     *          in="path",
     *          description="ID of the quotation to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getQuotationDetail($quotationId)
    {
        $customer = $this->quotationService->getQuotationById($quotationId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $customer
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotations/update",
     *     tags={"Quotations"},
     *     summary="Update quotation",
     *     description="Update quotation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="reference_no", type="string"),
     *                 @OA\Property(property="status", type="number", description="1: draft, 2: pending_approval, 3: approved, 4: rejected, 5: cancelled"),
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *                 @OA\Property(property="valid_till", type="string", example="2023/12/12", description="Y/m/d"),
     *                 @OA\Property(property="terms_of_payment_confirmation", type="number", example="30"),
     *                 @OA\Property(property="terms_of_payment_balance", type="number", example="70"),
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="quotation_description", type="string")
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
    public function updateQuotation(Request $request)
    {
        $code = 'quotation';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Quotation::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
            'reference_no' => [
                'required',
                'string',
                Rule::unique('quotations', 'reference_no')->ignore($credentials['quotation_id'])->whereNull('deleted_at')
            ],
            'status' => 'required|numeric|in:1,2,3,4,5',
            'customer_id' => [
                'required',
                'numeric',
                Rule::exists('customers', 'id')
            ],
            'issue_date' => 'required|date',
            'valid_till' => 'required|date|after:issue_date',
            'terms_of_payment_confirmation' => 'required|numeric',
            'terms_of_payment_balance' => 'required|numeric',
            'description' => 'nullable|string',
            'quotation_description' => 'nullable|string',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->quotationService->updateQuotation($credentials);
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
     *     path="/admin/quotations/approve",
     *     tags={"Quotations"},
     *     summary="Update approve quotation",
     *     description="Update approve quotation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="status", type="number", description="3: approved, 4: rejected, 5: cancel"),
     *                 @OA\Property(property="reject_reason", type="string"),
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
    public function approveQuotation(Request $request)
    {
        $code = 'user_management';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [User::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
            'status' => 'required|numeric|in:3,4,5',
            'reject_reason' => 'string',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->quotationService->updateApproveQuotation($credentials);
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
     *     path="/admin/quotations/send-approve",
     *     tags={"Quotations"},
     *     summary="Update approve quotation",
     *     description="Update approve quotation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
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
    public function sendApproveQuotation(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->quotationService->updateStatusQuotation($credentials);
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
     *     path="/admin/quotations/overview",
     *     tags={"Quotations"},
     *     summary="Get quotation overview",
     *     description="Get quotation overview",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number", example=1),
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
    public function getQuotationOverview(Request $request)
    {
        $quotationId = $request->quotation_id;
        $results = $this->quotationService->getQuotationOverview($quotationId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/quotations/delete",
     *     tags={"Quotations"},
     *     summary="Delete quotation",
     *     description="Delete Quotation",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="quotation_id", example=1),
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
        $code = 'quotation';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Quotation::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationService->delete($credentials['quotation_id']);
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
     *     path="/admin/quotations/multi-delete",
     *     tags={"Quotations"},
     *     summary="Multiple delete quotation",
     *     description="Multiple Delete Quotations",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteQuotation(Request $request)
    {
        $code = 'quotation';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Quotation::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationService->multiDeleteQuotation($credentials['quotation_id']);
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
     *     path="/admin/quotations/export",
     *     tags={"Quotations"},
     *     summary="Exports list of Quotations",
     *     description="Exports list of Quotations.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="quotation_ids",
     *          in="query",
     *          description="multi download csv",
     *          @OA\Schema(
     *               @OA\Property(property="quotation_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="quotation_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="quotation_ids[2]", type="array", @OA\Items(type="number"), example="3"),
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
    public function exportQuotations(Request $request)
    {
        $credentials = $request->all();
        if (isset($credentials['send_mail'])) {
            $code = 'quotation';
            $mode = config('role.role_mode.send');
            $this->authorize('send', [Quotation::class, $code, $mode]);
        }
        $rule = [
            'quotation_ids' => ['required', 'array'],
            'quotation_ids.*' => ['required', 'numeric'],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $quotationIdsString = implode(',', $credentials['quotation_ids']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/quotation/' . $quotationIdsString,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/quotations/estimated-revenue",
     *     tags={"Quotations"},
     *     summary="Filter estimated-revenue Quotations",
     *     description="Filter estimated revenue Quotations.",
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
    public function estimatedRevenue(Request $request)
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

        $results = $this->quotationService->getEstimatedRevenue($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/quotations/total-amount",
     *     tags={"Quotations"},
     *     summary="Filter total amount Quotations",
     *     description="Filter total amount Quotations.",
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
    public function getTotalQuotationAmount(Request $request)
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

        $results = $this->quotationService->getTotalQuotationAmount($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/quotations/update-discount",
     *     tags={"Quotations"},
     *     summary="Update discount of quotation",
     *     description="Update discount of quotation.",
     *     security={{"bearer":{}}},
     *      @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="discount_amount", type="number", example="123000"),
     *                 @OA\Property(property="grand_total", type="number", example="123000"),
     *                 @OA\Property(property="discount_type", type="number", example="1", description="1: Percentage, 2:Amount"),
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function updateDiscount(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
            'discount_amount' => 'required|numeric',
            'grand_total' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->quotationService->updateDiscount($credentials);
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
     * @OA\Get(
     *     path="/admin/quotations/export-pdf",
     *     tags={"Quotations"},
     *     summary="Exports list of Quotations",
     *     description="Exports list of Quotations.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="quotation_ids",
     *          in="query",
     *          description="multi download csv",
     *          @OA\Schema(
     *               @OA\Property(property="quotation_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="quotation_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="quotation_ids[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
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
            $code = 'quotation';
            $mode = config('role.role_mode.send');
            $this->authorize('send', [Quotation::class, $code, $mode]);
        }
        $credentials = $request->all();
        $rule = [
            'quotation_ids' => ['required', 'array'],
            'quotation_ids.*' => ['required', 'numeric'],
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $user = Auth::guard('api')->user();
        foreach ($credentials['quotation_ids'] as $quotation_id) {
            $activity_logs = [
                'quotation_id' => $quotation_id,
                'type'         => Activity::TYPE_QUOTATION,
                'user_id'      => $user->id,
                'action_type'  => Activity::ACTION_DOWNLOADED,
                'created_at'   => Carbon::now(),
            ];
        }

        $this->activityRepository->create($activity_logs);
        $quotationIdsString = implode(',', $credentials['quotation_ids']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-pdf/quotation/' . $quotationIdsString,
        ]);
    }
}
