import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import invoiceSaga from 'src/sagas/invoice';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  fetched: false,
  selectedInvoice: {}
};

const slice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    getInvoiceList(state, action) { },
    getInvoiceListSuccess(state, action) {
      state.list = action.payload?.data?.invoices || {}
      state.fetched = true;
    },
    getInvoiceDetail() { },
    getInvoiceDetailSuccess(state, action) {
      if (action?.payload) {
        state.detail = action.payload
      }
    },
    getSelectedInvoice(state, action) {
      state.selectedInvoice = action.payload
    },
    createInvoice() { },
    createInvoiceSuccess(state, action) {
      if (action?.payload && state.list?.data) {
        if (state.list.data.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
      }
    },
    updateInvoice(state, action) { },
    updateInvoiceSuccess(state, action) {
      if (action?.payload && state.list?.data && state.detail?.invoice) {
        const invoiceIndex = state.list.data.findIndex(item => item.id === action.payload?.invoice_id);
        if (invoiceIndex !== -1) {
          state.list.data = state.list.data?.map(item =>
            item.id === action.payload?.invoice_id ? action.payload : item
          );
        }
        const updatedData = {
          id: action.payload?.invoice_id,
          invoice_no: action.payload?.invoice_no,
          quotation_id: action.payload?.quotation_id,
          quotation: {
            id: action.payload?.quotation_id,
            reference_no: action.payload?.reference_no,
            customer_id: action.payload?.customer_id,
            name: action.payload?.customer_name,
            price: action.payload?.price,
            description: action.payload?.description,
          }
        }
        state.detail.invoice = updatedData;
      }
    },
    clearInvoiceList(state, action) {
      state.list.data = {};
      state.fetched = true;
    },
    multiDeleteInvoice() {
    },
    multiDeleteInvoiceSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list?.total) {
        state.list.data = state.list.data.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetched = false;
    },
    getExportInvoiceCSV() { },
    getExportInvoiceCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    clearCSVData(state) {
      state.csvData = {};
    },
  },
})

export const { actions: invoiceActions } = slice

export const useInvoiceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: invoiceSaga })
  return { actions: slice.actions }
}
