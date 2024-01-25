<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\ExportDocument;
use App\Http\Controllers\Controller;
use App\Services\DocumentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Excel as ExcelExcel;
use Maatwebsite\Excel\Facades\Excel;

class DocumentController extends Controller
{
    private $documentService;

    public function __construct(
        DocumentService $documentService
    ) {
        $this->documentService = $documentService;
    }

    /**
     * @OA\Get(
     *     path="/admin/documents",
     *     tags={"Documents"},
     *     summary="Get documents",
     *     description="Get documents",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with document_name, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="type",
     *          in="query",
     *          description="file type: pdf, cad, jpeg, png",
     *          @OA\Schema(
     *               @OA\Property(property="type[0]", type="array", @OA\Items(type="string"), example="pdf"),
     *               @OA\Property(property="type[1]", type="array", @OA\Items(type="string"), example="cad"),
     *               @OA\Property(property="type[2]", type="array", @OA\Items(type="string"), example="jpeg"),
     *               @OA\Property(property="type[3]", type="array", @OA\Items(type="string"), example="png"),
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
    public function getDocuments(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->documentService->getDocuments($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/documents/create",
     *     tags={"Documents"},
     *     summary="Create new document",
     *     description="Create new document",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="customer_id", type="number"),
     *                 @OA\Property(property="document", type="file", format="file"),
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
    public function createDocument(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'customer_id' => 'required|numeric',
            'document' => 'required|file|max:20480',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };
        $credentials['document_name'] =  pathinfo($credentials['document']->getClientOriginalName(), PATHINFO_FILENAME);
        $credentials['file_type']     =  pathinfo($credentials['document']->getClientOriginalName(), PATHINFO_EXTENSION);

        $baseUrl = 'documents';
        $documentUrl = uploadToLocalStorage($credentials['document'], $baseUrl);
        if (!$documentUrl) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.upload_document_failed')
            ]);
        }
        $credentials['file'] = $documentUrl;
        unset($credentials['document']);

        $result = $this->documentService->createDocument($credentials);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.upload_document_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.upload_document_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/documents/detail",
     *     tags={"Documents"},
     *     summary="Get document detail",
     *     description="Get document detail",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="document_id", example=1),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getDocumentDetail(Request $request)
    {
        $documentId = $request->document_id;
        $results = $this->documentService->getdocumentDetail($documentId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/admin/documents/delete",
     *     tags={"Documents"},
     *     summary="Delete document",
     *     description="Delete document",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="document_id", example=1),
     *          )
     *      ),
     *     @OA\Response(
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
            'document_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->documentService->delete($credentials['document_id']);
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
     *     path="/admin/documents/multi-delete",
     *     tags={"Documents"},
     *     summary="Multiple delete document",
     *     description="Multiple Delete document",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="document_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteDocument(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'document_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->documentService->multiDeleteDocument($credentials['document_id']);
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
     *     path="/admin/documents/export",
     *     tags={"Documents"},
     *     summary="Export list of documents",
     *     description="Export list of documents",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with document_name, customer_name",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="type",
     *          in="query",
     *          description="file type: pdf, cad, jpeg, png",
     *          @OA\Schema(
     *               @OA\Property(property="type[0]", type="array", @OA\Items(type="string"), example="pdf"),
     *               @OA\Property(property="type[1]", type="array", @OA\Items(type="string"), example="cad"),
     *               @OA\Property(property="type[2]", type="array", @OA\Items(type="string"), example="jpeg"),
     *               @OA\Property(property="type[3]", type="array", @OA\Items(type="string"), example="png"),
     *          )
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
    public function exportDocuments(Request $request)
    {
        $searchs = $request->all();
        return Excel::download(new ExportDocument($searchs), 'documents.csv', ExcelExcel::CSV);
    }
}
