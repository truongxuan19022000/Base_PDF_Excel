<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\ConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ConversationController extends Controller
{
    private $conversationService;

    public function __construct(ConversationService $conversationService)
    {
        $this->conversationService = $conversationService;
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/conversations",
     *     tags={"Messages"},
     *     summary="Get a list of conversations",
     *     description="Get a list of conversations",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getConversations(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->conversationService->getConversations($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/conversations/unread-message",
     *     tags={"Messages"},
     *     summary="Get a list unread  message of conversations",
     *     description="Get a list unread  message of conversations",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getUnreadConversations(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->conversationService->getUnreadConversations($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/conversations/search",
     *     tags={"Messages"},
     *     summary="Search conversations",
     *     description="Search conversations",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="optional - Search with name or phone number of customer",
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
    public function searchConversations(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->conversationService->searchConversations($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/conversations/latest-unread-message",
     *     tags={"Messages"},
     *     summary="Get a list unread  message of conversations",
     *     description="Get a list unread  message of conversations",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="search",
     *          in="query",
     *          description="status",
     *          @OA\Schema(type="string"),
     *     ),
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getLatestUnreadMessage(Request $request)
    {
        $searchParams = $request->all();
        $results = $this->conversationService->getLatestUnreadMessage($searchParams);
        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $results,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/whatsapp/conversations/clean",
     *     tags={"Messages"},
     *     summary="Clean a conversation",
     *     description="Clean a conversation",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="conversation_id", type="number", example="1"),
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
    public function cleanConversation(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'conversation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };
        $this->conversationService->cleanConversation($credentials['conversation_id']);

        return response()->json([
            'status' => config('common.response_status.success'),
            'message' => trans('message.clean_success')
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/whatsapp/conversations/pin",
     *     tags={"Messages"},
     *     summary="Pin or Unpin the conversation",
     *     description="Pin or Unpin the conversation",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="conversation_id", type="number", example="1"),
     *                 @OA\Property(property="is_pinned", type="number", description="1:pin, 0:Unpin", example="1")
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

    public function pinConversation(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'conversation_id' => 'required|numeric',
            'is_pinned' => 'required|numeric|in:0,1',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $result = $this->conversationService->update($credentials);
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
     *     path="/admin/whatsapp/conversations/delete",
     *     tags={"Messages"},
     *     summary="Delete a conversation",
     *     description="Delete a conversation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                  @OA\Property(property="conversation_id", type="number", example="1"),
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
    public function delete(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'conversation_id' => 'required|numeric',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->conversationService->delete($credentials['conversation_id']);
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
