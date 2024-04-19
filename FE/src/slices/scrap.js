import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import scrapSaga from 'src/sagas/scrap';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  scrapList: [],
  selectedScrap: {},
  fetched: false,
  isLoading: false,
};

const slice = createSlice({
  name: 'scrap',
  initialState,
  reducers: {
    getScrapList(state, action) { },
    getScrapListSuccess(state, action) {
      state.scrapList = action?.payload?.scraps || [];
      state.fetched = true;
    },
    setSelectedScrapItem(state, action) {
      state.selectedScrap = action.payload;
    },
    resetScrapList(state, action) {
      state.scrapList = [];
    },
    resetSelectedScrapItem(state, action) {
      state.selectedScrap = {};
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
    getExportScrapCSV(state, action) { },
    getExportScrapCSVSuccess(state, action) {
      state.csvData = action?.payload;
    },
    clearCSVData(state) {
      state.csvData = {};
    },
    getScraps(state) {
      state.isLoading = true;
    },
    getScrapsSuccess(state, action) {
      state.list = action?.payload || {}
      state.fetched = true;
      state.isLoading = false;
    },
    deleteScrap(state, action) { },
    deleteScrapSuccess(state, action) { },
    deleteMultiScrap(state, action) { },
    deleteMultiScrapSuccess(state, action) { },
    getScrapDetail() { },
    getScrapDetailSuccess(state, action) {
      state.detail = action?.payload;
    },
    updateScrap() { },
    updateScrapSuccess() { },
    handleExportCSVToMail() { },
  }
})

export const { actions: scrapActions } = slice

export const useScrapSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: scrapSaga })
  return { actions: slice.actions }
}
