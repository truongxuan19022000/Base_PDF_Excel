import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import documentSaga from 'src/sagas/document';

export const initialState = {
  list: {},
  csvData: {},
  fetched: false,
  isLoading: false,
};

const slice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    uploadDocument(state) {
      state.isLoading = true;
    },
    uploadDocumentSuccess(state, action) {
      if (action?.payload && state.list?.data) {
        if (state.list.data.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
      }
      state.isLoading = false;
    },
    multiDeleteDocument() { },
    multiDeleteDocumentSuccess(state, action) {
      state.fetched = false;
    },
    resetLoadingStatus(state) {
      state.isLoading = false;
    }
  },
})

export const { actions: fileActions } = slice

export const useFileSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: documentSaga })
  return { actions: slice.actions }
}
