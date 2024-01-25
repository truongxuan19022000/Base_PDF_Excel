<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportQuotation;
use App\Http\Controllers\Controller;
use App\Services\QuotationService;
use App\Services\QuotationSectionService;
use App\Services\QuotationNoteService;
use App\Services\OtherFeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class QuotationController extends Controller
{
    private $quotationService;

    private $quotationSectionService;

    private $quotationNoteService;

    private $otherFeeService;

    public function __construct(
        QuotationService $quotationService,
        QuotationSectionService $quotationSectionService,
        QuotationNoteService $quotationNoteService,
        OtherFeeService $otherFeeService
    ) {
        $this->quotationService = $quotationService;
        $this->quotationSectionService = $quotationSectionService;
        $this->quotationNoteService = $quotationNoteService;
        $this->otherFeeService = $otherFeeService;
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
     *          description="Unpaid: 1, Partial Payment: 2, Paid: 3",
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
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getAllQuotationsForInvoices()
    {
        $conditions['status'] = config('quotation.status.unpaid');
        $results = $this->quotationService->getAllQuotationsForInvoices($conditions);
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
     *                 @OA\Property(property="description", type="string")
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
        $credentials = $request->all();
        $rule = [
            'reference_no' => [
                'required',
                'string',
                Rule::unique('quotations', 'reference_no')
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
            'name' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ],
            'phone_number' => [
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
                Rule::unique('customers', 'phone_number')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                }),
                'nullable',
                'numeric',
            ],
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ],
            'address_1' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ],
            'address_2' => [
                'nullable',
                'string',
                'max:255',
            ],
            'postal_code' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(function () use ($credentials) {
                    return empty($credentials['customer_id']);
                }),
            ],
            'company_name' => [
                'nullable',
                'string',
                'max:255',
            ],

        ];

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
     *                 @OA\Property(property="payment_status", type="number", description="1: unpaid, 2: partial_payment, 3: paid, 4: rejected, 5: cancelled"),
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="issue_date", type="string", example="2023/09/20", description="Y/m/d"),
     *                 @OA\Property(property="valid_till", type="string", example="2023/12/12", description="Y/m/d"),
     *                 @OA\Property(property="terms_of_payment_confirmation", type="number", example="30"),
     *                 @OA\Property(property="terms_of_payment_balance", type="number", example="70"),
     *                 @OA\Property(property="description", type="string")
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
        $credentials = $request->all();
        $rule = [
            'quotation_id' => 'required|numeric',
            'reference_no' => [
                'required',
                'string',
                Rule::unique('quotations', 'reference_no')->ignore($credentials['quotation_id'])
            ],
            'payment_status' => 'required|numeric|in:1,2,3,4,5',
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
     *     summary="Export list of Quotations",
     *     description="Export list of Quotations.",
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
     *          description="Unpaid: 1, Partial Payment: 2, Paid: 3",
     *          @OA\Schema(
     *               @OA\Property(property="status[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="status[1]", type="array", @OA\Items(type="number"), example="2"),
     *               @OA\Property(property="status[2]", type="array", @OA\Items(type="number"), example="3"),
     *          )
     *     ),
     *      @OA\Parameter(
     *          name="customer_id",
     *          in="query",
     *          description="number",
     *          @OA\Schema(type="number"),
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
    public function exportQuotations(Request $request)
    {
        $searchs = $request->all();
        return Excel::download(new ExportQuotation($searchs), 'quotations.csv', ExcelExcel::CSV);
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
            'discount_amount' => 'nullable|numeric',
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
     * @OA\Post(
     *     path="/admin/quotations/export-pdf",
     *     tags={"Quotations"},
     *     summary="Quotations export PDF",
     *     description="Quotations export PDF",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="quotation_id", example=13),
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
        $quotationId = $request->quotation_id;
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/quotation/export-pdf/' . $quotationId,
        ]);
    }
}
