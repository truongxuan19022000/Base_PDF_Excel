import React from 'react';
import dayjs from 'dayjs';

const ConversationSearchResult = ({
  chat = null,
}) => {
  const createdAt = chat?.latest_message?.created_at || '';
  const formattedDate = createdAt ? dayjs(createdAt).fromNow() : '';

  return (
    <div className="conversationResult">
      <div className="conversationResult__left">
        <img src="/images/customer.png" alt={chat?.customer?.name} />
      </div>
      <div className="conversationResult__right">
        <div className="conversationResult__info">
          <div className="conversationResult__info--name">{chat?.customer?.name}</div>
          <div className="conversationResult__info--chatTime">{formattedDate}</div>
        </div>
        <div className="conversationResult__detail">
          <div className="conversationResult__detail--text">{chat?.latest_message?.content?.text?.body}</div>
          {(chat?.messages_unread_count !== 0) && (
            <div className={`conversationResult__detail--notify${chat?.messages_unread_count > 9 ? ' conversationResult__detail--notifyBig' : ''}`}>
              {chat?.messages_unread_count}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationSearchResult
