import React, { useMemo } from 'react'
import { useHistory, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import DisplayCustomerImage from '../DisplayCustomerImage'
import { useUserSlice } from 'src/slices/user'

const MessageBox = ({ messages = {}, unseenMessagesCount = 0 }) => {
  const dispatch = useDispatch()

  const { actions: userActions } = useUserSlice()

  const history = useHistory()

  const goToChats = () => {
    history.push('/customers/chats')
  }
  const handleGotoChat = (data) => {
    history.push(`/customers/chats/${data.customer_id}`)
    dispatch(userActions.updateMessagesStatusSuccess({
      id: data.id,
      conversation_id: data.id,
      messages_unread_count: data.messages_unread_count,
    }))
  }

  const RenderData = ({ data = {} }) => {
    const {
      customer,
      latest_message: message,
      latest_message_max_created_at: sendAt,
      messages_unread_count,
    } = data

    const lastMessage = useMemo(() => {
      if (message?.content?.type) {
        switch (message?.content?.type) {
          case 'image':
            return '📷 Image';
          case 'video':
            return '🎬 Video';
          case 'audio':
            return '🎧 Audio';
          case 'text':
            return message?.content?.text?.body ? message.content.text.body : '';
          case 'document':
          case 'application':
            return '📁 Document';
          case 'sticker':
            return (
              <div className="conversationForm__iconType conversationForm__iconType--small">
                <img src="/icons/sticker.svg" alt="sticker" width="14" height="14" />
                Sticker
              </div>
            )
          case 'contacts':
            return (<div className="conversationForm__iconType conversationForm__iconType--small">
              <img src="/icons/user-id.svg" alt="user-id" width="14" height="14" />
              Contact
            </div>
            )
          default:
            return message?.content?.text?.body ? message.content.text.body : '';
        }
      }
      return message?.content?.text?.body ? message.content.text.body : '';
    }, [message]);

    return (
      <>
        <div className="chatBox__left">
          {customer?.avatar ?
            <img src={customer.avatar} alt={customer.customer?.name} />
            :
            <DisplayCustomerImage
              username={customer?.name}
              width={48}
              height={48}
              fontSize="17px"
            />
          }
          <div className="chatBox__info">
            <div className="chatBox__name">{customer?.name}</div>
            <div className="chatBox__message">{lastMessage}</div>
            <div className="chatBox__time">{sendAt || ''}</div>
          </div>
        </div>
        {messages_unread_count > 0 && (
          <div className="chatBox__right">
            <img src="/icons/notice-unread.svg" alt="email" />
          </div>
        )}
      </>
    )
  }

  return (
    <div className="messageBox">
      <div className="messageBox__header">
        <div className="messageBox__left">
          <div className="messageBox__title">WhatsApp</div>
          <div className="messageBox__notice">You have {unseenMessagesCount} unread messages</div>
        </div>
      </div>
      <div className="messageBox__body">
        {messages.map((item, index) => (
          <div
            key={index}
            className="chatBox"
            onClick={() => handleGotoChat(item)}
          >
            <RenderData
              data={item}
            />
          </div>
        ))}
      </div>
      <div className="messageBox__footer">
        <button onClick={() => goToChats()}>View All Messages</button>
      </div>
    </div>
  )
}

export default MessageBox
