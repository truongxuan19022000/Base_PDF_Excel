import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CHATS } from 'src/constants/config'
import { useMessageSlice } from 'src/slices/message'
import { validateMessageAction } from 'src/helper/validation'

import StarSvg from '../Icons/StarSvg'
import ChatTrashSvg from '../Icons/ChatTrashSvg'
import SlashChatStarSvg from '../Icons/SlashChatStarSvg'

const MessageActionForm = ({
  selectedIds = [],
  messageList = [],
  conversationId = null,
  setMessageError = null,
  selectedStarredMessageId= null,
  isDisableSubmit = false,
  isFirstMsgStarred = false,
  isConfirmedDeleteSelectedMessages = false,
  onError,
  onSuccess,
  setIsDisableSubmit,
  setIsSelectingMessage,
  setSelectedStarredMessageId,
  handleSelectChatAction,
  setIsShowChatActionConfirmModal,
  setIsConfirmDeleteSelectedMessages,
}) => {
  const { actions } = useMessageSlice()
  const dispatch = useDispatch()

  const [latestMessage, setLatestMessage] = useState({})

  useEffect(() => {
    if (messageList?.length > 0 && selectedIds?.length > 0) {
      const filteredList = messageList.filter(msg => !selectedIds?.includes(msg.id));
      filteredList.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      const latestMessageTemp = filteredList[0];
      setLatestMessage(latestMessageTemp);
    }
  }, [selectedIds, messageList])

  useEffect(() => {
    if (isConfirmedDeleteSelectedMessages && selectedIds?.length > 0) {
      handleMultiDeleteMessage(selectedIds)
      setIsShowChatActionConfirmModal(false)
      setIsConfirmDeleteSelectedMessages(false)
    }
  }, [isConfirmedDeleteSelectedMessages, selectedIds])

  const handleStarredMessage = () => {
    if (isDisableSubmit || selectedIds.length === 0) return

    const data = {
      message_id: selectedIds,
      conversation_id: conversationId,
      starred: isFirstMsgStarred ? CHATS.NO_STARRED : CHATS.STARRED,
    }

    const errors = validateMessageAction(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
      setIsDisableSubmit(true)
    } else {
      dispatch(actions.multiStarredMessage({ ...data, onSuccess, onError }))
      setIsDisableSubmit(true)
      setMessageError({})
    }
  }

  const handleMultiDeleteMessage = (selectedIds) => {
    setIsShowChatActionConfirmModal(false)
    if (isDisableSubmit || selectedIds.length === 0) return;
    const data = {
      conversation_id: conversationId,
      message_id: selectedIds,
      latest_message: latestMessage || {},
    };
    const errors = validateMessageAction(data);
    if (Object.keys(errors).length > 0) {
      setMessageError(errors);
      setIsDisableSubmit(true);
    } else {
      dispatch(actions.multiDeleteMessage({ ...data, onSuccess, onError }));
      setMessageError({})
      setIsDisableSubmit(true)
      setIsSelectingMessage(false)
      if (selectedIds.includes(selectedStarredMessageId)) {
        setSelectedStarredMessageId(null)
      }
    }
  }

  return (
    <div className="msgActionForm">
      <div className="msgActionForm__box">
        <div className="msgActionForm__left">
          <img
            className="msgActionForm__left--icon"
            src="/icons/close-mark.svg"
            alt="close-mark"
            onClick={() => setIsSelectingMessage(false)}
          />
          <span className="msgActionForm__left--label">Selected</span>
          <span className={`msgActionForm__left--number${selectedIds.length > 9 ? ' msgActionForm__left--numberBig' : ''}`}>{selectedIds.length || 0}</span>
        </div>
        <div className="msgActionForm__right">
          {isFirstMsgStarred ? (
            <span
              className={`msgActionForm__right--icon${selectedIds.length > 0 ? ' msgActionForm__right--iconActive' : ''}`}
              onClick={handleStarredMessage}
            >
              <SlashChatStarSvg />
            </span>
          ) : (
            <span
              className={`msgActionForm__right--icon${selectedIds.length > 0 ? ' msgActionForm__right--iconActive' : ''}`}
              onClick={handleStarredMessage}
            >
              <StarSvg />
            </span>
          )}
          <span
            className={`msgActionForm__right--icon msgActionForm__right--iconDelete${selectedIds.length > 0 ? ' msgActionForm__right--iconActive' : ''}`}
            onClick={() => handleSelectChatAction(CHATS.ACTIONS.DELETE_SELECTED_MESSAGES)}
          >
            <ChatTrashSvg />
          </span>
        </div>
      </div>
    </div>
  )
}

export default MessageActionForm
