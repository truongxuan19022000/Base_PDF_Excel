import React, { useMemo, useState } from 'react'
import dayjs from 'dayjs';

import { CHATS } from 'src/constants/config';
import { isEmptyObject } from 'src/helper/helper';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';

import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';
import DropdownSvg from '../Icons/DropdownSvg';
import DisplayCustomerImage from '../DisplayCustomerImage';

const ConversationForm = ({
  conversation = {},
  selectedCustomer = {},
  handlePinChat,
  handleSelectedCustomer,
  setSelectedCustomerChatId,
  handleSelectConversationAction,
  setSelectedConversationActionId,
}) => {
  const createdAt = conversation?.latest_message?.created_at || '';
  const formattedDate = createdAt ? dayjs(createdAt).fromNow() : '';
  const [isDropdown, setIsDropdown] = useState(false);

  const { type, text } = !isEmptyObject(conversation.latest_message) ? conversation.latest_message.content : { type: null, text: null };

  const isPinned = useMemo(() => {
    return conversation.is_pinned === CHATS.PINNED
  }, [conversation])

  const lastMessage = useMemo(() => {
    if (type) {
      switch (type) {
        case 'image':
          return '📷 Image';
        case 'video':
          return '🎬 Video';
        case 'audio':
          return '🎧 Audio';
        case 'text':
          return text ? text.body : '';
        case 'document':
        case 'application':
          return '📁 Document';
        case 'sticker':
          return (
            <div className="conversationForm__iconType">
              <img src="/icons/sticker.svg" alt="sticker" width="14" height="14" />
              Sticker
            </div>
          )
        case 'contacts':
          return (<div className="conversationForm__iconType">
            <img src="/icons/user-id.svg" alt="user-id" width="14" height="14" />
            Contact
          </div>
          )
        default:
          return text ? text.body : '';
      }
    }
    return text ? text.body : '';
  }, [type, text]);

  const handleSelectAction = (item, conversation) => {
    setIsDropdown(false);
    if (item.action === CHATS.PIN_CHAT) {
      handlePinChat(conversation)
    } else {
      setSelectedConversationActionId(conversation?.id || null)
      setSelectedCustomerChatId(conversation?.customer?.id)
      handleSelectConversationAction(item)
    }
  }

  return (
    <div
      className={`conversationForm${conversation?.customer_id === selectedCustomer?.id ? ' conversationForm--selected' : ''}`}
      onClick={() => handleSelectedCustomer(conversation?.customer)}
    >
      <div className={`conversationForm__actionIcon${isDropdown ? ' conversationForm__actionIcon--active' : ''}`}>
        <ClickOutSideWrapper onClickOutside={() => setIsDropdown(false)}>
          <CDropdown>
            <CDropdownToggle size="sm" className="conversationForm__actionButton">
              {isPinned &&
                <div><img src="/icons/pin.svg" alt="pin" width="18" height="18" /></div>
              }
              {(conversation?.messages_unread_count !== 0) && (
                <div className={`conversationForm__detail--notify${conversation?.messages_unread_count > 9 ? ' conversationForm__detail--notifyBig' : ''}`}>
                  {conversation?.messages_unread_count}
                </div>
              )}
              <div onClick={() => setIsDropdown(!isDropdown)}><DropdownSvg /></div>
            </CDropdownToggle>
            <CDropdownMenu>
              {CHATS.ACTIONS.CONVERSATION.map((item, index) => (
                <CDropdownItem
                  key={index}
                  onClick={() => handleSelectAction(item, conversation)}
                  className="conversationForm__dropdownItem"
                >
                  {isPinned && item.value === 2 ? 'Unpin Chat' : item.label}
                </CDropdownItem>
              ))}
            </CDropdownMenu>
          </CDropdown>
        </ClickOutSideWrapper>
      </div>
      <div className="conversationForm__left">
        <DisplayCustomerImage
          username={conversation?.customer?.name}
          width={48}
          height={48}
          fontSize="17px"
        />
      </div>
      <div className="conversationForm__right">
        <div className="conversationForm__info">
          <div className="conversationForm__info--name">{conversation?.customer?.name}</div>
          <div className="conversationForm__info--chatTime">{formattedDate}</div>
        </div>
        <div className="conversationForm__detail">
          <div className="conversationForm__detail--text">{lastMessage}</div>
        </div>
      </div>
    </div>
  )
}

export default ConversationForm
