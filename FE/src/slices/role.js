import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import roleSaga from 'src/sagas/role';

export const initialState = {
  list: {},
  roles: [],
  detail: {},
  csvData: {},
  permissions: {},
  currentRoleSetting: {},
  fetched: false,
  fetchedDetail: false,
  roleStatusChange: false,
};

const slice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    getRoleList(state, action) { },
    getRoleListSuccess(state, action) {
      state.list = action.payload?.data?.roles || {};
      state.fetched = true;
      state.roleStatusChange = false;
    },
    getRoleDetail(state, action) { },
    getRoleDetailSuccess(state, action) {
      if (action.payload) {
        state.detail = action.payload
        state.fetchedDetail = true;
        state.roleStatusChange = false;
      }
    },
    createRole(state, action) { },
    createRoleSuccess(state, action) {
      const newData = action.payload?.data;
      if (newData !== null && newData !== undefined) {
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(newData);
        state.list.total++
        state.fetched = true;
        state.roleStatusChange = true;
        state.createRole = {};
      }
    },
    multiDeleteRole(state, action) { },
    multiDeleteRoleSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list?.total) {
        state.list.data = state.list.data?.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetched = false;
    },
    updateRole() { },
    updateRoleSuccess(state, action) {
      if (action?.payload) {
        const updatedData = action.payload;
        state.detail = updatedData;

        const updatedRoleList = state.list.data ? [...state.list.data] : []
        const foundRoleIndex = updatedRoleList.findIndex(item => item.id === Number(updatedData.role_id));

        if (foundRoleIndex !== -1) {
          updatedRoleList[foundRoleIndex].id = updatedData.role_id;
          updatedRoleList[foundRoleIndex].role_name = updatedData.role_name;
        }

        state.list.data = updatedRoleList;
        state.createRole = {};
      }
    },
    setCurrentRoleSetting(state, action) {
      if (action?.payload) {
        state.currentRoleSetting = action?.payload
      }
    },
    clearCurrentRoleSetting(state) {
      state.createRole = {};
    },
    setRoleStatusChange(state) {
      state.roleStatusChange = true;
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
    getExportRoleCSV() { },
    getExportRoleCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    clearCSVRoleData(state) {
      state.csvData = {};
    },
    getAllRoles(state, action) { },
    getAllRolesSuccess(state, action) {
      state.roles = action?.payload?.roles || [];
    },
  },
})

export const { actions: roleActions } = slice

export const useRoleSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: roleSaga })
  return { actions: slice.actions }
}
