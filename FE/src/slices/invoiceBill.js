import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import invoiceBillSaga from 'src/sagas/invoiceBill';

import { formatPriceWithTwoDecimals } from 'src/helper/helper';

export const initialState = {
  invoiceBills: [],
  invoiceBillData: {}
};

const slice = createSlice({
  name: 'invoiceBill',
  initialState,
  reducers: {
    getInvoiceBills(state, action) { },
    getInvoiceBillsSuccess(state, action) {
      if (action?.payload) {
        state.invoiceBillData = action.payload
        const billSchedules = action.payload.bill_schedules ?
          action.payload.bill_schedules.map(item => ({
            ...item,
            amount: formatPriceWithTwoDecimals(item.amount)
          }))
          : []
        state.invoiceBills = billSchedules
      }
    },
    handleDragAndDropBill(state, action) { },
    handleDragAndDropBillSuccess(state, action) {
      if (action?.payload) {
        state.invoiceBills = action.payload;
      }
    },
    handleBill(state, action) { },
    handleBillSuccess(state, action) {
      if (action?.payload) {
        state.invoiceBills = action.payload;
      }
    },
    updateTax(state, action) { },
    updateTaxSuccess(state, action) {
      if (state.invoiceBillData && action?.payload) {
        state.invoiceBillData.tax = action.payload.gst_rates;
      }
    },
  },
})

export const { actions: invoiceBillActions } = slice

export const useInvoiceBillSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: invoiceBillSaga })
  return { actions: slice.actions }
}
