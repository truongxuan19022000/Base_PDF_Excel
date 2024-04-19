import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';

import invoiceSaga from 'src/sagas/invoice';
import dayjs from 'dayjs';

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
        state.list.data.unshift({
          ...action.payload,
          issue_date: action.payload.origin_date
        });
        state.list.total++
      }
    },
    updateInvoice(state, action) { },
    updateInvoiceSuccess(state, action) {
      if (action?.payload && state.detail?.invoice) {
        const payload = action.payload;
        const { invoice } = state.detail;

        if (state.list?.data) {
          const invoiceIndex = state.list.data.findIndex(item => item.id === payload.invoice_id);
          if (invoiceIndex !== -1) {
            state.list.data = state.list.data?.map(item =>
              item.id === payload.invoice_id ? payload : item
            );
          }
        }

        const updatedInvoice = {
          ...invoice,
          invoice_no: payload.invoice_no,
          quotation: payload.quotation,
          quotation_id: payload.quotation_id,
          issue_date: dayjs(payload.issue_date).format('DD/MM/YYYY'),
        }

        if (payload.payment_received_date) {
          updatedInvoice.payment_received_date = dayjs(payload.payment_received_date).format('DD/MM/YYYY')
        }

        state.detail.invoice = updatedInvoice;
        state.detail.activities = [payload.logsInfo, ...state.detail.activities];
      }
    },
    clearInvoiceList(state, action) {
      state.list.data = {};
      state.fetched = false;
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
    clearCSVData(state) {
      state.csvData = {};
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
    clearInvoiceDetail(state, action) {
      state.detail = {}
    },
    getExportInvoiceCSV() { },
    getExportInvoiceCSVSuccess(state, action) {
      if (state.detail?.activities && action?.payload) {
        state.detail.activities = [action.payload, ...state.detail.activities];
      }
    },
    downloadInvoicePDF() { },
    downloadInvoicePDFSuccess(state, action) {
      if (state.detail?.activities && action?.payload) {
        state.detail.activities = [action.payload, ...state.detail.activities];
      }
    },
    updateDetailTax(state, action) {
      if (state.detail?.invoice?.tax && action?.payload) {
        state.detail.invoice.tax = action.payload;
      }
    },
    sendInvoicePDF(state, action) { }
  },
})

export const { actions: invoiceActions } = slice

export const useInvoiceSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: invoiceSaga })
  return { actions: slice.actions }
}
