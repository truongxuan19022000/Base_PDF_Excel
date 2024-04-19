import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import materialSaga from 'src/sagas/material';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  allMaterial: {},
  fetched: false,
  allFetched: false,
  isLoading: false,
  isUploading: false,
};

const slice = createSlice({
  name: 'material',
  initialState,
  reducers: {
    getMaterialList(state, action) { },
    getMaterialListSuccess(state, action) {
      state.list = action.payload?.data?.materials || {}
      state.fetched = true;
    },
    getExportMaterialCSV() { },
    getExportMaterialCSVSuccess() { },
    clearCSVData(state) {
    },
    multiDeleteMaterial() { },
    multiDeleteMaterialSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list.total) {
        state.list.data = state.list?.data.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetched = false;
      state.allFetched = false;
    },
    getMaterialDetail(state, action) {
      state.isLoading = true;
    },
    getMaterialDetailSuccess(state, action) {
      state.detail = action?.payload;
      state.isLoading = false;
    },
    updateMaterialDetail() {
    },
    updateMaterialDetailSuccess(state, action) {
      if (!action?.payload) return;
      const payload = action.payload;
      state.detail.materials = payload;
      state.allFetched = false;
      if (state.list.data) {
        state.list.data = state.list.data.map(item =>
          item.id === payload.id ? payload : item
        );
      }
    },
    createMaterialItem(state, action) {
    },
    createMaterialItemSuccess(state, action) {
      if (action?.payload && state.list.data) {
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
        state.allFetched = false;
      }
    },
    getAllMaterialList(state, action) { },
    getAllMaterialListSuccess(state, action) {
      if (action?.payload) {
        state.allMaterial = action.payload;
        state.allFetched = true;
      }
    },
    resetFetchedList(state, action) {
      state.fetched = false;
    },
    handleUploadCSVFile(state, action) {
      state.isUploading = true;
    },
    handleUploadCSVFileSuccess(state, action) {
      state.fetched = false;
      state.isUploading = false;
    },
    resetUploadingStatus(state) {
      state.isUploading = false;
    }
  },
})

export const { actions: materialActions } = slice

export const useMaterialSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: materialSaga })
  return { actions: slice.actions }
}
