<?php

namespace App\Repositories;

use App\Models\Message;
use App\Models\WhatsappBusiness;

class MessageRepository
{
    public function create($request)
    {
        return Message::create([
            'conversation_id'           => $request['conversation_id'],
            'whatsapp_message_id'       => $request['whatsapp_message_id'],
            'reply_whatsapp_message_id' => $request['reply_whatsapp_message_id'],
            'content'                   => $request['content'],
            'status'                    => Message::STATUS_SENT,
            'sender'                    => $request['sender'],
        ]);
    }

    public function getMessageByWAMID($wamId)
    {
        return Message::where('whatsapp_message_id', $wamId)->first();
    }

    public function updateMessageByWAMID($wamId, $updateData)
    {
        return Message::where('whatsapp_message_id', $wamId)->update($updateData);
    }

    public function getMessageByID($messageId)
    {
        return Message::where('id', $messageId)->first();
    }

    public function updateMessageByID($messageId, $updateData)
    {
        return Message::where('id', $messageId)->update($updateData);
    }

    public function delete($messageId, $conversationId)
    {
        return Message::where('id', $messageId)->where('conversation_id', $conversationId)->update(['delete_status' => Message::STATUS_TRUE]);
    }

    public function multiDeleteMessage($messageId, $conversationId)
    {
        return Message::whereIn('id', $messageId)->where('conversation_id', $conversationId)->update(['delete_status' => Message::STATUS_TRUE]);
    }

    public function starred($credentials)
    {
        return Message::where('id', $credentials['message_id'])->where('conversation_id', $credentials['conversation_id'])->update(['starred' => $credentials['starred']]);
    }

    public function multiStarredMessage($messageId, $starredStatus, $conversationId)
    {
        return Message::whereIn('id', $messageId)->where('conversation_id', $conversationId)->update(['starred' => $starredStatus]);
    }

    public function multiUnstarMessages()
    {
        return Message::where('starred', Message::STATUS_TRUE)->update(['starred' => Message::STATUS_FALSE]);
    }

    public function getMessagesWithConversation($conversationId, $starred)
    {
        $sql = Message::where('conversation_id', $conversationId)
                    ->where('delete_status', Message::STATUS_FALSE)
                    ->where('status', '<>', Message::STATUS_FAIL);

        if ($starred == Message::STATUS_TRUE) {
            $sql->where('starred', $starred);
        }

        return $sql->orderBy('created_at', 'DESC')->paginate(config('common.paginate'));
    }

    public function getStarredMessagesOfConversations()
    {
        $sql = Message::select(
            'messages.*',
            'customers.id as customer_id',
            'customers.name as customer_name',
            'customers.phone_number as customer_phone_number',
            'reply_content.content as reply_content',
            'reply_content.sender as reply_sender'
            )
            ->join('conversations', 'conversations.id', 'messages.conversation_id')
            ->join('customers', 'conversations.customer_id', 'customers.id')
            ->leftJoin('messages as reply_content', function ($join) {
                $join->on('reply_content.whatsapp_message_id', '=', 'messages.reply_whatsapp_message_id');
            })
            ->where('messages.delete_status', Message::STATUS_FALSE)
            ->where('messages.starred', Message::STATUS_TRUE);

        return $sql->orderBy('created_at', 'DESC')->paginate(config('common.paginate'));
    }

    public function getMessagesWithCustomer($customerId, $starred, $messageId, $condition, $orderBy, $per_page)
    {
        $sql = Message::select(
                        'messages.*',
                        'customers.id as customer_id',
                        'customers.name as customer_name',
                        'customers.phone_number as customer_phone_number',
                        'reply_content.content as reply_content',
                        'reply_content.sender as reply_sender'
                    )
                    ->join('conversations', 'conversations.id', 'messages.conversation_id')
                    ->join('whatsapp_business', 'whatsapp_business.id', 'conversations.whatsapp_business_id')
                    ->join('customers', 'conversations.customer_id', 'customers.id')
                    ->leftJoin('messages as reply_content', function ($join) {
                        $join->on('reply_content.whatsapp_message_id', '=', 'messages.reply_whatsapp_message_id');
                    })
                    ->where('whatsapp_business.status', WhatsappBusiness::STATUS_ON)
                    ->where('conversations.customer_id', $customerId)
                    ->where('messages.delete_status', Message::STATUS_FALSE)
                    ->where('messages.status', '<>', Message::STATUS_FAIL);

        if (!empty($messageId)) {
            $sql->where('messages.id', $condition, $messageId);
        }
        if ($starred == Message::STATUS_TRUE) {
            $sql->where('messages.starred', $starred);
        }

        return $sql->orderBy('messages.created_at', $orderBy)->paginate($per_page);
    }

    public function changeStatusMessage($conversationId)
    {
        return Message::where('conversation_id', $conversationId)
                ->whereIn('status', [Message::STATUS_SENT, Message::STATUS_DELIVERED])
                ->where('sender', Message::CUSTOMER)
                ->where('delete_status', Message::STATUS_FALSE)
                ->update(['status' => Message::STATUS_READ]);
    }

}
