import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { isEmptyObject } from 'src/helper/helper';
import { useMessageSlice } from 'src/slices/message';
import { useCustomerSlice } from 'src/slices/customer';
import { validateDeleteMessage } from 'src/helper/validation';
import { CHATS } from 'src/constants/config';

import Loading from 'src/components/Loading';
import ChatWindow from 'src/components/ChatWindow';
import Conversations from 'src/components/Conversations';
import ChatActionConfirmModal from 'src/components/ChatActionConfirmModal';

const Chats = () => {
  const { id } = useParams()
  const { actions } = useMessageSlice()
  const { actions: customerActions } = useCustomerSlice()

  const history = useHistory()
  const dispatch = useDispatch()

  const messages = useSelector(state => state.message.messages)
  const isLoading = useSelector(state => state.message.isLoading)
  const chatDetail = useSelector(state => state.message.chatDetail)
  const messageData = useSelector(state => state.message.messageData)
  const conversations = useSelector(state => state.message.conversations)
  const initialCustomer = useSelector(state => state.customer.selectedCustomer)
  const conversationData = useSelector(state => state.message.conversationData)
  const fetchedConversation = useSelector(state => state.message.fetchedConversation)

  const [submitting, setSubmitting] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [messageError, setMessageError] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const [chatSelectedAction, setChatSelectedAction] = useState({})
  const [messageListWithCustomer, setMessageListWithCustomer] = useState([])
  const [selectedStarredMessageId, setSelectedStarredMessageId] = useState('');
  const [isShowChatActionConfirmModal, setIsShowChatActionConfirmModal] = useState(false)
  const [selectedConversationActionId, setSelectedConversationActionId] = useState(null);
  const [isConfirmedDeleteMessage, setIsConfirmDeleteMessage] = useState(false)
  const [isConfirmedDeleteSelectedMessages, setIsConfirmDeleteSelectedMessages] = useState(false)
  const [isStarredFound, setIsStarredFound] = useState(false);
  const [isShowStarredList, setIsShowStarredList] = useState(false);
  const [selectedCustomerChatId, setSelectedCustomerChatId] = useState({});

  const onSuccess = () => {
    setMessageError({})
    setSubmitting(false)
  }

  const onError = (data) => {
    setSubmitting(false)
    setMessageError(data)
  }

  useEffect(() => {
    if (!fetchedConversation) {
      dispatch(actions.getConversationList())
    }
  }, [fetchedConversation])
  useEffect(() => {
    if (id) {
      dispatch(actions.getMessageList({
        customer_id: Number(id),
        starred: CHATS.MESSAGE.ALL_MESS
      }))
    }
  }, [id])
  useEffect(() => {
    if (!isEmptyObject(messages) && conversationId) {
      const msgWithCustomer = messages.filter(msg => +msg.conversation_id === +conversationId)
      setMessageListWithCustomer(msgWithCustomer)
      dispatch(actions.setLoadingCompletedStatus())
    }
  }, [messages, conversationId])
  useEffect(() => {
    if (!isShowChatActionConfirmModal) {
      setChatSelectedAction({})
    }
  }, [isShowChatActionConfirmModal])
  useEffect(() => {
    if (isEmptyObject(selectedCustomer) && !isEmptyObject(chatDetail)) {
      setSelectedCustomer(chatDetail?.customer)
    }
  }, [selectedCustomer, chatDetail])
  useEffect(() => {
    if (id && conversations.length > 0) {
      const foundConversation = conversations.find(item => +id === +item.customer_id) || {};
      if (!isEmptyObject(foundConversation)) {
        setConversationId(foundConversation.id);
        setSelectedCustomer(foundConversation.customer);
        dispatch(actions.setCurrentConversation(foundConversation));
      } else {
        dispatch(actions.getConversationWithCustomerId({ customer_id: +id, starred: CHATS.MESSAGE.ALL_MESS }));
      }
    }
  }, [id, conversations]);
  useEffect(() => {
    return () => {
      dispatch(actions.setCurrentConversation({}));
    }
  }, [])
  useEffect(() => {
    const handleEscKeyPress = (event) => {
      if (event.key === 'Escape' && isShowChatActionConfirmModal) {
        setIsShowChatActionConfirmModal(false)
      }
    };
    window.addEventListener('keydown', handleEscKeyPress);
    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, [isShowChatActionConfirmModal]);

  const handleSelectedCustomer = (customerInfo) => {
    if (!customerInfo?.id || customerInfo?.id === +id) return;
    if (customerInfo && Object.keys(customerInfo).length > 0) {
      setSelectedCustomer(customerInfo)
      dispatch(actions.setLoadingStatus())
      if (customerInfo.id) {
        history.push(`/customers/chats/${customerInfo.id}`)
      }
    }
    if (!isEmptyObject(initialCustomer)) {
      dispatch(customerActions.clearSelectedCustomer())
    }
  }

  const handleCleanChat = () => {
    if (submitting) return;
    dispatch(actions.cleanChatConversation({ conversation_id: conversationId, onSuccess, onError }))
    setSubmitting(true)
    setMessageError({})
    setChatSelectedAction({})
    setIsShowChatActionConfirmModal(false)
  }

  const handleDeleteChatConversation = () => {
    if (submitting) return;
    const data = { conversation_id: selectedConversationActionId }
    const errors = validateDeleteMessage(data)
    if (Object.keys(errors).length > 0) {
      setMessageError(errors)
    } else {
      dispatch(actions.deleteChatConversation({ data: data, onSuccess, onError }))
      setSelectedCustomer(null)
      setSubmitting(true)
      setMessageError({})
      setChatSelectedAction({})
      setIsShowChatActionConfirmModal(false)
      if (+id === +selectedCustomerChatId) {
        history.push('/customers/chats')
      }
    }
  }
  const handleClickUnStarredAllMessages = () => {
    dispatch(actions.unStarredAllMessages())
    setIsShowChatActionConfirmModal(false)
    setChatSelectedAction({})
  }

  const handleClickApply = (actionType) => {
    switch (actionType) {
      case CHATS.DELETE_CHAT:
        handleDeleteChatConversation();
        break;
      case CHATS.CLEAR_CHAT:
        handleCleanChat();
        break;
      case CHATS.DELETE_MESSAGE:
        setIsConfirmDeleteMessage(true);
        break;
      case CHATS.DELETE_SELECTED_MESSAGES:
        setIsConfirmDeleteSelectedMessages(true);
        break;
      case CHATS.UN_STAR_ALL:
        handleClickUnStarredAllMessages();
        break;
      default:
        return null;
    }
  };

  return (
    <div className="chats">
      <div className="chats__left">
        <Conversations
          id={id}
          chatList={conversations}
          isSearching={isSearching}
          chatData={conversationData}
          selectedCustomer={selectedCustomer}
          selectedStarredMessageId={selectedStarredMessageId}
          setIsSearching={setIsSearching}
          handleSelectedCustomer={handleSelectedCustomer}
          setSelectedStarredMessageId={setSelectedStarredMessageId}
          setChatSelectedAction={setChatSelectedAction}
          setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
          setSelectedConversationActionId={setSelectedConversationActionId}
          isShowStarredList={isShowStarredList}
          setIsShowStarredList={setIsShowStarredList}
          isStarredFound={isStarredFound}
          setIsStarredFound={setIsStarredFound}
          setSelectedCustomerChatId={setSelectedCustomerChatId}
        />
      </div>
      <div className="chats__right">
        {(conversationId) ? (
          <ChatWindow
            id={id}
            isSearching={isSearching}
            messageData={messageData}
            conversationId={conversationId}
            customerInfo={selectedCustomer}
            messageList={messageListWithCustomer}
            chatSelectedAction={chatSelectedAction}
            isConfirmedDeleteMessage={isConfirmedDeleteMessage}
            isShowChatActionConfirmModal={isShowChatActionConfirmModal}
            isConfirmedDeleteSelectedMessages={isConfirmedDeleteSelectedMessages}
            setIsSearching={setIsSearching}
            setChatSelectedAction={setChatSelectedAction}
            setIsConfirmDeleteMessage={setIsConfirmDeleteMessage}
            setIsShowChatActionConfirmModal={setIsShowChatActionConfirmModal}
            setIsConfirmDeleteSelectedMessages={setIsConfirmDeleteSelectedMessages}
            isShowStarredList={isShowStarredList}
            setIsShowStarredList={setIsShowStarredList}
            isStarredFound={isStarredFound}
            setIsStarredFound={setIsStarredFound}
            selectedStarredMessageId={selectedStarredMessageId}
            setSelectedStarredMessageId={setSelectedStarredMessageId}
          />
        ) : (
          <div className="chats__noData">
            {isLoading && (
              <div className="chats__noData--customer">
                <Loading />
              </div>
            )}
            {!isLoading && !id && (
              <div className="chats__noData--content">
                Please select a conversation.
              </div>
            )}
          </div>
        )}
      </div>
      {(isShowChatActionConfirmModal && !isEmptyObject(chatSelectedAction)) && (
        <ChatActionConfirmModal
          isShow={isShowChatActionConfirmModal}
          action={chatSelectedAction}
          onClickActionApply={handleClickApply}
          closeModal={() => setIsShowChatActionConfirmModal(false)}
        />
      )}
    </div>
  )
}

export default Chats
