<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Message;
use App\Models\WhatsappBusiness;

class ConversationRepository
{
    public function create(array $request)
    {
        return Conversation::create($request);
    }

    public function firstOrCreate($request)
    {
        return Conversation::firstOrCreate($request);
    }

    public function getConversations($searchParams) {
        $sql = Conversation::select([
                    'conversations.id',
                    'conversations.user_id',
                    'conversations.customer_id',
                    'conversations.whatsapp_business_id',
                    'conversations.is_pinned',
                    'conversations.created_at'
                ])
                ->whereHas('customer')
                ->with([
                    'customer' => function($query) {
                        $query->select('id', 'name', 'phone_number');
                    },
                    'latest_message' => function($query) {
                        $query->select('id', 'conversation_id', 'content', 'status', 'created_at');
                    }
                ])
                ->withMax('latest_message', 'created_at')
                ->join('whatsapp_business', 'whatsapp_business.id', 'conversations.whatsapp_business_id')
                ->where('whatsapp_business.status', WhatsappBusiness::STATUS_ON);

        $sql->orderBy('is_pinned', 'DESC')
            ->orderBy('latest_message_max_created_at', 'DESC')
            ->orderBy('conversations.id', 'DESC');

        $per_page = config('common.paginate');
        if (isset($searchParams['per_page']) && is_numeric($searchParams['per_page'])) {
            $per_page = $searchParams['per_page'];
        }

        return $sql->paginate($per_page);
    }

    public function searchConversations($searchParams)
    {
        $sql = Customer::select(['id','name','phone_number'])
                ->where(function ($query) use ($searchParams) {
                    if (isset($searchParams['search'])) {
                        $query->where('name', 'LIKE', '%'. $searchParams['search'] .'%')
                            ->orWhere('phone_number', 'LIKE', '%' . $searchParams['search'] . '%');
                    }
                })
                ->with([
                    'conversation' => function($query) {
                        $query->select('conversations.id', 'conversations.user_id', 'conversations.customer_id', 'conversations.whatsapp_business_id', 'conversations.created_at');
                    },
                    'conversation.latest_message' => function($query) {
                        $query->select('id', 'conversation_id', 'content', 'status', 'created_at');
                    }
                ])
                ->get()
                ->sortByDesc('conversation.latest_message.created_at')
                ->sortByDesc('conversation.id')
                ->values();

        return $sql;
    }

    public function cleanConversation($conversationId)
    {
        return Message::where('conversation_id', $conversationId)->update(['delete_status' => Message::STATUS_TRUE]);
    }

    public function update($conversationId, $updateData)
    {
        return Conversation::where('id', $conversationId)->update($updateData);
    }

    public function delete($conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $conversation->messages()->delete();
        return $conversation->delete();
    }
}
