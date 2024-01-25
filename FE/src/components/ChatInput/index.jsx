import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import dayjs from 'dayjs';

import { isEmptyObject } from 'src/helper/helper';
import { useMessageSlice } from 'src/slices/message';
import { validateSendMessage } from 'src/helper/validation';
import { CHATS, FONT_SIZE_CHAT, INITIAL_CHAT_INPUT_HEIGHT, LINE_HEIGHT_CHAT_TEXT } from 'src/constants/config';

import ReplyBox from '../ReplyBox';
import SendSvg from '../Icons/SendSvg';
import InputDialog from '../InputDialog';
import ImageGallery from '../ImageGallery/ImageGallery';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const ChatInput = ({
  id = null,
  messageError = null,
  customerPhone = null,
  conversationId = null,
  isInputChanged = false,
  isShowInputDialog = false,
  setSelectedIds,
  setMessageError,
  setIsInputChanged,
  setIsDisableSubmit,
  setIsShowInputDialog,
  setIsSelectingMessage,
  setIsShowMessageDialog,
  setIsSearching,
  fileList = [],
  currentFile = {},
  customerInfo = {},
  selectedReplyMessage = {},
  setFileList,
  setCurrentFile,
  setIsSendNewMessage,
  setSelectedReplyMessage,
}) => {
  const dispatch = useDispatch()
  const textAreaRef = useRef();

  const { actions } = useMessageSlice()

  const isSending = useSelector(state => state.message.isSendingMessage)
  const messageQueue = useSelector(state => state.message.messageQueue)

  const [type, setType] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isOpenGallery, setIsOpenGallery] = useState(false)
  const [isOpenEmojiBox, setIsOpenEmojiBox] = useState(false)
  const [textHeight, setTextHeight] = useState(INITIAL_CHAT_INPUT_HEIGHT)

  useEffect(() => {
    if (messageQueue?.length > 0 && !isSending) {
      sendNextMessage();
    }
  }, [messageQueue, isSending]);

  useEffect(() => {
    if (fileList.length === 0) {
      if (message) {
        setType('text')
      } else {
        setType('')
      }
      setIsOpenGallery(false);
    } else {
      setIsOpenGallery(true);
    }
  }, [fileList, message])

  useEffect(() => {
    if (isOpenGallery) {
      setSubmitting(false)
    }
  }, [isOpenGallery])

  useEffect(() => {
    if (message) {
      const numberOfLines = message.split('\n').length;
      const fontSize = FONT_SIZE_CHAT;
      const lineHeight = LINE_HEIGHT_CHAT_TEXT;
      const calculatedHeight = numberOfLines * fontSize * lineHeight;
      const newHeight = Math.max(Math.ceil(calculatedHeight), INITIAL_CHAT_INPUT_HEIGHT);
      setTextHeight(newHeight);
    } else {
      setTextHeight(INITIAL_CHAT_INPUT_HEIGHT);
    }
  }, [message]);

  useEffect(() => {
    setType('')
    setMessage('')
    setSelectedIds([])
    setMessageError({})
    setSubmitting(false)
    setIsDisableSubmit(false)
    setIsSelectingMessage(false)
    setIsShowMessageDialog(false)
  }, [id])

  const sendNextMessage = () => {
    if (messageQueue.length > 0) {
      try {
        const nextMessage = messageQueue[0];
        const errors = validateSendMessage(nextMessage)
        if (Object.keys(errors).length > 0) {
          setMessageError(errors)
        } else {
          dispatch(actions.sendMessage(nextMessage, onSendSuccess, onError));
          setSubmitting(true)
          setMessageError({})
        }
      } catch (error) {
      }
    }
  }

  const onSendSuccess = () => {
    setType('')
    setMessage('')
    setSelectedIds([])
    setMessageError({})
    setSubmitting(false)
  }

  const onError = () => {
    setSubmitting(false)
    setIsInputChanged(false)
    setIsDisableSubmit(false)
  }

  const handleInputChange = (type, value, e) => {
    if (type) {
      setMessage(value);
      setSubmitting(false);
      setIsInputChanged(!isInputChanged);
    }
  };

  const handleChat = (e) => {
    if (message?.length === 0) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setMessage('');
      setIsSearching(false)
    }
  }

  const handleSendMessage = () => {
    let content;
    if (submitting || (message?.length === 0 && fileList.length === 0) || !type) return;
    //send media
    if (fileList?.length !== 0) {
      fileList?.forEach((item, index) => {
        let filetype = item?.type.split('/')[0]
        if (filetype !== 'image' && filetype !== 'video') {
          filetype = 'document'
          content = {
            type: item?.type.split('/')[0],
            document: { filename: item?.name }
          }
        } else {
          filetype = 'image_video'
          content = {
            type: item?.type.split('/')[0],
          }
        };
        const data = {
          type,
          phone_number: customerPhone,
          content,
          [filetype]: item,
          caption: item?.caption || '',
          status: CHATS.MESSAGE_IS_SENDING,
          sender: CHATS.BUSINESS,
          created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          conversation_id: conversationId,
          index,
          customer_id: +customerInfo?.id || +id,
          customer_name: customerInfo?.name || '',
          customer_phone_number: customerInfo?.phone_number || '',
          reply_sender: selectedReplyMessage ? selectedReplyMessage?.sender : '',
          reply_content: selectedReplyMessage ? selectedReplyMessage?.content : '',
          reply_message_id: selectedReplyMessage ? selectedReplyMessage?.whatsapp_message_id : '',
        };
        dispatch(actions.pushNewMessageToQueueList(data));
      })
    } else {
      //send message
      const data = {
        type,
        message,
        phone_number: customerPhone,
        content: { type, text: { body: message, preview_url: false, } },
        status: CHATS.MESSAGE_IS_SENDING,
        sender: CHATS.BUSINESS,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        conversation_id: conversationId,
        customer_id: +customerInfo?.id || +id,
        customer_name: customerInfo?.name || '',
        customer_phone_number: customerInfo?.phone_number || '',
        reply_sender: selectedReplyMessage ? selectedReplyMessage?.sender : '',
        reply_content: selectedReplyMessage ? selectedReplyMessage?.content : '',
        reply_message_id: selectedReplyMessage ? selectedReplyMessage?.whatsapp_message_id : '',
      };
      dispatch(actions.pushNewMessageToQueueList(data));
    }
    setMessage('');
    setIsOpenEmojiBox(false)
    setIsShowInputDialog(false)
    setFileList([])
    setIsSendNewMessage(true)
    setSelectedReplyMessage({})
  }

  const handleSelectEmoji = (emoji) => {
    setMessage(prev => prev + emoji)
  }
  const handleToggleEmojiBox = () => {
    setIsOpenEmojiBox(!isOpenEmojiBox)
    setIsShowInputDialog(false)
  }
  const handleToggleInputDialog = () => {
    setIsShowInputDialog(!isShowInputDialog)
    setIsOpenEmojiBox(false)
  }

  return (
    <div className="chatInput">
      {isOpenGallery &&
        <div className="chatInput__gallery">
          <ImageGallery
            type={type}
            fileList={fileList}
            setFileList={setFileList}
            message={message}
            setMessage={setMessage}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
          />
        </div>
      }
      <div className="chatInput__innerBox">
        {!isEmptyObject(selectedReplyMessage) && (
          <div className="chatInput__reply">
            <div className="chatInput__reply--replyBox">
              <ReplyBox
                isInputting={true}
                className="replyBox--chatInput"
                message={selectedReplyMessage}
                customerInfo={customerInfo}
              />
            </div>
            <div className="chatInput__reply--icon" onClick={() => setSelectedReplyMessage({})}>
              <img src="/icons/x-mark.svg" alt="close icon" />
            </div>
          </div>
        )}
        {messageError?.message?.length > 0 && (
          <div className="chatInput__errorMessage">
            {messageError.message || ''}
          </div>
        )}
        <div className={`chatInput__box`}>
          {isShowInputDialog && (
            <ClickOutSideWrapper onClickOutside={() => setIsShowInputDialog(false)}>
              <div className="chatInput__dialog">
                <InputDialog
                  setType={setType}
                  setFileList={setFileList}
                  setMessageError={setMessageError}
                  closeInputDialog={() => setIsShowInputDialog(false)}
                />
              </div>
            </ClickOutSideWrapper>
          )}
          <div className="chatInput__box--icon">
            <img
              src={`/icons/${isOpenEmojiBox ? 'close-mark' : 'emoji'}.svg`}
              alt="emoji"
              onClick={handleToggleEmojiBox}
            />
          </div>
          <div className={`chatInput__box--icon${isShowInputDialog ? ' chatInput__box--fileIcon' : ''}`}>
            <img
              src={`/icons/${isShowInputDialog ? 'close-mark' : 'input-plus'}.svg`}
              alt={isShowInputDialog ? 'close-mark' : 'input-plus'}
              onClick={handleToggleInputDialog}
            />
          </div>
          <textarea
            ref={textAreaRef}
            type="text"
            placeholder="Message"
            className="chatInput__input"
            autoFocus={true}
            value={message || ''}
            style={{ height: textHeight }}
            onKeyDown={(e) => handleChat(e)}
            onChange={(e) => handleInputChange('text', e.target.value, e)}
          />
          <div className={`emoji ${isOpenEmojiBox ? 'emoji--open' : ''}`}>
            <Picker theme="light" data={data} onEmojiSelect={(emoji) => handleSelectEmoji(emoji.native)} />
          </div>
          <div
            className="chatInput__button"
            onClick={handleSendMessage}
          >
            <SendSvg />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
