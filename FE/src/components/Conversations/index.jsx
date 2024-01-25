import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { CHATS } from 'src/constants/config';
import { normalizeString } from 'src/helper/helper';
import { useMessageSlice } from 'src/slices/message';
import { useCustomerSlice } from 'src/slices/customer';

import ChatList from '../ChatList';
import StarredList from '../StarredList';
import ChatSearchBox from '../ChatSearchBox';
import ChatSearchResults from '../ChatSearchResults';
import ClickOutSideWrapper from 'src/hook/ClickOutSideWrapper';

const Conversations = ({
  chatList = [],
  chatData = {},
  selectedCustomer = {},
  isSearching = false,
  isStarredFound = false,
  isShowStarredList = false,
  chatSelectedAction = false,
  isShowChatActionConfirmModal = false,
  selectedStarredMessageId = null,
  handleSelectedCustomer,
  setIsSearching,
  setIsStarredFound,
  setIsShowStarredList,
  setSelectedStarredMessageId,
  setChatSelectedAction,
  setIsShowChatActionConfirmModal,
  setSelectedConversationActionId,
  setSelectedCustomerChatId,
}) => {
  const { actions } = useMessageSlice()
  const { actions: customerActions } = useCustomerSlice()

  const dispatch = useDispatch()

  const isLoading = useSelector(state => state.message.isLoading)
  const foundConversations = useSelector(state => state.message.searchedData)
  const isSearchingCustomer = useSelector(state => state.message.isSearching)
  const isSearchingConversation = useSelector(state => state.message.isSearching)
  const foundCustomers = useSelector(state => state.customer.searchedData?.data) || []

  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isShowDialog, setIsShowDialog] = useState(false);
  const [isShowStarredDialog, setIsShowStarredDialog] = useState(false);
  const [searchConversationText, setSearchConversationText] = useState('');

  useEffect(() => {
    if (!isSearching) {
      setSearchConversationText('')
    }
  }, [isSearching])

  useEffect(() => {
    if (!isShowStarredList) {
      setIsShowStarredDialog(false)
      if (chatSelectedAction.action === CHATS.UN_STAR_ALL) {
        setChatSelectedAction({})
      }
    }
  }, [isShowStarredList, chatSelectedAction])

  useEffect(() => {
    const handleEscKeyPress = (event) => {
      if (event.key === 'Escape') {
        if (!isShowChatActionConfirmModal && isShowStarredDialog) {
          setIsShowStarredDialog(false)
        } else {
          setIsShowChatActionConfirmModal(false)
        }
      }
    };
    window.addEventListener('keydown', handleEscKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [isShowChatActionConfirmModal, isShowStarredDialog]);

  const handleSearch = (text) => {
    if (text?.length > 0) {
      dispatch(customerActions.getSearchCustomerList({ search: text }));
      dispatch(actions.getSearchConversationList({ search: text }));
      setIsSearching(true)
    }
  }

  const handleInputChange = (e) => {
    const text = e.target.value;
    setSearchConversationText(normalizeString(text))

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTypingTimeout = setTimeout(() => {
      if (text.trim() === '') {
        dispatch(customerActions.clearSearchedData());
        dispatch(actions.clearSearchedData());
      } else {
        handleSearch(normalizeString(text));
      }
    }, 500);
    setTypingTimeout(newTypingTimeout);
  }

  const handleCloseSearch = () => {
    setIsSearching(false)
    setSearchConversationText('')
    dispatch(customerActions.clearSearchedData());
    dispatch(actions.clearSearchedData());
  }

  const handleSelectConversationAction = useCallback((actionInfo) => {
    setChatSelectedAction(actionInfo);
    if (actionInfo.action === CHATS.DELETE_CHAT) {
      setIsShowChatActionConfirmModal(true);
    }
  }, [chatSelectedAction, isShowChatActionConfirmModal]);

  const handleClickShowStarDialog = () => {
    setIsShowStarredList(true)
    setIsShowDialog(false)
  }

  const handlePinChat = (chat) => {
    const data = {
      conversation_id: chat?.id,
      is_pinned: chat?.is_pinned === CHATS.PINNED ? CHATS.UN_PINNED : CHATS.PINNED,
    }
    dispatch(actions.pinChatConversation({ ...data }))
  }

  const handleSelectUnStarAll = () => {
    setIsShowStarredDialog(false)
    setChatSelectedAction(CHATS.UN_STAR_ACTION)
    setIsShowChatActionConfirmModal(true)
  }

  return (
    <div className="conversations">
      {isShowStarredList ? (
        <StarredList
          isLoading={isLoading}
          selectedCustomer={selectedCustomer}
          selectedStarredMessageId={selectedStarredMessageId}
          setIsShowStarredList={setIsShowStarredList}
          setIsShowStarredDialog={setIsShowStarredDialog}
          handleSelectedCustomer={handleSelectedCustomer}
          setSelectedStarredMessageId={setSelectedStarredMessageId}
          setSelectedConversationActionId={setSelectedConversationActionId}
          setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
          isStarredFound={isStarredFound}
          setIsStarredFound={setIsStarredFound}
          isShowStarredList={isShowStarredList}
        />) : (
        <>
          <div className="conversations__search">
            <ChatSearchBox
              isSearching={isSearching}
              isShowDialog={isShowDialog}
              isSearchingCustomer={isSearchingCustomer}
              searchConversationText={searchConversationText}
              isSearchingConversation={isSearchingConversation}
              setIsShowDialog={setIsShowDialog}
              handleCloseSearch={handleCloseSearch}
              handleInputChange={handleInputChange}
            />
          </div>
          <div className="conversation">
            {isSearching ? (
              <ChatSearchResults
                foundCustomers={foundCustomers || []}
                foundConversations={foundConversations || []}
                handleSelectedCustomer={handleSelectedCustomer}
                isSearching={isSearching}
                isSearchingCustomer={isSearchingCustomer}
                searchConversationText={searchConversationText}
                isSearchingConversation={isSearchingConversation}
              />
            ) : (
              <ChatList
                chatList={chatList}
                chatData={chatData}
                isLoading={isLoading}
                selectedCustomer={selectedCustomer}
                handlePinChat={handlePinChat}
                handleSelectedCustomer={handleSelectedCustomer}
                setSelectedCustomerChatId={setSelectedCustomerChatId}
                handleSelectConversationAction={handleSelectConversationAction}
                setSelectedConversationActionId={setSelectedConversationActionId}
                setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
              />
            )}
          </div>
        </>
      )}
      {isShowDialog && (
        <div className="conversations__dialog">
          <ClickOutSideWrapper onClickOutside={() => setIsShowDialog(false)}>
            <div
              className="conversations__dialog--item"
              onClick={handleClickShowStarDialog}
            >
              Starred messages
            </div>
          </ClickOutSideWrapper>
        </div>
      )}
      {isShowStarredDialog && (
        <div className="conversations__dialog">
          <ClickOutSideWrapper onClickOutside={() => setIsShowStarredDialog(false)}>
            <div
              className="conversations__dialog--item"
              onClick={handleSelectUnStarAll}
            >
              Unstar all
            </div>
          </ClickOutSideWrapper>
        </div>
      )}
    </div>
  )
}

export default Conversations
