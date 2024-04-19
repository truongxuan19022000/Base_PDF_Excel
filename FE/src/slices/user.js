import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import { getToken } from 'src/helper/helper';

import userSaga from 'src/sagas/user';
import { SELECT_NOTIFICATION_TYPES } from 'src/constants/config';

export const initialState = {
  user: {},
  list: {},
  detail: {},
  csvData: {},
  fetched: false,
  fetchedList: false,
  isCurrentUserUpdated: false,
  isLoggedIn: !!getToken('access_token'),
  notifications: {},
  notificationsCount: 0,
  messages: [],
  permissionData: [],
  unseenMessagesCount: 0
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) { },
    loginSuccess(state, action) {
      if (action?.payload) {
        state.user = action.payload.user_information;
        state.permissionData = action.payload.user_information?.permission || [];
        state.isLoggedIn = true;
      }
    },
    logout(state, action) {
      state.user = {};
      state.list = {};
      state.detail = {};
      state.isLoggedIn = false;
    },
    logoutSuccess(state, action) { },
    getUser(state, action) { },
    getUserSuccess(state, action) {
      if (action.payload?.data) {
        state.user = action.payload.data;
        state.permissionData = action.payload.data?.permission || [];
        state.isCurrentUserUpdated = false;
      }
    },
    forgotPassword(state, action) { },
    forgotPasswordSuccess(state, action) {
    },
    resetPassword(state, action) { },
    resetPasswordSuccess(state, action) {
    },
    getUserList(state, action) { },
    getUserListSuccess(state, action) {
      state.list = action.payload?.data?.users || {}
      state.fetchedList = true;
    },
    getUserDetail(state, action) { },
    getUserDetailSuccess(state, action) {
      if (action?.payload) {
        state.detail = action.payload
      }
    },
    createUser(state, action) {
    },
    createUserSuccess(state, action) {
      const res = action?.payload
      if (res) {
        const newData = {
          id: res.id,
          name: res.name,
          email: res.email,
          role_id: res.role_id,
          username: res.username,
          role_name: res.role_name,
        };
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(newData);
        state.list.total++
        state.fetchedList = false;
      }
    },
    multiDeleteUser() {
    },
    multiDeleteUserSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list?.total) {
        state.list.data = state.list.data?.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetchedList = false;
    },
    updateUser() {
    },
    updateUserSuccess(state, action) {
      if (state.list?.data && action?.payload) {
        const updatedPayload = {
          id: Number(action.payload.user_id),
          name: action.payload.name || '',
          email: action.payload.email || '',
          role_id: action.payload.role_id || '',
          username: action.payload.username || '',
          role_name: action.payload.role_name || '',
        };
        state.list.data = state.list?.data?.map((item) =>
          item.id === updatedPayload.id ? updatedPayload : item
        )
        state.fetchedList = false;
      }
    },
    setIsCurrentUserUpdated(state, action) {
      state.isCurrentUserUpdated = true;
    },
    getExportUserCSV() { },
    getExportUserCSVSuccess() {
    },
    resetFetchedList(state) {
      state.fetched = false;
      state.fetchedList = false;
    },
    getNotifications() { },
    getNotificationsSuccess(state, action) {
      state.notifications = action.payload.notifications
      state.notificationsCount = action.payload.notifications_count
    },
    updateNotificationsStatus() { },
    updateNotificationsStatusSuccess(state, action) {
      if (action.payload.type === SELECT_NOTIFICATION_TYPES.SINGLE.id) {
        state.notifications.data = state.notifications.data.filter(item => item.id !== action.payload.notification_id)
        state.notificationsCount--
      } else {
        state.notifications.data = []
        state.notificationsCount = 0
      }
    },
    getMessages() { },
    getMessagesSuccess(state, action) {
      state.messages = action.payload?.conversations?.data || []
      state.unseenMessagesCount = action.payload?.unread_message_count || 0
    },
    pushNewNotificationToList(state, action) {
      state.notifications.data = [action.payload, ...state.notifications.data]
      state.notificationsCount++
    },
    pushNewMessageToList(state, action) {
      const isFirstCustomer = state.messages[0]?.customer.id === action.payload.customer.id
      if (isFirstCustomer) {
        state.messages = [action.payload, ...state.messages.slice(1)];
      } else {
        state.messages = [action.payload, ...state.messages]
      }
      state.unseenMessagesCount++
    },
    updateMessagesStatus(state, action) { },
    updateMessagesStatusSuccess(state, action) {
      state.messages = state.messages.filter(item => item.conversation_id !== action.payload.conversation_id)
      state.unseenMessagesCount--
    },
  },
})

export const { actions: userActions } = slice

export const useUserSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: userSaga })
  return { actions: slice.actions }
}
