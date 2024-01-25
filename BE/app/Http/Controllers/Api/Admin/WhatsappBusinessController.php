<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\WhatsappBusinessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class WhatsappBusinessController extends Controller
{
    private $whatsappBusinessService;

    public function __construct(WhatsappBusinessService $whatsappBusinessService)
    {
        $this->whatsappBusinessService = $whatsappBusinessService;
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/business-accounts",
     *     tags={"Whatsapp Business"},
     *     summary="Get a list of business accounts",
     *     description="Get a list of business accounts",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="optional - Search with name or phone number of business accounts",
     *          @OA\Schema(type="string"),
     *     ),
     *
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getListWhatsappBusiness(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->whatsappBusinessService->getListWhatsappBusiness($searchParams);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }


    /**
     * @OA\Post(
     *     path="/admin/whatsapp/business-accounts/create",
     *     tags={"Whatsapp Business"},
     *     summary="Create new Whatsapp Business account",
     *     description="Create new Whatsapp Business account",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="account_name", type="string"),
     *                 @OA\Property(property="whatsapp_business_account_id", type="number"),
     *                 @OA\Property(property="phone_number", type="string", format="string", description="Phone numbers include the area code without the plus sign. Example: 84345609978"),
     *                 @OA\Property(property="phone_number_id", type="number"),
     *                 @OA\Property(property="graph_version", type="string", example="v17.0", description="Example: v17.0, v18.0"),
     *                 @OA\Property(property="access_token", type="string")
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
    public function createWhatsappBusiness(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'account_name' => 'required|string',
            'whatsapp_business_account_id' => 'required|numeric',
            'phone_number' => 'required|string',
            'phone_number_id' => 'required|numeric',
            'graph_version' => 'required|string',
            'access_token' => 'required|string',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->whatsappBusinessService->createWhatsappBusiness($credentials);
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
     *     path="/admin/whatsapp/business-accounts/{businessId}/edit",
     *     tags={"Whatsapp Business"},
     *     summary="Edit Whatsapp Business account",
     *     description="Edit Whatsapp Business account",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="businessId",
     *          in="path",
     *          description="ID of the Whatsapp Business account to edit",
     *          @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful.",
     *     )
     * )
     *
     */
    public function edit($businessId)
    {
        $whatsappBusiness = $this->whatsappBusinessService->getWhatsappBusinessDetail($businessId);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $whatsappBusiness
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/whatsapp/business-accounts/update",
     *     tags={"Whatsapp Business"},
     *     summary="Update Whatsapp Business account",
     *     description="Update Whatsapp Business account",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="whatsapp_business_id", type="number"),
     *                 @OA\Property(property="account_name", type="string"),
     *                 @OA\Property(property="whatsapp_business_account_id", type="number"),
     *                 @OA\Property(property="phone_number", type="string", format="string", description="Phone numbers include the area code without the plus sign. Example: 84345609978"),
     *                 @OA\Property(property="phone_number_id", type="number"),
     *                 @OA\Property(property="graph_version", type="string", example="v17.0", description="Example: v17.0, v18.0"),
     *                 @OA\Property(property="access_token", type="string")
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
    public function updateWhatsappBusiness(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'whatsapp_business_id' => 'required|numeric',
            'account_name' => 'required|string',
            'whatsapp_business_account_id' => 'required|numeric',
            'phone_number' => 'required|string',
            'phone_number_id' => 'required|numeric',
            'graph_version' => 'required|string',
            'access_token' => 'required|string',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->whatsappBusinessService->updateWhatsappBusiness($credentials);
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

    public function switchStatusWhatsappBusiness(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'whatsapp_business_id' => 'required|numeric',
            'status' => 'required|numeric|in:0,1',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        if ($credentials['status'] == 1) {
            $waBusinessStatusOn = $this->whatsappBusinessService->getWhatsappBusinessSendMessage();
            if (!empty($waBusinessStatusOn) && ($waBusinessStatusOn->id != $credentials['whatsapp_business_id'])) {
                return response()->json([
                    'status' => config('common.response_status.failed'),
                    'message' => [
                        'status' => [
                            trans('message.one_wa_business')
                        ]
                    ]
                ]);
            }
        }

        $result = $this->whatsappBusinessService->switchStatusWhatsappBusiness($credentials);
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
     *     path="/admin/whatsapp/business-accounts/delete",
     *     tags={"Whatsapp Business"},
     *     summary="Delete Whatsapp Business account",
     *     description="Delete Whatsapp Business account",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *          @OA\JsonContent(
     *               @OA\Property(property="business_id", example=1),
     *          )
     *     ),
     *     @OA\Response(
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
            'business_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->whatsappBusinessService->delete($credentials['business_id']);
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
     *     path="/admin/whatsapp/business-accounts/multi-delete",
     *     tags={"Whatsapp Business"},
     *     summary="Multiple delete Whatsapp Business account",
     *     description="Multiple delete Whatsapp Business account",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="business_id", type="array", @OA\Items(type="number")),
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
    public function multiDeleteWhatsappBusiness(Request $request)
    {
        $credentials = $request->all();

        $rule = [
            'business_id' => 'required|array',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->whatsappBusinessService->multiDeleteWhatsappBusiness($credentials['business_id']);
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
}
