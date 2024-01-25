import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { CHATS } from 'src/constants/config';
import { isEmptyObject } from 'src/helper/helper';
import { useMessageSlice } from 'src/slices/message';

import Loading from '../Loading';
import StarredItemForm from '../StarredItemForm';
import ArrowLeftSvg from '../Icons/ArrowLeftSvg';
import DisplayCustomerImage from '../DisplayCustomerImage';

const StarredList = ({
  isShowStarredList = false,
  isShowStarredDialog = false,
  selectedStarredMessageId = null,
  setIsShowStarredList,
  setIsShowStarredDialog,
  handleSelectedCustomer,
  setSelectedStarredMessageId,
  setIsStarredFound,
}) => {
  const { actions } = useMessageSlice()
  const dispatch = useDispatch()

  const starredList = useSelector(state => state.message.starredMessages)
  const starredMessageData = useSelector(state => state.message.starredMessageData)
  const isLoadingStarredList = useSelector(state => state.message.isLoadingStar)
  const fetched = useSelector(state => state.message.isFetchedStarredMessage)

  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    dispatch(actions.getStarredMessageList({ page: 1 }))
  }, [])

  useEffect(() => {
    if (!fetched && starredList?.length > 0) {
      dispatch(actions.getStarredMessageList({ page: 1 }))
    }
  }, [fetched, starredList])

  useEffect(() => {
    if (starredList.length < CHATS.MAX_CHAT_SHOW && hasMore && currentPage === 1) {
      setTimeout(() => {
        dispatch(actions.getStarredMessageList({ page: currentPage + 1 }))
      }, 200)
    }
  }, [currentPage, hasMore, starredList])

  useEffect(() => {
    if (!isEmptyObject(starredMessageData)) {
      if (starredMessageData?.last_page === starredMessageData?.current_page) {
        setHasMore(false)
      }
      if (starredMessageData?.current_page) {
        setCurrentPage(starredMessageData?.current_page);
      }
    }
  }, [starredMessageData])

  const fetchMoreData = (page) => {
    if (hasMore) {
      dispatch(actions.getStarredMessageList({ page: page + 1 }))
    }
  };

  const handlePickStarredMessage = (customerInfo, messageId) => {
    setIsStarredFound(false)
    handleSelectedCustomer(customerInfo)
    setSelectedStarredMessageId(messageId)
    if (selectedStarredMessageId === messageId) {
      setSelectedStarredMessageId('')
      setTimeout(() => {
        setSelectedStarredMessageId(messageId)
      }, 100)
    }
  }

  const renderStarredList = () => {
    return starredList.map((message, index) => {
      const status = CHATS.STATUS.find(status => +status.value === +message?.status) || null;
      const formattedTime = message?.created_at ? dayjs(message?.created_at).format('HH:mm') : '';
      const formattedDayTime = message?.created_at ? dayjs(message?.created_at).format('MMMM D, YYYY h:mm A') : '';
      const formattedDate = formattedDayTime ? dayjs(formattedDayTime).fromNow() : '';
      const isAdmin = message?.sender === 0
      const customerInfo = {
        id: message.customer_id || null,
        name: message.customer_name || '',
        phone_number: message.customer_phone_number || '',
      }
      return (
        <div
          key={index}
          className="starredList__item"
          onClick={() => handlePickStarredMessage(customerInfo, +message.id)}
        >
          <div className="starredList__senderItem">
            <div className="senderInfo">
              <div className="senderInfo__avatar">
                <DisplayCustomerImage
                  width={26}
                  height={26}
                  fontSize="11px"
                  username={message.customer_name}
                />
              </div>
              {isAdmin ? (
                <div className="senderInfo__title">
                  <p>You</p>
                  <span>
                    <img
                      className="senderInfo__title--icon"
                      src="/icons/triangle-right.svg"
                      alt="icon"
                      width="12"
                      height="12"
                    />
                  </span>
                  <p className="senderInfo__title--name">
                    {message?.customer_name ?
                      message.customer_name : (message?.customer_phone_number || 'Customer')
                    }
                  </p>
                </div>
              ) : (
                <div className="senderInfo__title">
                  <p className="senderInfo__title--name">
                    {message?.customer_name ?
                      message.customer_name : (message?.customer_phone_number || 'Customer')
                    }
                  </p>
                  <span>
                    <img
                      className="senderInfo__title--icon"
                      src="/icons/triangle-right.svg"
                      alt="icon"
                      width="12"
                      height="12"
                    />
                  </span>
                  <p>You</p>
                </div>
              )}
            </div>
            <div className="starredList__senderItem--time">
              <p className="message__textTime--date">{formattedDate}</p>
            </div>
          </div>
          <div className="starredList__senderItem--body">
            <div className="starredList__senderItem--innerBox">
              <StarredItemForm
                status={status}
                message={message}
                customerInfo={customerInfo}
                formattedTime={formattedTime}
                className="starredItem"
              />
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className={`starredList${isShowStarredList ? '' : ' starredList--hidden'}`}>
      <div className="starredList__header">
        <div className="starredList__title">
          <span onClick={() => setIsShowStarredList(false)}><ArrowLeftSvg /></span>
          <span>Starred messages</span>
        </div>
        <div
          className={`starredList__star${isShowStarredDialog ? ' starredList__star--active' : ''}`}
          onClick={() => setIsShowStarredDialog(!isShowStarredDialog)}
        >
          <img src="/icons/more-icon.svg" alt="more-icon" />
        </div>
      </div>
      <div className="starredList__content">
        {(starredList.length !== 0) ? (
          <div className="starredList__list">
            <div className="starredList__listWrapper" id="chat_scroll">
              <InfiniteScroll
                dataLength={starredList?.length}
                next={() => fetchMoreData(currentPage)}
                hasMore={hasMore}
                style={{
                  height: '100%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: "column",
                }}
                loader={<div className="starredList__chatList--loading"><Loading /></div>}
                scrollableTarget="chat_scroll"
                endMessage={
                  <p className="starredList__endMessageText">
                    <b>You have seen all of starred messages.</b>
                  </p>
                }
              >
                {renderStarredList()}
              </InfiniteScroll>
            </div>
          </div>
        ) : (
          <>
            {isLoadingStarredList && (
              <div className="starredList__noData">
                <Loading />
              </div>
            )}
          </>
        )}
        {(starredList.length === 0 && !isLoadingStarredList) && (
          <div className="starredList__noData">
            <span>
              No starred messages.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StarredList
