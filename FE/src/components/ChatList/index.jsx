import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch, useSelector } from 'react-redux';

import { isEmptyObject } from 'src/helper/helper';
import { CHATS, PAGINATION } from 'src/constants/config';
import { useMessageSlice } from 'src/slices/message';

import Loading from '../Loading';
import ConversationForm from '../ConversationForm';

const ChatList = ({
  chatList = [],
  chatData = {},
  isLoading = false,
  selectedCustomer = {},
  handlePinChat,
  handleSelectedCustomer,
  setSelectedCustomerChatId,
  handleSelectConversationAction,
  setSelectedConversationActionId,
  setIsShowChatActionConfirmModal,
}) => {
  const { actions } = useMessageSlice()
  const dispatch = useDispatch()

  const isFetchingNextConversation = useSelector(state => state.message.isFetchingNextConversation)

  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(PAGINATION.START_PAGE);

  useEffect(() => {
    if (!isEmptyObject(chatData)) {
      if (chatData?.last_page === chatData?.current_page) {
        setHasMore(false)
      }
      if (chatData?.current_page) {
        setCurrentPage(chatData?.current_page);
      }
    }
  }, [chatData])

  useEffect(() => {
    if (!isEmptyObject(chatData) && (chatData?.last_page === chatData?.current_page)) {
      setHasMore(false)
    }
  }, [chatData])

  useEffect(() => {
    if (isFetchingNextConversation && chatList.length < CHATS.MAX_CHAT_SHOW && hasMore) {
      dispatch(actions.getConversationList({ page: currentPage + 1 }))
    }
  }, [currentPage, hasMore, chatList])

  const fetchMoreData = (page) => {
    if (hasMore) {
      dispatch(actions.getConversationList({ page: page + 1 }))
    }
  };

  const renderChat = () => {
    return chatList.map((conversation, index) => (
      <div className="chatList__item" key={index}>
        <ConversationForm
          conversation={conversation}
          selectedCustomer={selectedCustomer}
          handlePinChat={handlePinChat}
          handleSelectedCustomer={handleSelectedCustomer}
          setSelectedCustomerChatId={setSelectedCustomerChatId}
          setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
          handleSelectConversationAction={handleSelectConversationAction}
          setSelectedConversationActionId={setSelectedConversationActionId}
        />
      </div>
    ));
  }

  return (
    <div className="chatList">
      <div className="chatList__content">
        {(chatList.length !== 0) ? (
          <div className="chatList__chatList">
            <div className="chatList__chatListWrapper" id="conversation_scroll">
              <InfiniteScroll
                dataLength={chatList?.length}
                next={() => fetchMoreData(currentPage)}
                hasMore={hasMore}
                style={{
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: "column",
                }}
                loader={<div className="chatList__chatList--loading"><Loading /></div>}
                scrollableTarget="conversation_scroll"
                endMessage={
                  <p className="chatList__endMessageText">
                    <b>You have seen all of chat list.</b>
                  </p>
                }
              >
                <div className="chatList__listBox">
                  {renderChat()}
                </div>
              </InfiniteScroll>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="chatList__noData">
                <Loading />
              </div>
            )}
          </>
        )}
        {(chatList.length === 0 && !isLoading) && (
          <div className="chatList__noData">
            <span>
              There was no conversation.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatList
