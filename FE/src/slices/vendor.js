import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import vendorSaga from 'src/sagas/vendor';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  fetched: false,
  isLoading: false,
};

const slice = createSlice({
  name: 'vendor',
  initialState,
  reducers: {
    getVendorList(state, action) { },
    getVendorListSuccess(state, action) {
      state.list = action?.payload?.vendors || [];
      state.fetched = true;
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
    clearCSVData(state) {
      state.csvData = {};
    },
    deleteVendor(state, action) { },
    deleteVendorSuccess(state, action) {
      state.fetched = false;
    },
    deleteMultiVendor(state, action) { },
    deleteMultiVendorSuccess(state, action) {
      state.fetched = false;
    },
    getVendorDetail() { },
    getVendorDetailSuccess(state, action) {
      state.detail = action?.payload;
    },
    createVendor() { },
    createVendorSuccess(state, action) {
      state.fetched = false
    },
    updateVendor() { },
    updateVendorSuccess(state, action) {
      if (state.detail?.activities && action?.payload) {
        const {
          logsInfo,
          address_1: address1,
          address_2: address2,
          ...restOfData
        } = action.payload;
        state.detail.activities = [logsInfo, ...state.detail.activities];
        state.detail.vendor = restOfData;
      }
      state.fetched = false;
    },
    clearDetailData(state) {
      state.detail = {};
    },
    getExportVendorCSV() { },
    getExportVendorCSVSuccess(state, action) {
    },
  }
})

export const { actions: vendorActions } = slice

export const useVendorSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: vendorSaga })
  return { actions: slice.actions }
}
