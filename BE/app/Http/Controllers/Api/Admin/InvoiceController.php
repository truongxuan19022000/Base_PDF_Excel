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
     *                 @OA\Property(property="customer_id", type="number"),
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
            'quotation_id',
            'customer_id'
        ]);

        $rule = [
            'invoice_no' => [
                'required',
                'string',
                'max:100',
                Rule::unique('invoices','invoice_no')
            ],
            'quotation_id' => 'required|numeric',
            'customer_id' => 'required|numeric',
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
     *                 @OA\Property(property="customer_id", type="number"),
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
            'customer_id' => 'required|numeric',
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
