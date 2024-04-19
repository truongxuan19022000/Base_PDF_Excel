import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import quotationOtherFeesSaga from 'src/sagas/quotationOtherFeesSaga';

export const initialState = {
  otherFeesList: [],
  fetched: false,
};

const slice = createSlice({
  name: 'quotationOtherFees',
  initialState,
  reducers: {
    getQuotationOtherFees(state, action) {
    },
    getQuotationOtherFeesSuccess(state, action) {
      if (action?.payload) {
        state.otherFeesList = action.payload || [];
        state.fetched = true;
      }
    },
    handleQuotationOtherFees() {
    },
    handleQuotationOtherFeesSuccess(state, action) {
      if (action?.payload) {
        state.otherFeesList = action.payload?.data;
      }
    },
    handleDragAndDropOtherFees() { },
    handleDragAndDropOtherFeesSuccess(state, action) {
      if (action?.payload) {
        state.otherFeesList = action.payload?.data;
      }
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
  }
})

export const { actions: quotationOtherFeesActions } = slice

export const useQuotationOtherFeesSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationOtherFeesSaga })
  return { actions: slice.actions }
}
