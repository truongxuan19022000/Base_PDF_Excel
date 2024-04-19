import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';

import { isEmptyObject } from 'src/helper/helper';
import { useMessageSlice } from 'src/slices/message';
import { validateMessageAction } from 'src/helper/validation';
import { CHATS } from 'src/constants/config';

import EmojiBox from '../EmojiBox/Emoji';
import EmojiSvg from '../Icons/EmojiSvg';
import EmojiInfoBox from '../EmojiInfoBox';
import DropdownSvg from '../Icons/DropdownSvg';
import MessageItemForm from '../MessageItemForm';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const MessageForm = ({
  message = {},
  selectedIds = [],
  messageList = [],
  indexKey = null,
  customerInfo = null,
  customerPhone = null,
  selectedStarredMessageId = null,
  isQueueList = false,
  isSelectedMsg = false,
  isSelectingMessage = false,
  isShowMessageDialog = false,
  isConfirmedDeleteMessage = false,
  isShowChatActionConfirmModal = false,
  setMessageError,
  setIsShowMessageDialog,
  setSelectedReplyMessage,
  setIsConfirmDeleteMessage,
  setSelectedStarredMessageId,
  setIsShowChatActionConfirmModal,
  handleSelectItem,
  handleSelectChatAction,
  handleDeleteMessageInQueue,
}) => {
  const { actions } = useMessageSlice()
  const dispatch = useDispatch();

  const [isDropdown, setIsDropdown] = useState(false);
  const [latestMessage, setLatestMessage] = useState({});
  const [isOpenEmojiBox, setIsOpenEmojiBox] = useState(false);
  const [selectedDeleteMessage, setSelectedDeleteMessage] = useState({});

  const isChecked = selectedIds.includes(message.id);
  const isStarred = +message.starred === +CHATS.STARRED;
  const emojiList = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  const isAdmin = +message.sender === +CHATS.SENDER.ADMIN || false;
  const isMultiEmoji = message.reaction_by_business && message.reaction_by_customer;
  const dropdownClassName = `message__dropdownIcon ${(message.content?.image || message.content?.video) ? 'message__dropdownIcon--media' : ''}`


  const isMediaType = useMemo(() => {
    return CHATS.MEDIA_TYPES.includes(message.content?.type)
  }, [message])

  useEffect(() => {
    if (messageList?.length > 0 && message.id) {
      const filteredList = messageList.filter(msg => message.id !== msg.id);
      filteredList.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      const latestMessageTemp = filteredList[0];
      setLatestMessage(latestMessageTemp);
    }
  }, [message.id, messageList])

  useEffect(() => {
    if (isOpenEmojiBox) {
      setIsDropdown(false)
    }
  }, [isOpenEmojiBox])

  useEffect(() => {
    if (isSelectingMessage) {
      setIsDropdown(false)
      setIsOpenEmojiBox(false)
    }
  }, [isSelectingMessage])

  useEffect(() => {
    if (!isShowChatActionConfirmModal && !isEmptyObject(selectedDeleteMessage)) {
      setSelectedDeleteMessage({})
    }
  }, [isShowChatActionConfirmModal, selectedDeleteMessage])

  useEffect(() => {
    if (isConfirmedDeleteMessage && !isEmptyObject(selectedDeleteMessage)) {
      handleDeleteMessage(selectedDeleteMessage)
      setIsConfirmDeleteMessage(false)
    }
  }, [isConfirmedDeleteMessage, selectedDeleteMessage])

  const onSuccess = () => {
    setSelectedDeleteMessage({})
  }
  const onError = () => {
  }

  const handleStarMessage = useCallback(() => {
    const data = {
      message_id: [message.id],
      conversation_id: message.conversation_id,
      starred: isStarred ? CHATS.NO_STARRED : CHATS.STARRED,
    }
    const errors = validateMessageAction(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.multiStarredMessage({ ...data, onSuccess, onError }))
      setMessageError({})
    }
    setIsDropdown(false);
  }, [isStarred, message])

  const handleDeleteMessage = (selectedMessage) => {
    setIsShowChatActionConfirmModal(false)
    if (selectedMessage?.status === CHATS.SEND_MESSAGE_FAILED) {
      dispatch(actions.deleteFailedMessage(indexKey))
    } else {
      const data = {
        message_id: [selectedMessage?.id],
        conversation_id: selectedMessage?.conversation_id,
        latest_message: latestMessage || {},
      };
      const errors = validateMessageAction(data);
      if (Object.keys(errors).length > 0) {
        setMessageError(errors);
      } else {
        dispatch(actions.multiDeleteMessage({ ...data, onSuccess, onError }));
        setMessageError({})
        if (selectedMessage?.id === selectedStarredMessageId) {
          setSelectedStarredMessageId(null)
        }
      }
    }
  }


  const handleToggleDropdown = () => {
    setIsDropdown(!isDropdown)
    setIsOpenEmojiBox(false)
  }


  const handleClickReact = (e) => {
    e.stopPropagation()
    setIsOpenEmojiBox(true)
  }

  const handleClickDelete = (message) => {
    setSelectedDeleteMessage(message)
    handleSelectChatAction(CHATS.ACTIONS.DELETE_MESSAGE)
  }

  return (
    <div
      className={`message${isSelectingMessage ? ' message--selecting' : ''}${isAdmin ? ' message--admin' : ''}${isChecked ? ' message--selected' : ''}`}
      onClick={() => handleSelectItem(message.id)}
    >
      {isSelectingMessage && (
        <div className="message__checkbox">
          <img
            src={`/icons/${isChecked ? 'checked' : 'uncheck'}.svg`}
            alt={isChecked ? 'checked' : 'uncheck'}
          />
        </div>
      )}
      <div className={`message__content${isSelectingMessage ? ' message__content--selecting' : ''}`}>
        <div className={`message__box${isAdmin ? ' message__box--admin' : ''}${message.isError ? ' message__box--error' : ''}${isMediaType ? ' message__box--media' : ''}`}>
          {!isSelectingMessage && (
            <div
              className={`message__emojiSelect${isAdmin ? ' message__emojiSelect--admin' : ''}`}
              onClick={() => setIsOpenEmojiBox(true)}
            >
              <EmojiSvg />
              {isOpenEmojiBox &&
                <div className={`message__emoji${isAdmin ? ' message__emoji--admin' : ''}`}>
                  <ClickOutSideWrapper onClickOutside={() => setIsOpenEmojiBox(false)}>
                    <EmojiBox
                      emojiList={emojiList}
                      currentEmoji={message.reaction_by_business}
                      positionCurrentEmoji={isAdmin ? 'left' : 'right'}
                      customerPhone={customerPhone}
                      message={message}
                      setMessageError={setMessageError}
                      setIsOpenEmojiBox={setIsOpenEmojiBox}
                    />
                  </ClickOutSideWrapper>
                </div>
              }
            </div>
          )}
          <ClickOutSideWrapper onClickOutside={() => setIsDropdown(false)}>
            <div
              className={`message__collapse${isAdmin ? ' message__collapse--admin' : ''}
              ${message.content?.document ? ' message__collapse--document' : ''}
              ${isDropdown ? ' message__collapse--open' : ''}`}
            >
              <CDropdown onClick={handleToggleDropdown}>
                <CDropdownToggle className="message__dropdown" size="sm">
                  {(!isOpenEmojiBox && !isSelectingMessage) &&
                    <div className={dropdownClassName}>
                      <DropdownSvg />
                    </div>
                  }
                </CDropdownToggle>
                {isQueueList ? (
                  <CDropdownMenu>
                    <CDropdownItem className="message__dropdownItem" onClick={handleDeleteMessageInQueue}>Delete</CDropdownItem>
                  </CDropdownMenu>
                ) : (
                  <CDropdownMenu>
                    {message.status !== 3 && (
                      <>
                        <CDropdownItem className="message__dropdownItem" onClick={() => setSelectedReplyMessage(message)}>Reply</CDropdownItem>
                        <CDropdownItem className="message__dropdownItem" onClick={handleClickReact}>React</CDropdownItem>
                        <CDropdownItem className="message__dropdownItem" onClick={handleStarMessage}>{isStarred ? 'Remove star' : 'Star'}</CDropdownItem>
                      </>
                    )}
                    <CDropdownItem className="message__dropdownItem" onClick={() => handleClickDelete(message)}>Delete</CDropdownItem>
                  </CDropdownMenu>
                )}
              </CDropdown>
            </div>
          </ClickOutSideWrapper>
          <MessageItemForm
            message={message}
            isStarred={isStarred}
            customerInfo={customerInfo}
            isSelectedMsg={isSelectedMsg}
            isShowMessageDialog={isShowMessageDialog}
            setIsShowMessageDialog={setIsShowMessageDialog}
          />
        </div>
        {(message.reaction_by_business || message.reaction_by_customer) &&
          <CDropdown>
            <CDropdownToggle className="message__reactDropdown">
              <div className={`message__react ${isAdmin ? 'message__react--admin' : ''}`}>
                <div className={`message__reactEmoji ${isMultiEmoji ? 'message__reactEmoji--multi' : ''}`}>
                  {message.reaction_by_business === message.reaction_by_customer ?
                    <p>{message.reaction_by_business}</p>
                    :
                    <>
                      <p>{message.reaction_by_business}</p>
                      <p>{message.reaction_by_customer}</p>
                    </>
                  }
                  {isMultiEmoji &&
                    <p>2</p>
                  }
                </div>
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="message__menuEmoji">
              <EmojiInfoBox
                customerInfo={customerInfo}
                businessEmoji={message.reaction_by_business}
                customerEmoji={message.reaction_by_customer}
              />
            </CDropdownMenu>
          </CDropdown>
        }
        {message.isError &&
          <div className="message__error">
            <p>Send message error. Please try again</p>
          </div>
        }
      </div>
    </div>
  )
}

export default memo(MessageForm)
