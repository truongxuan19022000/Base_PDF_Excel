<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Services\MessageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    private $messageService;

    public function __construct(MessageService $messageService)
    {
        $this->messageService = $messageService;
    }

    public function verifyWebhook(Request $request)
    {
        $verify_token = env('HUB_VERIFY_TOKEN');

        if (isset($request->hub_challenge) && isset($request->hub_verify_token) && $request->hub_verify_token === $verify_token) {
            return response($request->hub_challenge, 200);
        }

        return response([], 403);
    }

    public function handleWebhook(Request $request)
    {
        $rawcontent = $request->getContent();
        $data = json_decode($rawcontent, true);
        $entry = $data['entry'][0];
        $value = $entry['changes'][0]['value'];

        $reply_whatsapp_message_id = NULL;
        $reaction_message_id = NULL;
        $reaction_by_customer = NULL;

        if (isset($value['messages'])) {
            $business_info = $value['metadata'];
            $messages = $value['messages'][0];
            $phone_number = $messages['from'];
            $whatsapp_message_id = $messages['id'];
            $mess_type = $messages['type'];
            if (in_array($mess_type, ['image', 'document', 'video', 'audio', 'sticker'])) {
                $mediaId = $messages[$mess_type]['id'];
                $mediaUrl = $this->messageService->getMediaUrlWhatsAppInLocalStorage($mediaId);
                $messages[$mess_type]['link'] = $mediaUrl;
                unset($messages[$mess_type]['sha256'], $messages[$mess_type]['mime_type']);
            }
            $content = [
                'type'      => $mess_type,
                $mess_type  => $messages[$mess_type],
            ];

            if (isset($messages['context'])) {
                if (isset($messages['context']['forwarded']) && $messages['context']['forwarded'] === true) {
                    $content['forwarded'] = Message::STATUS_TRUE;
                } else {
                    $reply_whatsapp_message_id = $messages['context']['id'];
                }
            }
            if ($mess_type === 'reaction') {
                $reaction_message_id  = $messages[$mess_type]['message_id'];
                $reaction_by_customer = $messages[$mess_type]['emoji'] ?? NULL;
            }
            $credentials = [
                'phone_number'              => '+'.$phone_number,
                'whatsapp_message_id'       => $whatsapp_message_id,
                'reply_whatsapp_message_id' => $reply_whatsapp_message_id,
                'content'                   => $content,
                'reaction_message_id'       => $reaction_message_id,
                'reaction_by_customer'      => $reaction_by_customer,
                'business_phone_number'     => $business_info['display_phone_number'],
                'business_phone_number_id'  => $business_info['phone_number_id']
            ];
            $this->messageService->createMessageByWebHook($credentials);
        }
        if (isset($value['statuses'])) {
            $statuses = $value['statuses'][0];
            $whatsapp_message_id = $statuses['id'];
            $status = $statuses['status'];
            $credentials = [
                'whatsapp_message_id' => $whatsapp_message_id,
                'status'              => $status,
            ];
            $this->messageService->updateMessageStatusByWebHook($credentials);
        }
        return response([], 200);
    }

    /**
     * @OA\Post(
     *     path="/admin/whatsapp/messages/send-message",
     *     tags={"Messages"},
     *     summary="Send message to customer in a conversation",
     *     description="Send message to customer in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="phone_number", type="string", description="customer phone include area code, example: +84373069116"),
     *                 @OA\Property(property="reply_message_id", type="string", description="required if message reply, example: wamid.***"),
     *                 @OA\Property(property="type", type="string", description="required one: text, reaction, image, document, audio, video, sticker, location, contacts, image_video", example="text"),
     *                 @OA\Property(property="message", type="string", description="required if type: text"),
     *                 @OA\Property(property="whatsapp_message_id", type="string", description="required if type: reaction, is whatsapp_message_id to reaction, example: wamid.***"),
     *                 @OA\Property(property="emoji", type="string", description="required if type: reaction, example: 😂😊❤👌✔✌👍, If delete it, leave it blank"),
     *                 @OA\Property(property="image", type="file", format="file", description="required if type: image (jpeg,png,jpg)"),
     *                 @OA\Property(property="document", type="file", format="file", description="required if type: document (txt,pdf,ppt,doc,xls,docx,pptx,xlsx)"),
     *                 @OA\Property(property="audio", type="file", format="file", description="required if type: audio (aac,mp3,mpeg,amr,ogg)"),
     *                 @OA\Property(property="video", type="file", format="file", description="required if type: video (mp4,3gp)"),
     *                 @OA\Property(property="image_video", type="file", format="file", description="required if type: image_video (image:jpeg,png,jpg - video:mp4,3gp)"),
     *                 @OA\Property(property="sticker", type="file", format="file", description="required if type: sticker (webp)"),
     *                 @OA\Property(property="latitude", type="string", description="required if type: location"),
     *                 @OA\Property(property="longitude", type="string", description="required if type: location"),
     *                 @OA\Property(property="contact_name", type="string", description="required if type: contact"),
     *                 @OA\Property(property="contact_phone", type="string", description="required if type: contact"),
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
    public function sendMessage(Request $request)
    {
        $credentials = $request->all();

        if (isset($credentials['image_video'])) {
            $mimeType = $credentials['image_video']->getClientMimeType();
            $type = explode('/', $mimeType)[0];
            $credentials['type'] = $type;
            $credentials[$type] = $credentials['image_video'];
            unset($credentials['image_video']);
        }

        $rule = [
            'phone_number' => [
                'required',
                'string',
                Rule::exists('customers', 'phone_number')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                })
            ],
            'type' => 'required|in:text,reaction,image,document,audio,video,sticker,location,contacts,image_video',
            'message' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'text';
                }),
                'nullable',
                'string'
            ],
            'emoji' => 'nullable|string',
            'whatsapp_message_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'reaction';
                }),
                'nullable',
                'string'
            ],
            'image' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'image';
                }),
                'nullable',
                'image',
                'mimes:jpeg,png,jpg',
                'max:5120'
            ],
            'document' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'document';
                }),
                'nullable',
                'file',
                'mimes:txt,pdf,ppt,doc,xls,docx,pptx,xlsx',
                'max:102400'
            ],
            'video' =>  [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'video';
                }),
                'nullable',
                'file',
                'mimes:mp4,3gp',
                'max:16384'
            ],
            'audio' =>  [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'audio';
                }),
                'nullable',
                'file',
                'mimes:aac,mp3,mpeg,amr,ogg',
                'max:16384'
            ],
            'sticker' =>  [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'sticker';
                }),
                'nullable',
                'file',
                'mimes:webp',
                'max:102400'
            ],
            'latitude' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'location';
                }),
                'nullable',
                'string'
            ],
            'longitude' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'location';
                }),
                'nullable',
                'string'
            ],
            'contact_name' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'contacts';
                }),
                'nullable',
                'string'
            ],
            'contact_phone' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'contacts';
                }),
                'nullable',
                'string'
            ],
            'reply_message_id' => [
                'nullable',
                'string',
                Rule::exists('messages', 'whatsapp_message_id')->where(function ($query) {
                    return $query->where('delete_status', Message::STATUS_FALSE)->where('status', '<>', Message::STATUS_FAIL);
                })
            ],
            'image_video' => [
                Rule::requiredIf(function () use ($credentials) {
                    return $credentials['type'] === 'image_video';
                }),
            ]
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $sendWAM = $this->messageService->sendMessageWhatsApp($credentials);

        if (!$sendWAM['status']) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' =>  $sendWAM['data']
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/admin/whatsapp/messages/delete",
     *     tags={"Messages"},
     *     summary="Delete message in a conversation",
     *     description="Delete message in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(property="message_id", type="number"),
     *                 @OA\Property(property="conversation_id", type="number"),
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
            'message_id' =>  [
                'required',
                'numeric',
                Rule::exists('messages', 'id')
            ],
            'conversation_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->messageService->delete($credentials);
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
     *     path="/admin/whatsapp/messages/multi-delete",
     *     tags={"Messages"},
     *     summary="Multiple delete message in a conversation",
     *     description="Multiple delete message in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="message_id", type="array", @OA\Items(type="number"), example="1"),
     *                 @OA\Property(property="conversation_id", type="number"),
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
    public function multiDeleteMessage(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'message_id' => 'required|array',
            'conversation_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->messageService->multiDeleteMessage($credentials);
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
     *     path="/admin/whatsapp/messages/starred",
     *     tags={"Messages"},
     *     summary="Starred message in a conversation",
     *     description="Starred message in a conversation",
     *     security={{"bearer":{}}},
     * @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="message_id", type="number", example="1"),
     *                 @OA\Property(property="starred", type="number", example="1", description="0: no starred, 1: starred"),
     *                 @OA\Property(property="conversation_id", type="number"),
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
    public function starred(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'message_id' =>  [
                'required',
                'numeric',
                Rule::exists('messages', 'id')
            ],
            'starred' => 'required|in:0,1',
            'conversation_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->messageService->starred($credentials);
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
     *     path="/admin/whatsapp/messages/multi-starred",
     *     tags={"Messages"},
     *     summary="Multiple starred message in a conversation",
     *     description="Multiple starred message in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="message_id", type="array", @OA\Items(type="number"), example="1"),
     *                 @OA\Property(property="starred", type="number", example="1", description="0: no starred, 1: starred"),
     *                 @OA\Property(property="conversation_id", type="number"),
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
    public function multiStarredMessage(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'message_id' => 'required|array',
            'starred' => 'required|in:0,1',
            'conversation_id' => 'required',
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };

        $result = $this->messageService->multiStarredMessage($credentials['message_id'], $credentials['starred'], $credentials['conversation_id']);
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
     *     path="/admin/whatsapp/messages/multi-unstar-messages",
     *     tags={"Messages"},
     *     summary="Multiple unstar message in all conversation",
     *     description="Multiple unstar message in all conversation",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function multiUnstarMessages()
    {
        $result = $this->messageService->multiUnstarMessages();
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
     *     path="/admin/whatsapp/messages/list-message-with-conversation",
     *     tags={"Messages"},
     *     summary="Get a list of message in a conversation",
     *     description="Get a list of message in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="conversation_id",
     *          in="query",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="starred",
     *          in="query",
     *          description="0: no starred (all messages), 1: starred",
     *          example="0",
     *          @OA\Schema(type="number"),
     *     ),
     *
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getMessagesWithConversation(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'conversation_id' => 'required|numeric',
            'starred'         => 'required|numeric|in:0,1'
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        };
        $result = $this->messageService->getMessagesWithConversation($credentials['conversation_id'], $credentials['starred']);

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/messages/list-message-with-starred",
     *     tags={"Messages"},
     *     summary="Get a list of starred message in a conversation",
     *     description="Get a list of starred message in a conversation",
     *     security={{"bearer":{}}},
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getStarredMessagesOfConversations(Request $request)
    {
        $result = $this->messageService->getStarredMessagesOfConversations();

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/messages/list-message-with-customer",
     *     tags={"Messages"},
     *     summary="Get a list of message with customer_id",
     *     description="Get a list of message with customer_id",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="customer_id",
     *          in="query",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="starred",
     *          in="query",
     *          description="0: no starred (all messages), 1: starred",
     *          example="0",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="message_id",
     *          in="query",
     *          @OA\Schema(type="number"),
     *     ),
     *     @OA\Parameter(
     *          name="scroll",
     *          in="query",
     *          description="1: scroll up, 2: scroll down",
     *          example="1",
     *          @OA\Schema(type="number"),
     *     ),
     *
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getMessagesWithCustomer(Request $request)
    {
        $credentials = $request->all();
        $rule = [
            'customer_id' => [
                'required',
                'numeric',
                Rule::exists('customers', 'id')->where(function ($query) {
                    return $query->whereNull('deleted_at');
                })
            ],
            'message_id' => [
                Rule::requiredIf(function () use ($credentials) {
                    return isset($credentials['message_id']);
                }),
                Rule::exists('messages', 'id')->where(function ($query) {
                    $query->where('delete_status', Message::STATUS_FALSE);
                })
            ],
            'starred'     => 'required|numeric|in:0,1'
        ];

        $validator = Validator::make($credentials, $rule);
        if ($validator->fails()) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'message' => $validator->messages()
            ]);
        }

        $scroll = $credentials['scroll'] ?? null;
        $messageId = $credentials['message_id'] ?? null;
        $per_page = $credentials['per_page'] ?? config('common.paginate');
        $result = $this->messageService->getMessagesWithCustomer(
            $credentials['customer_id'],
            $credentials['starred'],
            $messageId,
            $scroll,
            $per_page
        );

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $result,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/admin/whatsapp/messages/media/{mediaId}",
     *     tags={"Messages"},
     *     summary="Get media link with mediaId",
     *     description="Get media link with mediaId",
     *     security={{"bearer":{}}},
     *     @OA\Parameter(
     *          name="mediaId",
     *          in="path",
     *          @OA\Schema(type="number"),
     *     ),
     *
     *     @OA\Response(
     *         response="200",
     *         description="Successful",
     *     )
     * )
     *
     */
    public function getMediaUploadWhatsApp($mediaId)
    {
        $media = $this->messageService->getMediaUploadWhatsApp($mediaId);
        if (!$media) {
            return response()->json([
                'status' => config('common.response_status.failed'),
                'data' => null
            ]);
        }

        return response()->json([
            'status' => config('common.response_status.success'),
            'data' => $media
        ]);
    }
}
