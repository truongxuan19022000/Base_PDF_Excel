import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import messageSaga from 'src/sagas/message';

import { CHATS } from 'src/constants/config';

export const initialState = {
  messages: [],
  chatDetail: {},
  messageData: {},
  messageQueue: [],
  searchedData: [],
  conversations: [],
  starredMessages: [],
  conversationData: {},
  starredMessageData: {},
  currentConversation: {},
  searchedMessageList: [],
  searchedMessageData: {},
  isLoading: false,
  isSearching: false,
  isLoadingStar: false,
  fetchedMessage: false,
  isSearchingStar: false,
  isSendingMessage: false,
  isFetchingNextPage: false,
  fetchedConversation: false,
  isFetchedStarredMessage: false,
  isFetchingNextConversation: false,
};
const slice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    getConversationList(state) {
      state.isLoading = true;
      const chatInfo = state.conversationData
      if (chatInfo?.current_page > 1) {
        state.isFetchingNextConversation = true;
      }
    },
    getConversationListSuccess(state, action) {
      const payloadData = action.payload?.data?.conversations?.data || [];
      const updatedChatList = [...state.conversations];
      payloadData.forEach(chat => {
        const existingChatIndex = updatedChatList.findIndex(existingChat => existingChat.id === chat.id);
        if (existingChatIndex !== -1) {
          if (chat.latest_message?.created_at > updatedChatList[existingChatIndex].latest_message?.created_at) {
            updatedChatList[existingChatIndex] = chat;
          }
        } else {
          updatedChatList.push(chat);
        }
      });
      state.conversations = updatedChatList;
      state.conversationData = action.payload?.data?.conversations || {}
      state.fetchedConversation = true;
      if (action.payload?.data?.conversations?.current_page > 1) {
        state.isFetchingNextConversation = false;
      }
      state.isLoading = false;
    },
    getConversationWithCustomerId(state) {
      state.isLoading = true;
    },
    getConversationWithCustomerIdSuccess(state, action) {
      if (action?.payload) {
        const payloadData = action?.payload || {};
        const updatedData = {
          id: payloadData?.conversation_id,
          customer: {
            ...payloadData?.customer,
            id: payloadData?.customer_id,
          },
          customer_id: payloadData?.customer_id,
          messages_unread_count: 0,
        }
        state.chatDetail = updatedData;
        state.fetchedConversation = true;

        let updatedChatList = [...state.conversations];
        let pinnedConversations = updatedChatList.filter(item => item.is_pinned);
        let unpinnedConversations = updatedChatList.filter(item => !item.is_pinned);
        unpinnedConversations.unshift(updatedData);
        updatedChatList = pinnedConversations.concat(unpinnedConversations);
        state.conversations = updatedChatList;
      }
      state.isLoading = false;
    },
    getMessageList(state) {
    },
    getMessageListSuccess(state, action) {
      const msgPayload = action.payload?.data?.messages?.data || [];
      const updatedMessages = [...state.messages];
      msgPayload.forEach(msg => {
        const existingMsgIndex = updatedMessages.findIndex(existingMsg => existingMsg.id === msg.id);
        if (existingMsgIndex !== -1) {
          if (msg.updated_at > updatedMessages[existingMsgIndex].updated_at) {
            updatedMessages[existingMsgIndex] = msg;
          }
        } else {
          updatedMessages.push(msg);
        }
      });
      updatedMessages.sort((a, b) => {
        return b.id - a.id;
      });
      state.fetchedMessage = true;
      state.messages = updatedMessages;
      state.messageData = action.payload?.data?.messages || {};
    },
    sendMessage(state, action) {
      state.isSendingMessage = true;
    },
    sendMessageSuccess(state, action) {
      if (action?.payload) {
        const payload = action?.payload;
        state.messages = [payload, ...state.messages];
        state.isSendingMessage = false;
        if (state.messageQueue.length > 0) {
          state.messageQueue = state.messageQueue.slice(1);
        }
      }
    },
    reactionSuccess(state, action) {
      if (action?.payload) {
        state.messages.map(item => {
          if (item.id === action?.payload?.id) {
            item.reaction_by_business = action?.payload?.emoji;
          }
          return item
        })
      }
    },
    multiDeleteMessage() { },
    multiDeleteMessageSuccess(state, action) {
      if (action?.payload) {
        const payload = action?.payload;
        state.messages = state.messages?.filter(msg => !payload?.message_id?.includes(msg?.id));
        const updatedLatestMessage = payload.latest_message;
        const updatedConversation = state.conversations?.find(cvs => cvs.id === payload?.conversation_id);
        if (updatedLatestMessage.id !== updatedConversation?.latest_message?.id) {
          const clonedConversations = [...state.conversations];
          const conversationIndex = clonedConversations.findIndex(cvs => cvs.id === payload?.conversation_id);
          clonedConversations[conversationIndex].latest_message = updatedLatestMessage;
          state.conversations = clonedConversations;
        }
        state.isFetchedStarredMessage = false;
        state.starredMessages = state.starredMessages?.filter(msg => !payload?.message_id?.includes(msg?.id));

        let updatedSearchedList = { ...state.searchedMessageData };

        payload?.message_id?.forEach(searchKey => {
          if (Object.hasOwnProperty.call(updatedSearchedList, searchKey)) {
            delete updatedSearchedList[searchKey];
          }
        });

        for (const searchKeyId in updatedSearchedList) {
          if (Object.hasOwnProperty.call(updatedSearchedList, searchKeyId)) {
            const messageData = updatedSearchedList[searchKeyId]?.data || [];
            const updatedData = messageData.filter(msg => !payload?.message_id?.includes(msg?.id));
            updatedSearchedList[searchKeyId].data = updatedData;
          }
        }

        state.searchedMessageData = updatedSearchedList;
      }
    },
    multiStarredMessage() { },
    multiStarredMessageSuccess(state, action) {
      if (action?.payload) {
        const payload = action?.payload;
        const changedMessageIds = payload?.message_id || [];
        const changedValue = payload?.starred;
        state.messages = state.messages?.map(msg => {
          if (changedMessageIds.includes(msg.id)) {
            return { ...msg, starred: changedValue };
          }
          return msg;
        });
        if (changedValue === CHATS.STARRED) {
          let updatedList = [...state.starredMessages];
          state.messages
            .filter(msg => changedMessageIds.includes(msg.id))
            .forEach(msg => {
              const existingMessage = updatedList.find(existingMsg => existingMsg.id === msg.id);
              if (!existingMessage) {
                updatedList.push(msg);
              }
            });
          updatedList.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
          });
          state.starredMessages = updatedList;
        } else {
          state.starredMessages = state.starredMessages?.filter(msg => !changedMessageIds.includes(msg.id));
        }
        let updatedSearchedList = { ...state.searchedMessageData };
        for (const searchKeyId in updatedSearchedList) {
          if (Object.hasOwnProperty.call(updatedSearchedList, searchKeyId)) {
            let updatedStarData = updatedSearchedList[searchKeyId]?.data || [];
            updatedStarData = updatedStarData?.map(msg => {
              if (changedMessageIds.includes(msg.id)) {
                return { ...msg, starred: changedValue };
              }
              return msg;
            });
            updatedSearchedList[searchKeyId].data = updatedStarData;
          }
        }
        state.searchedMessageData = updatedSearchedList;
      }
    },
    cleanChatConversation() { },
    cleanChatConversationSuccess(state, action) {
      if (action?.payload) {
        const payload = action?.payload;
        state.messages = state.messages?.filter(msg => Number(msg.conversation_id) !== Number(payload?.conversation_id));
        state.starredMessages = state.starredMessages?.filter(msg => Number(msg.conversation_id) !== Number(payload?.conversation_id));
        const updatedConversation = state.conversations?.find(cvs => cvs.id === payload?.conversation_id);
        if (updatedConversation) {
          const conversationIndex = state.conversations.findIndex(cvs => cvs.id === payload?.conversation_id);
          if (conversationIndex !== -1) {
            state.conversations[conversationIndex].latest_message = [];
          }
        }
      }
    },
    deleteChatConversation() { },
    deleteChatConversationSuccess(state, action) {
      if (action?.payload) {
        const payload = action.payload?.data;
        state.messages = state.messages?.filter(msg => Number(msg.conversation_id) !== Number(payload?.conversation_id));
        state.starredMessages = state.starredMessages?.filter(msg => Number(msg.conversation_id) !== Number(payload?.conversation_id));
        state.conversations = state.conversations?.filter(cvs => cvs.id !== payload?.conversation_id);
        state.isFetchedStarredMessage = false;
      }
    },
    setIsMessageSending(state, action) {
      state.isSendingMessage = true;
    },
    resetFetchedMessage(state) {
      state.fetchedMessage = false;
    },
    resetFetchedConversation(state) {
      state.fetchedConversation = false;
    },
    pushNewMessageToList(state, action) {
      const payload = action?.payload;
      if (!payload) return;

      if (+state.currentConversation?.id !== +payload.conversation_id) {
        state.conversations.map(item => item?.id === +payload?.conversation_id ? item.messages_unread_count++ : item)
      } else {
        if (state.currentConversation?.messages_unread_count >= 0) {
          state.currentConversation.messages_unread_count++
        }
      }
      const checkMessageIsExist = state.messages.find(item =>
        item?.id === payload?.id
      )
      if (checkMessageIsExist) {
        state.messages = state.messages?.map(
          item => item?.id === payload?.id ? payload : item
        )
      } else {
        state.messages = [payload, ...state.messages];
        const updatedLatestMessage = {
          id: payload?.id,
          status: payload?.status,
          content: payload?.content,
          created_at: payload?.created_at,
          reply_sender: payload?.reply_sender,
          reply_content: payload?.reply_content,
          conversation_id: Number(payload?.conversation_id),
        }
        const conversationIndex = state.conversations.findIndex(cvs => cvs.id === payload?.conversation_id);
        if (conversationIndex !== -1) {
          const updatedConversation = state.conversations[conversationIndex];
          updatedConversation.latest_message = updatedLatestMessage;
          if (updatedConversation.is_pinned === CHATS.PINNED) {
            state.conversations.splice(conversationIndex, 1);
            state.conversations.unshift(updatedConversation);
          } else {
            const unpinnedConversations = state.conversations.filter(item => !item.is_pinned);
            const updatedUnpinnedConversations = [...unpinnedConversations];
            const existingIndex = updatedUnpinnedConversations.findIndex(item => item.id === updatedConversation.id);

            if (existingIndex !== -1) {
              updatedUnpinnedConversations.splice(existingIndex, 1);
              updatedUnpinnedConversations.unshift(updatedConversation);
            } else {
              updatedUnpinnedConversations.unshift(updatedConversation);
            }
            state.conversations = state.conversations.filter(item => item.is_pinned).concat(updatedUnpinnedConversations);
          }
        }
      }
    },
    pushNewMessageToQueueList(state, action) {
      if (action?.payload) {
        const payload = action.payload;
        state.messageQueue = [...state.messageQueue, payload];
        const updatedLatestMessage = {
          id: payload?.id,
          status: payload?.status,
          content: payload?.content,
          reply_sender: payload?.reply_sender,
          reply_content: payload?.reply_content,
          created_at: payload?.created_at,
          conversation_id: Number(payload?.conversation_id),
        };
        const conversationIndex = state.conversations.findIndex(cvs => cvs.id === payload?.conversation_id);
        if (conversationIndex !== -1) {
          const updatedConversation = state.conversations[conversationIndex];
          updatedConversation.latest_message = updatedLatestMessage;
          if (updatedConversation.is_pinned === CHATS.PINNED) {
            state.conversations.splice(conversationIndex, 1);
            state.conversations.unshift(updatedConversation);
          } else {
            const unpinnedConversations = state.conversations.filter(item => !item.is_pinned);
            const updatedUnpinnedConversations = [...unpinnedConversations];
            const existingIndex = updatedUnpinnedConversations.findIndex(item => item.id === updatedConversation.id);

            if (existingIndex !== -1) {
              updatedUnpinnedConversations.splice(existingIndex, 1);
              updatedUnpinnedConversations.unshift(updatedConversation);
            } else {
              updatedUnpinnedConversations.unshift(updatedConversation);
            }
            state.conversations = state.conversations.filter(item => item.is_pinned).concat(updatedUnpinnedConversations);
          }
        }
      }
    },
    setSearchingStatus(state) {
      state.isSearching = true;
    },
    getSearchConversationList(state, action) {
      state.isSearching = true;
    },
    getSearchConversationListSuccess(state, action) {
      const payloadData = action.payload?.data?.conversations?.data || [];
      const filteredData = payloadData.filter(chat => chat.latest_message);
      filteredData.sort((a, b) => {
        const dateA = new Date(a.latest_message.created_at).getTime();
        const dateB = new Date(b.latest_message.created_at).getTime();
        return dateA - dateB;
      });
      state.searchedData = filteredData || []
      state.isSearching = false;
    },
    clearSearchedData(state) {
      state.searchedData = []
    },
    clearChatDetail(state) {
      state.chatDetail = {}
    },
    clearUnseenMessage(state, action) {
      state.conversations = state.conversations?.map(item => {
        if (item?.id === action?.payload && item?.messages_unread_count > 0) {
          item.messages_unread_count = 0
        }
        return item;
      })
    },
    setCurrentConversation(state, action) {
      state.currentConversation = action.payload
    },
    setLoadingStatus(state) {
      state.isLoading = true;
    },
    setLoadingCompletedStatus(state) {
      state.isLoading = false;
    },
    deleteMessageInQueue(state, action) {
      if (state.messageQueue?.length > 0 && action?.payload !== undefined) {
        state.messageQueue = state.messageQueue.filter((_, i) => i !== action?.payload);
      }
    },
    sendMessageFailed(state, action) {
      if (action?.payload) {
        const payload = action?.payload;
        state.messages = [payload, ...state.messages];
        state.isSendingMessage = false;
        if (state.messageQueue.length > 0) {
          state.messageQueue = state.messageQueue.slice(1);
        }
      }
    },
    deleteFailedMessage(state, action) {
      state.messages = state.messages?.filter((_, i) => i !== action?.payload);
      state.starredMessages = state.starredMessages?.filter((_, i) => i !== action?.payload);
    },
    getStarredMessageList(state) {
      state.isLoadingStar = true;
    },
    getStarredMessageListSuccess(state, action) {
      const payloadData = action.payload?.data?.messages || {};
      const updatedList = [...state.starredMessages];
      payloadData?.data?.forEach(message => {
        const existingMsgIndex = updatedList.findIndex(existingMsg => existingMsg.id === message.id);
        if (existingMsgIndex !== -1) {
          if (message.latest_message?.updated_at > updatedList[existingMsgIndex].latest_message?.updated_at) {
            updatedList[existingMsgIndex] = message;
          }
        } else {
          updatedList.push(message);
        }
      });
      state.isLoadingStar = false;
      state.starredMessages = updatedList;
      state.starredMessageData = payloadData;
      state.isFetchedStarredMessage = true;
    },
    unStarredAllMessages() {
    },
    unStarredAllMessagesSuccess(state) {
      state.starredMessageData = {};
      state.starredMessages = [];
      if (state.messages.length > 0) {
        state.messages = state.messages.map(msg => ({ ...msg, starred: 0 }))
      }
    },
    pinChatConversation() {
    },
    pinChatConversationSuccess(state, action) {
      if (action?.payload) {
        const { conversation_id, is_pinned } = action.payload;
        let updatedChatList = [...state.conversations];
        const chatIndex = updatedChatList.findIndex(chat => chat.id === conversation_id);
        if (chatIndex !== -1) {
          let updatedChat = updatedChatList[chatIndex];
          updatedChat.is_pinned = is_pinned;
          if (is_pinned === CHATS.PINNED) {
            updatedChatList.splice(chatIndex, 1);
            updatedChatList.unshift(updatedChat);
          } else {
            let pinnedConversations = updatedChatList.filter(item => item.is_pinned);
            let unpinnedConversations = updatedChatList.filter(item => !item.is_pinned);
            unpinnedConversations.sort((a, b) => {
              const dateA = a.latest_message?.created_at ? new Date(a.latest_message.created_at).getTime() : a.id;
              const dateB = b.latest_message?.created_at ? new Date(b.latest_message.created_at).getTime() : b.id;
              return dateB - dateA;
            });
            updatedChatList = pinnedConversations.concat(unpinnedConversations);
          }
          state.conversations = updatedChatList;
        }
      }
    },
    updateCustomerName(state, action) {
      if (action?.payload) {
        state.conversations = state.conversations.map(chat =>
          chat.customer?.id === action.payload.id ? { ...chat, customer: action.payload } : chat
        );
      }
    },
    getSearchedMessageList(state, action) {
      state.isSearchingStar = true;
    },
    getSearchedMessageListSuccess(state, action) {
      const payload = action?.payload;
      if (!payload) return;
      const dataPayload = payload?.data || {};
      const msgPayload = payload?.data?.data || [];
      const messageId = payload?.messageId;
      const isExistSearchedMsg = !!state.searchedMessageData[messageId];
      state.isSearchingStar = false;
      if (isExistSearchedMsg) {
        let updatedSearchedListMsg = [...state.searchedMessageData[messageId]?.data?.data];
        msgPayload.forEach(msg => {
          const existingMsgIndex = updatedSearchedListMsg.findIndex(existingMsg => existingMsg.id === msg.id);
          if (existingMsgIndex !== -1) {
            if (msg.updated_at > updatedSearchedListMsg[existingMsgIndex].updated_at) {
              updatedSearchedListMsg[existingMsgIndex] = msg;
            }
          } else {
            updatedSearchedListMsg.push(msg);
          }
        });
        updatedSearchedListMsg.sort((a, b) => {
          return b.id - a.id;
        });
        state.searchedMessageData[messageId].data = dataPayload;
        state.searchedMessageData[messageId].data.data = updatedSearchedListMsg;
      } else {
        state.searchedMessageData = {
          ...state.searchedMessageData,
          [messageId]: { ...dataPayload },
        };
      }
    },
    deleteChatWithCustomerId(state, action) {
      if (action?.payload) {
        state.messages = state.messages?.filter(msg => !action.payload.includes(msg?.customer_id))
        state.conversations = state.conversations?.filter(chat => !action.payload.includes(chat?.customer_id))
        state.starredMessages = state.starredMessages?.filter(msg => !action.payload.includes(msg?.customer_id))
      }
    },
  },
})

export const { actions: messageActions } = slice

export const useMessageSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: messageSaga })
  return { actions: slice.actions }
}
