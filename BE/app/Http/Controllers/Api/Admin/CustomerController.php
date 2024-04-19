<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    private $customerService;

    public function __construct(CustomerService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * @OA\Get(
     *     path="/admin/customers",
     *     tags={"Customers"},
     *     summary="Get a list of Customers",
     *     description="Get a list of all registered Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with name, phone_number, email",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getCustomers(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->customerService->getCustomers($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/new/count",
     *     tags={"Customers"},
     *     summary="Get new Customers",
     *     description="Get new Customers.",
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
    public function getTotalNewCustomers(Request $request)
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

        $results = $this->customerService->getTotalNewCustomers($credentials['time']);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/all",
     *     tags={"Customers"},
     *     summary="Get a list of Customers",
     *     description="Get a list of all registered Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function getCustomersForQuotations()
    {
        $results = $this->customerService->getCustomersForQuotations();
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/customers/create",
     *     tags={"Customers"},
     *     summary="Create new customer",
     *     description="Create new customer",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="phone_number", type="number"),
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
    public function createCustomer(Request $request)
    {
        $code = 'customer';
        $mode = config('role.role_mode.create');
        $this->authorize('create', [Customer::class, $code, $mode]);
        $customer = $request->only([
            'name',
            'phone_number',
            'email',
            'address_1',
            'address_2',
            'postal_code',
            'company_name',
        ]);

        $rule = [
            'name' => 'required|string|max:100',
            'phone_number' => [
                'required',
                'numeric',
                Rule::unique('customers', 'phone_number')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                })
            ],
            'email' => 'required|email|string|max:255',
            'address_1' => 'required|max:255',
            'address_2' => 'nullable|max:255',
            'postal_code' => 'required|max:50',
            'company_name' => 'nullable|max:255',
        ];

        $validator = Validator::make($customer, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $mailExistedMessage = [];
        $checkEmailExists = $this->customerService->checkEmailExists($customer['email']);
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

        $result = $this->customerService->createCustomer($customer);
        if (!$result['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => trans('message.create_customer_failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.create_customer_success'),
            'data' => $result['data']
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/detail",
     *     tags={"Customers"},
     *     summary="Get detail customer",
     *     description="Get detail customer",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="customerId",
     *     in="path",
     *     description="ID of the customer show detail",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="per_page",
     *          in="query",
     *          description="edit quantity of list activities",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function getCustomerDetail(Request $request, $customerId)
    {
        $searchParams = $request->all();
        $per_page = $searchParams['per_page'] ?? config('common.paginate');
        $results = $this->customerService->getCustomerDetail($customerId, $searchParams, $per_page);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/edit",
     *     tags={"Customers"},
     *     summary="Edit customer",
     *     description="Edit customer",
     *     security={{"bearer":{}}},
     * @OA\Parameter(
     *     name="customerId",
     *     in="path",
     *     description="ID of the customer to edit",
     *     @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($customerId)
    {
        $customer = $this->customerService->getCustomerById($customerId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $customer
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/customers/update",
     *     tags={"Customers"},
     *     summary="Update Customer",
     *     description="Update Customer",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *          @OA\JsonContent(
     *              @OA\Property(property="customer_id"),
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="phone_number", type="number"),
     *              @OA\Property(property="email", type="string", format="email"),
     *              @OA\Property(property="address_1", type="string"),
     *              @OA\Property(property="address_2", type="string"),
     *              @OA\Property(property="postal_code", type="string"),
     *              @OA\Property(property="company_name", type="string")
     *          )
     *      ),
     * @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function updateCustomer(Request $request)
    {
        $code = 'customer';
        $mode = config('role.role_mode.update');
        $this->authorize('update', [Customer::class, $code, $mode]);
        $customer = $request->only([
            'customer_id',
            'name',
            'phone_number',
            'email',
            'address_1',
            'address_2',
            'postal_code',
            'company_name',
        ]);

        $rule = [
            'customer_id' => 'required',
            'name' => 'required|string|max:100',
            'phone_number' => [
                'required',
                'numeric',
                Rule::unique('customers', 'phone_number')->where(function ($query) use ($customer) {
                    return $query->where('id', '!=', $customer['customer_id'])->whereNull('deleted_at');
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
                Rule::unique('customers', 'email')->where(function ($query) use ($customer) {
                    return $query->where('id', '!=', $customer['customer_id'])->whereNull('deleted_at');
                })
            ]
        ];

        $validator = Validator::make($customer, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->customerService->updateCustomer($customer);
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
     *     path="/admin/customers/delete",
     *     tags={"Customers"},
     *     summary="Delete customer",
     *     description="Delete Customer",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *     @OA\JsonContent(
     *         @OA\Property(property="customer_id", example=1),
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
        $code = 'customer';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Customer::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'customer_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->customerService->delete($credentials['customer_id']);
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
     *     path="/admin/customers/multi-delete",
     *     tags={"Customers"},
     *     summary="Multiple delete customer",
     *     description="Multiple Delete Customer",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="customer_id", type="array", @OA\Items(type="number"), example="1"),
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
    public function multiDeleteCustomer(Request $request)
    {
        $code = 'customer';
        $mode = config('role.role_mode.delete');
        $this->authorize('delete', [Customer::class, $code, $mode]);
        $credentials = $request->all();
        $rule = [
            'customer_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->customerService->multiDeleteCustomer($credentials['customer_id']);
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
     *     path="/admin/customers/export",
     *     tags={"Customers"},
     *     summary="Exports list of Customers",
     *     description="Exports list of Customers.",
     *     security={{"bearer":{}}},
     *    @OA\Parameter(
     *          name="customer_ids",
     *          in="query",
     *          @OA\Schema(
     *               @OA\Property(property="customer_ids[0]", type="array", @OA\Items(type="number"), example="1"),
     *               @OA\Property(property="customer_ids[1]", type="array", @OA\Items(type="number"), example="2"),
     *          )
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful operation",
     *     )
     * )
     *
     */
    public function exportCustomers(Request $request)
    {
        $credentials = $request->all();
        $customerIdsString = isset($credentials['customer_ids']) ? implode(',', $credentials['customer_ids']) : 'all';
        return response()->json([
            'status' => config('common.response_status.success'),
            'url' => env('APP_URL') . '/export-csv/customer/' . $customerIdsString,
        ]);
    }
    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/detail/quotations",
     *     tags={"Customers"},
     *     summary="Get a list of Quotations By Customers",
     *     description="Get a list of Quotations By Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="customerId",
     *          in="path",
     *          description="ID of the quotation to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with reference_no",
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
    public function getQuotationsByCustomer(Request $request, $customerId)
    {
        $searchParams = $request->all();
        $results = $this->customerService->getQuotationsByCustomer($searchParams, $customerId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/detail/documents",
     *     tags={"Customers"},
     *     summary="Get a list of Documents By Customers",
     *     description="Get a list of Documents By Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="customerId",
     *          in="path",
     *          description="ID of the documents to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with document_name",
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
    public function getDocumentsByCustomer(Request $request, $customerId)
    {
        $searchParams = $request->all();
        $results = $this->customerService->getDocumentsByCustomer($searchParams, $customerId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/detail/invoices",
     *     tags={"Customers"},
     *     summary="Get a list of invoices By Customers",
     *     description="Get a list of invoices By Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="customerId",
     *          in="path",
     *          description="ID of the invoices to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with reference_no",
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
    public function getInvoicesByCustomer(Request $request, $customerId)
    {
        $searchParams = $request->all();
        $results = $this->customerService->getInvoicesByCustomer($searchParams, $customerId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/customers/{customerId}/detail/claims",
     *     tags={"Customers"},
     *     summary="Get a list of claims By Customers",
     *     description="Get a list of claims By Customers.",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="customerId",
     *          in="path",
     *          description="ID of the claims to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="Search with reference_no, claim_no",
     *          @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *          name="status",
     *          in="query",
     *          description="",
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
    public function getClaimsByCustomer(Request $request, $customerId)
    {
        $searchParams = $request->all();
        $results = $this->customerService->getClaimsByCustomer($searchParams, $customerId);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }
}
