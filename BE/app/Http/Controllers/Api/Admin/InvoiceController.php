<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportInvoice;
use App\Http\Controllers\Controller;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceController extends Controller
{
    private $invoiceService;

    public function __construct(
        InvoiceService $invoiceService
    ) {
        $this->invoiceService = $invoiceService;
    }

    /**
     * @OA\Get(
     *     path="/admin/invoices",
     *     tags={"Invoices"},
     *     summary="Get invoices",
     *     description="Get invoices",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with  invoice_no, reference_no, customer_name",
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
    public function getInvoices(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->invoiceService->getInvoices($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/invoices/{invoiceId}/detail",
     *     tags={"Invoices"},
     *     summary="Get detail invoice",
     *     description="Get detail invoice",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="invoiceId",
     *     in="path",
     *     description="ID of the invoice show detail",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation.",
     *     )
     * )
     *
     */
    public function getInvoiceDetail($invoiceId)
    {
        $results = $this->invoiceService->getInvoiceDetail($invoiceId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/invoices/{invoiceId}/bill-schedule",
     *     tags={"Invoices"},
     *     summary="Get bill schedule by invoice",
     *     description="Get bill schedule by invoice",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="invoiceId",
     *     in="path",
     *     description="ID of the invoice show detail",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation.",
     *     )
     * )
     *
     */
    public function getBillScheduleByInvoiceId($invoiceId)
    {
        $results = $this->invoiceService->getBillScheduleByInvoiceId($invoiceId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/invoices/{invoiceId}/bill-schedule/handle",
     *    tags={"Invoices"},
     *     summary="Handle bill schedule",
     *     description="Handle bill schedule",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="invoice_id", type="number", example=1),
     *              @OA\Property(property="total_amount", type="number", example=34815),
     *              @OA\Property(property="create", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="type_invoice_statement", type="string", example="create new"),
     *                      @OA\Property(property="type_percentage", type="number", example=30),
     *                      @OA\Property(property="amount", type="number", example=12000),
     *                      @OA\Property(property="order_number", type="number", example=1),
     *                  )
     *              ),
     *              @OA\Property(property="update", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="string", example="2"),
     *                      @OA\Property(property="type_invoice_statement", type="string", example="create new"),
     *                      @OA\Property(property="type_percentage", type="number", example=30),
     *                      @OA\Property(property="amount", type="number", example=12000),
     *                      @OA\Property(property="order_number", type="number", example=1),
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
    public function handleBillSchedule(Request $request)
    {
        $credentials = $request->all();

        $rule = [
            'invoice_id' =>  [
                'required',
                'numeric',
                Rule::exists('invoices', 'id')
            ],
            'total_amount' =>  ['required', 'numeric'],
            'create' => 'array',
            'create.*.type_invoice_statement' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'string'
            ],
            'create.*.type_percentage' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
            ],
            'create.*.amount' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['create']);
                }),
                'numeric'
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
            'update.*.type_invoice_statement' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'string'
            ],
            'update.*.type_percentage' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
            ],
            'update.*.amount' => [
                Rule::requiredIf(function () use ($credentials) {
                    return !empty($credentials['update']);
                }),
                'numeric'
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

        $results = $this->invoiceService->handleBillSchedule($credentials);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/invoices/{invoiceId}/bill-schedule/update-order-number",
     *    tags={"Invoices"},
     *     summary="Update order bill schedule",
     *     description="Update order bill schedule",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="bill_schedules", type="array",
     *                  @OA\Items(
     *                      @OA\Property(property="id", type="number", example="2"),
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
            'bill_schedules' => 'required|array',
            'bill_schedules.*.id' => [
                'required', 'numeric'
            ],
            'bill_schedules.*.order_number' => [
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

        $result = $this->invoiceService->updateOrderNumber($credentials);

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
     *     path="/admin/invoices/overview",
     *     tags={"Invoices"},
     *     summary="Get invoice overview",
     *     description="Get invoice overview",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="invoice_id", type="number", example=1),
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
    public function getInvoiceOverview(Request $request)
    {
        $invoiceId = $request->invoice_id;
        $results = $this->invoiceService->getInvoiceOverview($invoiceId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/invoices/create",
     *     tags={"Invoices"},
     *     summary="Create new invoice",
     *     description="Create new invoice",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="invoice_no", type="string"),
     *                 @OA\Property(property="quotation_id", type="number"),
     *                 @OA\Property(property="issue_date", type="date"),
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
    public function createInvoice(Request $request)
    {
        $credentials = $request->only([
            'invoice_no',
            'quotation_id'
        ]);

        $rule = [
            'invoice_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('invoices','invoice_no')
            ],
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->invoiceService->createInvoice($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_invoice_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_invoice_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/invoices/update",
     *     tags={"Invoices"},
     *     summary="Update invoices",
     *     description="Update invoices",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="invoice_id", type="number"),
     *                 @OA\Property(property="invoice_no", type="string"),
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
    public function updateInvoice(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'invoice_id' => 'required|numeric',
            'invoice_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('invoices','invoice_no')->ignore($credentials['invoice_id'])
            ],
            'quotation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->invoiceService->updateInvoice($credentials);
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
     *     path="/admin/invoices/delete",
     *     tags={"Invoices"},
     *     summary="Delete invoice",
     *     description="Delete invoice",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="invoice_id", example=1),
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
            'invoice_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->invoiceService->delete($credentials['invoice_id']);
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
     *     path="/admin/invoices/multi-delete",
     *     tags={"Invoices"},
     *     summary="Multiple delete invoice",
     *     description="Multiple Delete Invoice",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="invoice_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteInvoice(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'invoice_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->invoiceService->multiDeleteInvoice($credentials['invoice_id']);
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
     *     path="/admin/invoices/export",
     *     tags={"Invoices"},
     *     summary="Export list of Invoices",
     *     description="Export list of Invoices",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with reference_no, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
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
    public function exportInvoices(Request $request)
    {
        $searchs = $request->all();
        return Excel::download(new ExportInvoice($searchs), 'invoices.csv', ExcelExcel::CSV);
    }
}
