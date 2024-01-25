import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import inventorySaga from 'src/sagas/inventory';

export const initialState = {
  list: {},
  detail: {},
  fetched: false,
};

const slice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    getInventoryList(state, action) { },
    getInventoryListSuccess(state, action) {
      state.list = action.payload?.data?.inventories || {}
      state.fetched = true;
    },
    getInventoryDetail(state, action) { },
    getInventoryDetailSuccess(state, action) {
      state.detail = action.payload
      state.fetched = true;
    },
    createInventory(state, action) { },
    createInventorySuccess(state, action) {
      if (state.list.data && action.payload?.data) {
        state.list.data.inventories = [...state.list?.data?.inventories, action.payload?.data]
        state.fetched = true;
      }
    },
    updateInventory(state, action) { },
    updateInventorySuccess(state, action) {
      if (state.list?.data?.inventories && action.payload?.inventory_id) {
        state.list.data.inventories = {
          ...state.list.data.inventories,
          inventories: state.list.data?.inventories?.map(item =>
            item.id === action.payload.inventory_id ? action.payload : item
          ),
        }
      }
    },
    multiDeleteInventory(state, action) { },
    multiDeleteInventorySuccess(state, action) {
      if (action?.payload) {
        state.list.data = state.list?.data.filter((item) => !action.payload.includes(item.id));
        state.fetched = true;
      }
    },
    clearInventoryList(state, action) {
      state.list.data = {};
      state.fetched = true;
    }
  },
})

export const { actions: inventoryActions } = slice

export const useInventorySlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: inventorySaga })
  return { actions: slice.actions }
}
