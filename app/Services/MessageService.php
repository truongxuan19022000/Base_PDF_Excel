<?php

namespace App\Services;

use App\Events\WhatsAppPusherEvent;
use App\Models\Message;
use App\Repositories\ConversationRepository;
use App\Repositories\CustomerRepository;
use App\Repositories\MessageRepository;
use App\Repositories\WhatsappBusinessRepository;
use Exception;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MessageService
{
    private $messageRepository;
    private $conversationRepository;
    private $customerRepository;
    private $whatsappBusinessRepository;

    public function __construct(
        MessageRepository $messageRepository,
        ConversationRepository $conversationRepository,
        CustomerRepository $customerRepository,
        WhatsappBusinessRepository $whatsappBusinessRepository
    ) {
        $this->messageRepository        = $messageRepository;
        $this->conversationRepository   = $conversationRepository;
        $this->customerRepository       = $customerRepository;
        $this->whatsappBusinessRepository = $whatsappBusinessRepository;
    }

    public function createMessageByWebHook($data)
    {
        try {
            $pusher_message = [];
            $customer = $this->customerRepository->getCustomerByPhone($data['phone_number']);
            if (isset($data['reaction_message_id'])) {
                $this->messageRepository->updateMessageByWAMID($data['reaction_message_id'], ['reaction_by_customer' => $data['reaction_by_customer']]);
                $result = $this->messageRepository->getMessageByWAMID($data['reaction_message_id']);
                if (!empty($result['reply_whatsapp_message_id'])) {
                    $reply_message = $this->messageRepository->getMessageByWAMID($result['reply_whatsapp_message_id']);
                    $result['reply_content'] = json_encode($reply_message['content']);
                    $result['reply_sender'] = $reply_message['sender'];
                }

                if ($result && $result['delete_status'] != Message::STATUS_TRUE) {
                    $pusher_message['message'] = $result;
                    $pusher_message['reaction'] = $data['reaction_by_customer'];
                }

            } else {
                $business = $this->whatsappBusinessRepository->getWhatsappBusinessByPhone($data['business_phone_number'], $data['business_phone_number_id']);
                if (!$customer || !$business) {
                    return false;
                }
                $conversation = $this->conversationRepository->firstOrCreate(['customer_id' => $customer->id, 'whatsapp_business_id' => $business->id]);
                $message = [
                    'conversation_id'           => $conversation->id,
                    'whatsapp_message_id'       => $data['whatsapp_message_id'],
                    'reply_whatsapp_message_id' => $data['reply_whatsapp_message_id'],
                    'content'                   => json_encode($data['content']),
                    'sender'                    => Message::CUSTOMER,
                ];
                $result = $this->messageRepository->create($message);
                $reply_message = $this->messageRepository->getMessageByWAMID($data['reply_whatsapp_message_id']);
                if (!empty($reply_message)) {
                    $result['reply_content'] = json_encode($reply_message['content']);
                    $result['reply_sender'] = $reply_message['sender'];
                }
                if ($result) {
                    $pusher_message['message'] = $result;
                }
            }
            if (!empty($customer)){
                $pusher_message['message']['customer_id'] = $customer['id'];
                $pusher_message['message']['customer_name'] = $customer['name'];
                $pusher_message['message']['customer_phone_number'] = $customer['phone_number'];
            }

            if (!empty($pusher_message)) {
                event(new WhatsAppPusherEvent($pusher_message));
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "createMessageByWebHook" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function updateMessageStatusByWebHook($data)
    {
        try {
            $message_status = [
                'sent'      => Message::STATUS_SENT,
                'delivered' => Message::STATUS_DELIVERED,
                'read'      => Message::STATUS_READ,
                'failed'    => Message::STATUS_FAIL,
            ];

            if (in_array($data['status'], ['delivered', 'read', 'failed'])) {
                $status = $message_status[$data['status']];
                $this->messageRepository->updateMessageByWAMID($data['whatsapp_message_id'], ['status' => $status]);
            }
            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "updateStatusMessageByWebHook" ERROR: ' . $e->getMessage());
            return false;
        }
    }

    public function sendMessageWhatsApp($data)
    {
        try {
            $business = $this->whatsappBusinessRepository->getWhatsappBusinessSendMessage();
            if (!$business) {
                return [
                    'status' => false
                ];
            }
            $accessToken = $business->access_token;
            $graph_version = $business->graph_version;
            $phone_number_id = $business->phone_number_id;
            $url_send_message = "https://graph.facebook.com/{$graph_version}/{$phone_number_id}/messages";
            $url_upload_media = "https://graph.facebook.com/{$graph_version}/{$phone_number_id}/media";
            $reply_whatsapp_message_id = NULL;
            $reaction_by_business = NULL;
            $result = NULL;
            $client = new \GuzzleHttp\Client();
            $type = $data['type'];

            $headers = [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $accessToken,
            ];
            $jsonBody = [
                "messaging_product" => "whatsapp",
                "recipient_type" => "individual",
                "to" => $data['phone_number'],
                "type" => $type,
            ];

            if ($type === 'text') {
                $jsonBody['text'] = [
                    'preview_url' => false,
                    'body' => $data['message']
                ];
            } elseif ($type === 'reaction') {
                $jsonBody['reaction'] = [
                    'message_id' => $data['whatsapp_message_id'],
                    'emoji' =>  $data['emoji'] ?? '',
                ];
                $reaction_by_business = $data['emoji'] ?? NULL;
            } elseif (in_array($type, ['image', 'document', 'video', 'audio', 'sticker'])) {
                $mediaFile = $data[$type];
                $baseUrl = 'messages/'.date('Y/m/d');
                $mediaUpload = uploadToLocalStorage($mediaFile, $baseUrl);
                if (!$mediaUpload) {
                    return response()->json([
                        'status' => config('common.response_status.failed'),
                        'message' => trans('message.upload_image_failed')
                    ]);
                }
                $mediaUrl = env('MEDIA_WHATSAPP_DOMAIN').$mediaUpload;
                $jsonBody[$type]['link'] = $mediaUrl;

                // caption only support type image, document, video
                if (in_array($type, ['image', 'document', 'video']) && isset($data['caption'])) {
                    $jsonBody[$type]['caption'] = $data['caption'];
                }

                if ($type === 'document') {
                    $jsonBody[$type]['filename'] =  $mediaFile->getClientOriginalName();
                }

            } elseif ($type === 'location') {
                $jsonBody['location'] = [
                    'latitude' => $data['latitude'],
                    'longitude' => $data['longitude'],
                ];
                if (isset($data['name'])) {
                    $jsonBody['location']['name'] = $data['name'];
                }
            } elseif ($type === 'contacts') {
                $jsonBody['contacts'] = [
                    [
                        'name' => [
                            'first_name' => $data['contact_name'],
                            'formatted_name' =>  $data['contact_name']
                        ],
                        'phones' => [
                            [
                                'phone' => $data['contact_phone'],
                                'wa_id' => $data['contact_phone'],
                                'type' => 'CELL'
                            ]
                        ]
                    ]
                ];
            }

            if (isset($data['reply_message_id'])) {
                $jsonBody['context'] = [
                    'message_id' => $data['reply_message_id'],
                ];
                $reply_whatsapp_message_id = $data['reply_message_id'];
            }

            $response = $client->post($url_send_message, [
                'headers' => $headers,
                'json' => $jsonBody,
            ]);

            $wam_response = json_decode($response->getBody(), true);
            $whatsapp_message_id = $wam_response['messages'][0]['id'];
            $customer = $this->customerRepository->getCustomerByPhone($data['phone_number']);
            $conversation = $this->conversationRepository->firstOrCreate(['customer_id' => $customer->id, 'whatsapp_business_id' => $business->id]);
            unset($jsonBody['messaging_product'], $jsonBody['recipient_type'], $jsonBody['to']);

            $message = [
                'conversation_id'           => $conversation->id,
                'whatsapp_message_id'       => $whatsapp_message_id,
                'reply_whatsapp_message_id' => $reply_whatsapp_message_id,
                'content'                   => json_encode($jsonBody),
                'sender'                    => Message::BUSINESS,
            ];

            if ($type === 'reaction') {
                $result = $this->messageRepository->updateMessageByWAMID($data['whatsapp_message_id'], ['reaction_by_business' => $reaction_by_business]);
            } else {
                $result = $this->messageRepository->create($message);
            }

            if (!$result) {
                return [
                    'status' => false
                ];
            }

            return [
                'status' => true,
                'data'   => $result
            ];
        } catch (Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "sendMessageWhatsApp" ERROR: ' . $e->getMessage());
            return [
                'status' => false
            ];
        }
    }

    public function uploadMediaWhatsApp($media, $accessToken, $urlUpload)
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post($urlUpload, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
                'multipart' => [
                    [
                        'name' => 'messaging_product',
                        'contents' => 'whatsapp',
                    ],
                    [
                        'name' => 'file',
                        'contents' => fopen($media->getPathname(), 'r'),
                        'filename' => $media->getClientOriginalName()
                    ],
                ],
            ]);
            $response = json_decode($response->getBody(), true);
            return $response['id'];
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "uploadMediaWhatsApp"' . $e->getMessage());
            return false;
        }
    }

    public function getMediaUploadWhatsApp($mediaId)
    {
        try {
            $business = $this->whatsappBusinessRepository->getWhatsappBusinessSendMessage();
            if (!$business) {
                return false;
            }
            $client = new \GuzzleHttp\Client();
            $accessToken = $business->access_token;
            $graphVersion = $business->graph_version;

            $response = $client->get("https://graph.facebook.com/{$graphVersion}/{$mediaId}", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json'
                ]
            ]);
            $response = json_decode($response->getBody(), true);
            return $response;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "getMediaUploadWhatsApp"' . $e->getMessage());
            return false;
        }
    }

    public function getMediaUrlWhatsAppInLocalStorage($mediaId) {
        try {
            $business = $this->whatsappBusinessRepository->getWhatsappBusinessSendMessage();
            if (!$business) {
                return false;
            }
            $client = new \GuzzleHttp\Client();
            $accessToken = $business->access_token;
            $graphVersion = $business->graph_version;

            $response = $client->get("https://graph.facebook.com/{$graphVersion}/{$mediaId}", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json'
                ]
            ]);
            $response = json_decode($response->getBody(), true);
            $url = $response['url'];

            $response = $client->get($url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken
                ]
            ]);
            $contents = $response->getBody()->getContents();
            $tempFilePath = tempnam(sys_get_temp_dir(), 'temp_file');
            file_put_contents($tempFilePath, $contents);
            $file = new File($tempFilePath);
            $baseUrl = 'messages/'.date('Y/m/d');
            $mediaUpload = uploadToLocalStorage($file, $baseUrl);
            unlink($tempFilePath);

            $mediaUrl = env('MEDIA_WHATSAPP_DOMAIN').$mediaUpload;
            return $mediaUrl;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "getMediaUrlWhatsAppInLocalStorage"' . $e->getMessage());
            return false;
        }
    }

    public function delete($credentials)
    {
        try {
            $result = $this->messageRepository->delete($credentials['message_id'], $credentials['conversation_id']);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiDeleteMessage($credentials)
    {
        try {
            $result = $this->messageRepository->multiDeleteMessage($credentials['message_id'], $credentials['conversation_id']);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "multiDeleteMessage" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function starred($credentials)
    {
        try {
            $result = $this->messageRepository->starred($credentials);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "starredMessage" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiStarredMessage($messageId, $starredStatus, $conversationId)
    {
        try {
            $result = $this->messageRepository->multiStarredMessage($messageId, $starredStatus, $conversationId);
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "multiStarredMessage" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function multiUnstarMessages()
    {
        try {
            $result = $this->messageRepository->multiUnstarMessages();
            if (!$result) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "MessageService" FUNCTION "multiStarredMessagesOfConversations" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function getMessagesWithConversation($conversationId, $starred)
    {
        $messages = $this->messageRepository->getMessagesWithConversation($conversationId, $starred);
        if ($messages->isNotEmpty()) {
            $this->messageRepository->changeStatusMessage($conversationId);
        }
        $results = [
            'messages' => $messages,
        ];

        return $results;
    }

    public function getStarredMessagesOfConversations()
    {
        $messages = $this->messageRepository->getStarredMessagesOfConversations();

        $results = [
            'messages' => $messages,
        ];

        return $results;
    }

    public function getMessagesWithCustomer($customerId, $starred, $messageId, $scroll, $per_page)
    {
        $condition = '<=';
        $orderBy = 'DESC';
        if ($messageId) {
            if ($scroll == config('common.scroll.down')) {
                $condition = '>=';
                $orderBy = 'ASC';
            } else {
                $condition = '<=';
                $orderBy = 'DESC';
            }
        }
        $messages = $this->messageRepository->getMessagesWithCustomer($customerId, $starred, $messageId, $condition, $orderBy, $per_page);

        if ($messages->isNotEmpty()) {
            $conversation_id = $messages->first()->conversation_id;
            $this->messageRepository->changeStatusMessage($conversation_id);
        } else {
            $business = $this->whatsappBusinessRepository->getWhatsappBusinessSendMessage();
            $conversation = $this->conversationRepository->firstOrCreate(['customer_id' => $customerId, 'whatsapp_business_id' => $business->id]);
            $conversation_id = $conversation->id;
        }
        $customer = $this->customerRepository->getCustomerDetail($customerId);
        $results = [
            'conversation_id' => $conversation_id,
            'customer' => $customer,
            'messages' => $messages,
        ];

        return $results;
    }

}
