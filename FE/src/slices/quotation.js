import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import dayjs from 'dayjs';

import quotationSaga from 'src/sagas/quotation';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  quotationAll: [],
  searchedData: [],
  quotationList: [],
  quotationData: {},
  fetched: false,
  fetchedAll: false,
  isSearching: false,
  totalOtherFees: 0,
  discount: 0,
  bottomBarData: {
    quotationCost: 17288.30, // this is quotationCost demo
    total: 0,
    discountType: {},
    estimatedCost: 0,
    discountPercent: 0,
  },
};

const slice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    getQuotationList(state, action) {
    },
    getQuotationListSuccess(state, action) {
      state.list = action.payload?.data?.quotations || {}
      state.fetched = true;
      state.isSearching = false;
    },
    createQuotation(state, action) {
    },
    createQuotationSuccess(state, action) {
      if (action?.payload && state.list.data) {
        if (state.list.data?.length >= 10) {
          state.list.data.pop();
        }
        state.list.data.unshift(action.payload);
        state.list.total++
      }
    },
    getQuotationDetail(state, action) {
    },
    getQuotationDetailSuccess(state, action) {
      if (action?.payload) {
        state.detail = action.payload
      }
    },
    multiDeleteQuotation() { },
    multiDeleteQuotationSuccess(state, action) {
      if (action?.payload && state.list?.data && state.list.total) {
        state.list.data = state.list?.data.filter((item) => !action.payload.includes(item.id));
        state.list.total = state.list.total - action.payload?.length
      }
      state.fetched = false;
    },
    updateQuotation(state, action) {
    },
    updateQuotationSuccess(state, action) {
      const payload = action?.payload;
      if (payload) {
        const updatedData = {
          id: Number(payload.quotation_id),
          name: payload.name,
          status: payload.payment_status,
          created_at: payload.created_at,
          reference_no: payload.reference_no
        }
        if (state.list.data) {
          state.list.data = state.list.data.map(item =>
            item.id === updatedData.id ? updatedData : item
          );
        }
        const updatedDetail = {
          ...payload,
          issue_date: dayjs(payload.issue_date).format('DD/MM/YYYY'),
          valid_till: dayjs(payload.valid_till).format('DD/MM/YYYY'),
        }
        const newLog = {
          type: payload.type,
          action_type: payload.action_type,
          username: payload.username,
          created_at: payload.now,
        }
        let updatedLogs = [...state.detail.activities]
        updatedLogs.unshift(newLog)
        state.detail.quotation = updatedDetail;
        state.detail.activities = updatedLogs;
        state.fetched = false;
      }
    },
    getExportQuotationCSV() { },
    getExportQuotationCSVSuccess(state, action) {
      if (action?.payload) {
        state.csvData = action?.payload;
      }
    },
    getQuotationWithPage(state, action) { },
    getQuotationWithPageSuccess(state, action) {
      if (action?.payload) {
        const updatedData = action.payload?.data;
        const list = state.quotationList;
        const filteredList = list?.filter((existingQuotation) => {
          return !updatedData.some((updatedInfo) => updatedInfo.id === existingQuotation.id);
        });
        state.quotationList = [...filteredList, ...updatedData];
        state.quotationData = action.payload;
      }
    },
    clearCSVQuotationData(state) {
      state.csvData = {};
    },
    setSearchingStatus(state, action) {
      state.isSearching = true;
    },
    getSearchQuotationList(state) {
      state.isSearching = true;
    },
    getSearchQuotationListSuccess(state, action) {
      if (action?.payload) {
        state.searchedData = action.payload?.quotations || []
        state.isSearching = false;
      }
    },
    clearSearchedData(state) {
      state.searchedData = []
      state.isSearching = false;
    },
    clearQuotationDetail(state) {
      state.detail = {};
    },
    getAllQuotationList() { },
    getAllQuotationListSuccess(state, action) {
      if (action?.payload) {
        state.quotationAll = action.payload?.data?.quotations;
        state.fetchedAll = true;
      }
    },
    setBottomBarData(state, action) {
      state.bottomBarData.quotationCost = action.payload
    },
    setTotalOtherFees(state, action) {
      state.totalOtherFees = action.payload
    },
    setDiscountAmount(state, action) {
      state.discount = action.payload
    },
    clearCustomerQuotationDetail(state) {
      if (!state.detail) {
        state.detail = {};
      }
      if (!state.detail.quotation) {
        state.detail.quotation = {};
      }
      state.detail.quotation.customer = {};
    },
  },
})

export const { actions: quotationActions } = slice

export const useQuotationSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationSaga })
  return { actions: slice.actions }
}
