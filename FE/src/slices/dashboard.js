import { createSlice } from '@reduxjs/toolkit'
import { useInjectReducer, useInjectSaga } from '../utils/redux-injector'

import { dashboardSaga } from '../sagas/dashboard'

export const initialState = {
  dash: 'board',
  salesRevenueData: {},
  messages: [],
  conversation: {},
  unseenMessagesCount: 0,
  fetched: false,
}

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    initDashboard() { },
    initDashboardSuccess() { },
    getSalesRevenue(state, action) { },
    getSalesRevenueSuccess(state, action) {
      state.salesRevenueData = action.payload || {}
    },
    getMessages(state, action) { },
    getMessagesSuccess(state, action) {
      if (action?.payload) {
        const payloadData = action.payload.conversations || {};
        const updatedChatList = [...state.messages];
        payloadData.data?.forEach(chat => {
          const existingChatIndex = updatedChatList.findIndex(existingChat => existingChat.id === chat.id);
          if (existingChatIndex !== -1) {
            if (chat.latest_message?.created_at > updatedChatList[existingChatIndex].latest_message?.created_at) {
              updatedChatList[existingChatIndex] = chat;
            }
          } else {
            updatedChatList.push(chat);
          }
        });

        state.unseenMessagesCount = action.payload?.unread_message_count || 0
        state.messages = updatedChatList;
        state.fetched = true;
      }
    },
    pushNewMessageToList(state, action) {
      const foundCustomer = state.messages.find(item => item.customer.id === action.payload.customer.id)
      if (foundCustomer) {
        state.messages = [
          {
            ...foundCustomer,
            messages_unread_count: foundCustomer.messages_unread_count++ || 1,
            latest_message: action.payload.latest_message,
          },
          ...state.messages.filter(item => item.customer.id !== foundCustomer.customer.id)
        ];
        state.unseenMessagesCount++
      }
    },
    updateMessagesStatusSuccess(state, action) {
      state.messages = state.messages.filter(item => item.id !== action.payload.id)
      state.unseenMessagesCount--
    },
  },
})

export const { actions: dashboardActions } = slice

export const useDashboardSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: dashboardSaga })
  return { actions: slice.actions }
}
