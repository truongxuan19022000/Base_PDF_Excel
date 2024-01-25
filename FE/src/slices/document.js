import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import documentSaga from 'src/sagas/document';

export const initialState = {
  list: {},
  csvData: {},
  fetched: false,
};

const slice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    uploadDocument() { },
    uploadDocumentSuccess(state, action) {
      if (action?.payload && state.list?.data) {
        if (state.list.data.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
      }
    },
    multiDeleteDocument() { },
    multiDeleteDocumentSuccess(state, action) {
      state.fetched = false;
    },
  },
})

export const { actions: documentActions } = slice

export const useDocumentSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: documentSaga })
  return { actions: slice.actions }
}
