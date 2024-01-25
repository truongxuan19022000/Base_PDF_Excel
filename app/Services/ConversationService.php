<?php

namespace App\Services;

use App\Repositories\ConversationRepository;
use App\Repositories\MessageRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ConversationService
{
    private $conversationRepository;

    public function __construct(
        ConversationRepository $conversationRepository
    ) {
        $this->conversationRepository = $conversationRepository;
    }

    public function getConversations($searchParams)
    {
        $conversations = $this->conversationRepository->getConversations($searchParams);
        $results = [
            'conversations' => $conversations,
        ];

        return $results;
    }

    public function searchConversations($searchParams)
    {
        $conversations = $this->conversationRepository->searchConversations($searchParams);
        $results = [
            'conversations' => $conversations,
        ];

        return $results;
    }

    public function cleanConversation($conversationId)
    {
        try {
            $conversation = $this->conversationRepository->cleanConversation($conversationId);
            if (!$conversation) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ConversationService" FUNCTION "cleanConversation" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function update($credentials)
    {
        try {
            $updateData = [
                'is_pinned' => $credentials['is_pinned'],
                'updated_at' => Carbon::now(),
            ];
            $conversation = $this->conversationRepository->update($credentials['conversation_id'], $updateData);
            if (!$conversation) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ConversationService" FUNCTION "update" ERROR: ' . $e->getMessage());
        }
        return false;
    }

    public function delete($conversationId)
    {
        try {
            $conversation = $this->conversationRepository->delete($conversationId);
            if (!$conversation) {
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('CLASS "ConversationService" FUNCTION "delete" ERROR: ' . $e->getMessage());
        }
        return false;
    }
}


