import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { useMessageSlice } from 'src/slices/message';
import { CHATS, PAGINATION } from 'src/constants/config';
import { formatFileSize, isEmptyObject } from 'src/helper/helper';

import Loading from '../Loading';
import ChatInput from '../ChatInput';
import ChatHeader from '../ChatHeader';
import MessageForm from '../MessageForm';
import MessageActionForm from '../MessageActionForm';
import DropdownSvg from '../Icons/DropdownSvg';

const ChatWindow = ({
  id,
  messageList = [],
  customerInfo = {},
  customerId = null,
  messageData = {},
  conversationId = null,
  setChatSelectedAction,
  chatSelectedAction = {},
  selectedStarredMessageId = null,
  setIsSearching,
  setIsStarredFound,
  setIsConfirmDeleteMessage,
  setSelectedStarredMessageId,
  setIsShowChatActionConfirmModal,
  setIsConfirmDeleteSelectedMessages,
  isStarredFound = false,
  isShowStarredList = false,
  isConfirmedDeleteMessage = false,
  isShowChatActionConfirmModal = false,
  isConfirmedDeleteSelectedMessages = false,
}) => {
  const { actions } = useMessageSlice()

  const dispatch = useDispatch()
  const scrollableDivRef = useRef(null);
  const starredMessageRef = useRef(null);

  const messageQueue = useSelector(state => state.message.messageQueue)
  const isSearchingStar = useSelector(state => state.message.isSearchingStar)
  const currentConversations = useSelector(state => state.message.currentConversation)
  const searchedMessageData = useSelector(state => state.message.searchedMessageData)

  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])
  const [messageError, setMessageError] = useState({})
  const [isInputChanged, setIsInputChanged] = useState(false)
  const [isDisableSubmit, setIsDisableSubmit] = useState(false)
  const [isShowChatDialog, setIsShowChatDialog] = useState(false)
  const [isFirstMsgStarred, setIsFirstMsgStarred] = useState(false)
  const [isShowInputDialog, setIsShowInputDialog] = useState(false)
  const [isSelectingMessage, setIsSelectingMessage] = useState(false)
  const [isShowMessageDialog, setIsShowMessageDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(PAGINATION.START_PAGE);
  const [fileList, setFileList] = useState([]);
  const [currentFile, setCurrentFile] = useState(0);
  const [unseenMessageCount, setUnseenMessageCount] = useState(0);
  const [selectedReplyMessage, setSelectedReplyMessage] = useState({});

  const [renderList, setRenderList] = useState(messageList || [])
  const [renderListData, setRenderListData] = useState(messageData || {})
  const [isSendNewMessage, setIsSendNewMessage] = useState(false)
  const [isShowScrollButton, setIsShowScrollButton] = useState(false)

  const currentFileExtension = useMemo(() => {
    if (fileList[currentFile]) {
      return fileList[currentFile]?.name.split('.').pop().toLowerCase();
    }
  }, [currentFile, fileList])

  const onError = () => {
    setIsInputChanged(false)
    setIsDisableSubmit(false)
  }

  const onSuccess = () => {
    setSelectedIds([])
    setMessageError({})
    setIsSelectingMessage(false)
  }

  useEffect(() => {
    setUnseenMessageCount(0)
  }, [id])

  useEffect(() => {
    if (currentConversations) {
      dispatch(actions.clearUnseenMessage(conversationId))
      setUnseenMessageCount(prev => prev + currentConversations?.messages_unread_count)
    }
  }, [conversationId, currentConversations, id])

  useEffect(() => {
    setMessageError(null)
    setIsDisableSubmit(false)
  }, [isInputChanged])

  useEffect(() => {
    if (renderListData?.last_page === renderListData?.current_page) {
      setHasMore(false)
    }
    if (!isEmptyObject(renderListData)) {
      setCurrentPage(renderListData?.current_page);
    }
  }, [renderListData])

  useEffect(() => {
    setSelectedIds([])
    setMessageError({})
    setIsDisableSubmit(false)
    setIsSelectingMessage(false)
    setIsShowMessageDialog(false)
    setHasMore(true)
    setCurrentPage(PAGINATION.START_PAGE)
  }, [id])

  useEffect(() => {
    if (!isSelectingMessage) {
      setSelectedIds([])
      setIsDisableSubmit(false)
    }
  }, [isSelectingMessage])

  useEffect(() => {
    if (selectedIds.length > 0) {
      const foundFirstSelectedMsg = messageList.find(message => +message.id === +selectedIds[0])?.starred || 0
      setIsFirstMsgStarred(foundFirstSelectedMsg === CHATS.STARRED)
    } else {
      setIsFirstMsgStarred(false)
    }
  }, [selectedIds, messageList])

  useEffect(() => {
    const handleEscKeyPress = (event) => {
      if (event.key === 'Escape') {
        if (!isShowChatActionConfirmModal && isSelectingMessage) {
          if (isShowChatDialog) {
            setIsShowChatDialog(false)
          } else {
            setIsSelectingMessage(false)
          }
        } else {
          setIsShowChatDialog(false)
        }
      }
    };
    window.addEventListener('keydown', handleEscKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [isShowChatActionConfirmModal, isSelectingMessage, isShowChatDialog]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollableDiv.scrollTop >= -500) {
        setIsShowScrollButton(false);
      } else {
        setIsShowScrollButton(true);
      }
    };
    const scrollableDiv = scrollableDivRef?.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollableDivRef?.current]);

  useEffect(() => {
    if (fileList?.length !== 0) {
      if ((fileList?.length - 1) < currentFile) {
        setCurrentFile(fileList?.length - 1)
      }
    } else {
      setCurrentFile(0)
    }
  }, [fileList, currentFile])

  const isMessageExistedInList = useMemo(() => !!messageList.find(msg => msg.id === selectedStarredMessageId), [selectedStarredMessageId, messageList]);

  const isMessageExistedInSearchedList = useMemo(() => {
    if (selectedStarredMessageId && searchedMessageData) {
      return !!searchedMessageData[selectedStarredMessageId];
    }
    return false;
  }, [selectedStarredMessageId, searchedMessageData]);

  useEffect(() => {
    if (selectedStarredMessageId && isShowStarredList) {
      if (isMessageExistedInList) {
        setRenderList(messageList);
        setRenderListData(messageData);
        handleScrollIntoView();
      } else if (isMessageExistedInSearchedList && searchedMessageData[selectedStarredMessageId]) {
        const searchedData = searchedMessageData[selectedStarredMessageId];
        setRenderList(searchedData?.data);
        setRenderListData(searchedData);
        handleScrollIntoView();
      }
    } else {
      setRenderList(messageList);
      setRenderListData(messageData);
    }
  }, [isShowStarredList, isMessageExistedInList, isMessageExistedInSearchedList, selectedStarredMessageId, messageList, messageData, searchedMessageData, id]);

  useEffect(() => {
    if (!isShowStarredList) {
      setIsStarredFound(false)
      setSelectedStarredMessageId(null)
    }
  }, [isShowStarredList])

  useEffect(() => {
    setIsStarredFound(false)
  }, [selectedStarredMessageId])

  useEffect(() => {
    if (messageList.length > 0 && isShowStarredList && selectedStarredMessageId) {
      if (isMessageExistedInList || isMessageExistedInSearchedList) {
        return
      } else {
        dispatch(actions.getSearchedMessageList({
          customer_id: +id,
          starred: 0,
          message_id: selectedStarredMessageId,
          scroll: CHATS.SCROLL_UP,
        }))
      }
    }
  }, [messageList, isShowStarredList, selectedStarredMessageId, isMessageExistedInList, isMessageExistedInSearchedList, id])

  useEffect(() => {
    if (isSendNewMessage) {
      setSelectedStarredMessageId(null)
      goToBottom()
    }
  }, [isSendNewMessage])

  const fetchMoreData = (page) => {
    if (hasMore) {
      dispatch(actions.getMessageList({ page: page + 1, customer_id: id, starred: 0 }))
    }
  };

  const handleSelectItem = useCallback((itemId) => {
    if (!isSelectingMessage) return;
    if (selectedIds.includes(itemId)) {
      setSelectedIds(selectedIds.filter(id => id !== itemId) || []);
    } else {
      setSelectedIds([...selectedIds, itemId]);
    }
  }, [isSelectingMessage, selectedIds]);

  const handleSelectChatAction = useCallback((actionInfo) => {
    setIsShowChatDialog(false);
    setChatSelectedAction(actionInfo);
    setIsShowChatActionConfirmModal(false);

    switch (actionInfo.action) {
      case CHATS.SELECT_MESSAGE:
        setIsSelectingMessage(true);
        break;
      case CHATS.CLEAR_CHAT:
      case CHATS.DELETE_CHAT:
      case CHATS.DELETE_MESSAGE:
      case CHATS.DELETE_SELECTED_MESSAGES:
        setIsShowChatActionConfirmModal(true);
        break;
      default:
        break;
    }
  }, [isShowChatDialog, isSelectingMessage, chatSelectedAction, isShowChatActionConfirmModal]);

  const handleDeleteMessageInQueue = (index) => {
    dispatch(actions.deleteMessageInQueue(index))
  }

  const firstMessageByDateIdList = useMemo(() => {
    const reverseMessageList = [...messageList].reverse();
    const firstMessageByDateIds = [reverseMessageList[0]?.id];

    let dateOfMessageGroup = dayjs(reverseMessageList[0]?.created_at).format('DD/MM/YYYY');
    reverseMessageList?.forEach((message) => {
      const messageDate = dayjs(message.created_at).format('DD/MM/YYYY');
      if (dateOfMessageGroup !== messageDate) {
        dateOfMessageGroup = messageDate
        firstMessageByDateIds.push(message?.id)
      }
    });
    return firstMessageByDateIds;
  }, [messageList]);

  const handleScrollIntoView = () => {
    if (starredMessageRef?.current && selectedStarredMessageId) {
      starredMessageRef.current.scrollIntoView({
        behavior: (isMessageExistedInList || isMessageExistedInSearchedList) ? 'smooth' : 'instant',
        block: 'center',
      });
      setIsStarredFound(true)
    }
  }

  const goToBottom = () => {
    const scrollableDiv = scrollableDivRef?.current;
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
    }
    setIsSendNewMessage(false)
  };

  const renderGroupMessage = (message, index) => {
    const today = dayjs().format('DD/MM/YYYY');
    const messageDate = dayjs(message?.created_at).format('DD/MM/YYYY');
    const isToday = today === messageDate;
    let isShowDateHeader = firstMessageByDateIdList?.includes(message?.id);
    const isSelectedMsg = +message.id === +selectedStarredMessageId
    return (
      <div className="groupMsg__messages--box" key={index}>
        {isShowDateHeader && (
          <div className="groupMsg__date">
            {isToday ? (
              <span className="groupMsg__date--date groupMsg__date--today">Today</span>
            ) : (
              <span className="groupMsg__date--date">{messageDate}</span>
            )}
          </div>
        )}
        {unseenMessageCount === (index + 1) && (
          <div className="groupMsg__date groupMsg__date--box">
            <span className="groupMsg__date--date groupMsg__date--unread">{unseenMessageCount + ' UNREAD MESSAGE'}</span>
          </div>
        )}
        <div className={`groupMsg__messages--innerBox${isStarredFound ? ' groupMsg__messages--found' : ''}`}>
          <MessageForm
            indexKey={index}
            message={message}
            selectedIds={selectedIds}
            messageList={messageList}
            customerInfo={customerInfo}
            isSelectedMsg={isSelectedMsg}
            isSelectingMessage={isSelectingMessage}
            isShowMessageDialog={isShowMessageDialog}
            customerPhone={customerInfo?.phone_number}
            isConfirmedDeleteMessage={isConfirmedDeleteMessage}
            isShowChatActionConfirmModal={isShowChatActionConfirmModal}
            handleSelectItem={handleSelectItem}
            setMessageError={() => setMessageError()}
            setIsShowMessageDialog={setIsShowMessageDialog}
            setSelectedReplyMessage={setSelectedReplyMessage}
            setIsConfirmDeleteMessage={setIsConfirmDeleteMessage}
            setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
            handleSelectChatAction={() => handleSelectChatAction(CHATS.ACTIONS.DELETE_MESSAGE)}
            selectedStarredMessageId={selectedStarredMessageId}
            setSelectedStarredMessageId={setSelectedStarredMessageId}
          />
          {isSelectedMsg &&
            <div ref={isSelectedMsg ? starredMessageRef : null}></div>
          }
        </div>
      </div>
    );
  };

  const renderMessagesQueue = () => {
    return [...messageQueue]?.filter(msg => msg.conversation_id === currentConversations?.id).reverse()?.map((message, index) => {
      return message ?
        (<div className="groupMsg__messages" key={index}>
          <MessageForm
            message={message}
            isQueueList={true}
            selectedIds={selectedIds}
            customerInfo={customerInfo}
            messageList={messageList}
            customerPhone={customerInfo?.phone_number}
            isSelectingMessage={isSelectingMessage}
            isShowMessageDialog={isShowMessageDialog}
            isConfirmedDeleteMessage={isConfirmedDeleteMessage}
            isShowChatActionConfirmModal={isShowChatActionConfirmModal}
            handleSelectItem={handleSelectItem}
            setMessageError={() => setMessageError()}
            setIsShowMessageDialog={setIsShowMessageDialog}
            setSelectedReplyMessage={setSelectedReplyMessage}
            setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
            handleDeleteMessageInQueue={() => handleDeleteMessageInQueue(index)}
            handleSelectChatAction={() => handleSelectChatAction(CHATS.ACTIONS.DELETE_MESSAGE)}
            selectedStarredMessageId={selectedStarredMessageId}
            setSelectedStarredMessageId={setSelectedStarredMessageId}
          />
        </div>
        ) : null
    })
  };
  return (
    <div className="chatWindow">
      {(fileList?.length !== 0 && fileList[currentFile]) &&
        <div className="fileWindow">
          <div className="fileWindow__header" onClick={() => setFileList([])}>
            <img
              className="fileWindow__close"
              src="/icons/close-mark.svg"
              alt="close"
            />
            <p>{fileList[currentFile]?.name}</p>
          </div>
          <div className="fileWindow__preview">
            {!(fileList[currentFile]?.type?.startsWith('image/') || fileList[currentFile].type.startsWith('video/')) &&
              <>
                <img className="fileWindow__document" src="/images/document.webp" alt={fileList[currentFile]?.name || ''} />
                <p className="fileWindow__previewText fileWindow__previewText--big">There is no preview image</p>
                <p className="fileWindow__previewText">
                  {`${formatFileSize(fileList[currentFile]?.size)} - ${currentFileExtension}`}
                </p>
              </>
            }
            {fileList[currentFile]?.type?.startsWith('image/') &&
              <img src={URL.createObjectURL(fileList[currentFile]) || ''} alt={fileList[currentFile]?.name || ''} />
            }
            {fileList[currentFile].type.startsWith('video/') &&
              <video alt={fileList[currentFile]?.name || ''} preload="metadata" controls="controls">
                <source src={URL.createObjectURL(fileList[currentFile]) || ''} type="video/mp4" />
              </video>
            }
          </div>
        </div>
      }
      <ChatHeader
        customerInfo={customerInfo || null}
        isShowChatDialog={isShowChatDialog}
        setIsShowChatDialog={setIsShowChatDialog}
        handleSelectChatAction={handleSelectChatAction}
      />
      {isSearchingStar && selectedStarredMessageId ?
        <div className="chatBody">
          <div className="chatBody__loading"><Loading /></div>
        </div>
        :
        <div className="chatBody">
          <div
            id="scrollableDiv"
            ref={scrollableDivRef}
            style={{
              height: 'calc(100vh - 260px)',
              flexDirection: 'column-reverse',
              overflowX: 'hidden',
              overflowY: 'auto',
              display: 'flex',
            }}
          >
            <InfiniteScroll
              dataLength={renderList?.length}
              next={() => fetchMoreData(currentPage)}
              hasMore={hasMore}
              loader={<div className="chatBody__loading"><Loading /></div>}
              inverse={true}
              scrollThreshold={0.5}
              className="chatBody__scroll"
              scrollableTarget="scrollableDiv"
              style={{ display: "flex", flexDirection: "column-reverse", minHeight: 'calc(100vh - 260px)' }}
            >
              {renderMessagesQueue()}
              {renderList?.map((message, index) => renderGroupMessage(message, index))}
            </InfiniteScroll>
          </div>
          {isShowScrollButton &&
            <div className="scrollBtnChat" onClick={goToBottom}>
              {unseenMessageCount > 0 &&
                <div className={`scrollBtnChat__unread${unseenMessageCount > 9 ? ' scrollBtnChat__unread--twoNumber' : ''}`}>
                  {unseenMessageCount}
                </div>
              }
              <div className="scrollBtnChat__btn">
                <DropdownSvg />
              </div>
            </div>
          }
        </div>
      }
      <div className="chatBox__input">
        {isSelectingMessage ? (
          <MessageActionForm
            selectedIds={selectedIds}
            customerId={customerId}
            conversationId={conversationId}
            isDisableSubmit={isDisableSubmit}
            isFirstMsgStarred={isFirstMsgStarred}
            isConfirmedDeleteSelectedMessages={isConfirmedDeleteSelectedMessages}
            messageList={(messageList?.length > 0 && messageList) || []}
            onError={onError}
            onSuccess={onSuccess}
            setSelectedIds={setSelectedIds}
            setMessageError={setMessageError}
            setIsDisableSubmit={setIsDisableSubmit}
            setIsSelectingMessage={setIsSelectingMessage}
            handleSelectChatAction={handleSelectChatAction}
            selectedStarredMessageId={selectedStarredMessageId}
            setSelectedStarredMessageId={setSelectedStarredMessageId}
            setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
            setIsConfirmDeleteSelectedMessages={setIsConfirmDeleteSelectedMessages}
          />
        ) : (
          <ChatInput
            id={id}
            messageError={messageError}
            isInputChanged={isInputChanged}
            conversationId={conversationId}
            isShowInputDialog={isShowInputDialog}
            customerPhone={customerInfo?.phone_number}
            selectedReplyMessage={selectedReplyMessage}
            setSelectedIds={setSelectedIds}
            setIsSearching={setIsSearching}
            setMessageError={setMessageError}
            setIsInputChanged={setIsInputChanged}
            setIsDisableSubmit={setIsDisableSubmit}
            setIsShowInputDialog={setIsShowInputDialog}
            setIsSelectingMessage={setIsSelectingMessage}
            setIsShowMessageDialog={setIsShowMessageDialog}
            fileList={fileList}
            currentFile={currentFile}
            customerInfo={customerInfo}
            setFileList={setFileList}
            setCurrentFile={setCurrentFile}
            setIsSendNewMessage={setIsSendNewMessage}
            setSelectedReplyMessage={setSelectedReplyMessage}
          />
        )}
      </div>
    </div>
  )
}

export default ChatWindow
