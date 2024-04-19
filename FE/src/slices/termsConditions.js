import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import termsConditionsSaga from 'src/sagas/termsConditions';

export const initialState = {
  termsConditions: [],
  fetched: false,
};

const slice = createSlice({
  name: 'termsConditions',
  initialState,
  reducers: {
    getTermsConditions(state, action) {
    },
    getTermsConditionsSuccess(state, action) {
      if (action?.payload) {
        state.termsConditions = action.payload || [];
        state.fetched = true;
      }
    },
    handleTermsConditions() { },
    handleTermsConditionsSuccess(state, action) {
      if (action?.payload) {
        state.termsConditions = action.payload;
      }
    },
    handleDragAndDrop() { },
    handleDragAndDropSuccess(state, action) {
      if (action?.payload) {
        state.termsConditions = action.payload;
      }
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
  }
})

export const { actions: termsConditionsActions } = slice

export const useTermsConditionsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: termsConditionsSaga })
  return { actions: slice.actions }
}
