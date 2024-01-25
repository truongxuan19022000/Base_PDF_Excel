import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import quotationNoteSaga from 'src/sagas/quotationNote';

export const initialState = {
  notes: [],
  fetched: false,
};

const slice = createSlice({
  name: 'quotationNote',
  initialState,
  reducers: {
    getQuotationNotes(state, action) {
    },
    getQuotationNotesSuccess(state, action) {
      if (action?.payload) {
        state.notes = action.payload?.data?.quotation_notes || [];
        state.fetched = true;
      }
    },
    handleQuotationNote() {
    },
    handleQuotationNoteSuccess(state, action) {
      if (action?.payload) {
        state.notes = action.payload?.data;
      }
    },
    handleDragAndDropNote() { },
    handleDragAndDropNoteSuccess(state, action) {
      if (action?.payload) {
        state.notes = action.payload?.data;
      }
    },
  }
})

export const { actions: quotationNoteActions } = slice

export const useQuotationNoteSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationNoteSaga })
  return { actions: slice.actions }
}
