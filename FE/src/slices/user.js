import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import { getToken } from 'src/helper/helper';

import userSaga from 'src/sagas/user';

export const initialState = {
  user: {},
  list: {},
  detail: {},
  csvData: {},
  fetched: false,
  fetchedList: false,
  fetchedDetail: false,
  isUserUpdated: false,
  isLoggedIn: !!getToken('access_token'),
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) { },
    loginSuccess(state, action) {
      if (action?.payload) {
        state.user = action.payload?.user_information
        state.isLoggedIn = true;
      }
    },
    logout(state, action) {
      state.user = {};
      state.list = {};
      state.detail = {};
      state.fetched = false;
      state.isLoggedIn = false;
    },
    logoutSuccess(state, action) { },
    getUser(state, action) { },
    getUserSuccess(state, action) {
      if (action.payload?.data) {
        state.user = action.payload.data;
        state.isUserUpdated = false;
        state.fetched = true;
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
        state.fetchedDetail = true;
      }
    },
    createUser(state, action) {
      state.fetchedList = true;
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
      }
    },
    clearUserList(state, action) {
      state.list = {};
      state.fetchedList = true;
    },
    setIsUserUpdated(state, action) {
      state.isUserUpdated = true;
    },
    setIsFetchedList(state, action) {
      state.fetchedList = action?.payload || false;
    },
    getExportUserCSV() { },
    getExportUserCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    clearCSVUserData(state) {
      state.csvData = {};
    },
  },
})

export const { actions: userActions } = slice

export const useUserSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: userSaga })
  return { actions: slice.actions }
}
