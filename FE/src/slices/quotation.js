import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import dayjs from 'dayjs';

import quotationSaga from 'src/sagas/quotation';
import { QUOTATION } from 'src/constants/config';

export const initialState = {
  list: {},
  detail: {},
  csvData: {},
  quotationAll: [],
  searchedData: [],
  quotationList: [],
  quotationData: {},
  selectedQuotationData: {},
  fetched: false,
  fetchedAll: false,
  isSearching: false,
  submitting: false,
  bottomBarData: {
    otherFees: 0,
    discountAmount: 0,
    discountType: QUOTATION.PERCENT_VALUE,
    sumSections: 0,
    grandTotal: 0,
    estimateScrapCost: 0,
    discountPercent: 0,
    totalBeforeGST: 0,
  },
  revenueData: {
    draft: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    approved: 0,
  },
  newQuotationNumber: 0,
  totalQuotation: 0,
  approvedList: [],
  fetchedApprovalList: false,
};

const slice = createSlice({
  name: 'quotation',
  initialState,
  reducers: {
    getQuotationList(state, action) {
    },
    getQuotationListSuccess(state, action) {
      if (action.payload) {
        const { data } = action.payload;
        const revenue = data?.estimated_revenue;
        const revenueData = {
          draft: revenue?.draft,
          pending: revenue?.pending_approval,
          rejected: revenue?.rejected,
          cancelled: revenue?.cancelled,
          approved: revenue?.approved,
        };
        state.list = data?.quotations || {};
        state.revenueData = revenueData;
        state.newQuotationNumber = data?.number_quotation_new;
        state.fetched = true;
        state.isSearching = false;
      }
    },
    getTotalAmountQuotation() { },
    getTotalAmountQuotationSuccess(state, action) {
      if (action?.payload) {
        state.totalQuotation = action.payload?.data
      }
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
      state.isSearching = true;
    },
    getQuotationDetailSuccess(state, action) {
      if (action?.payload) {
        state.detail = action.payload
        state.isSearching = false;
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
          status: payload.status,
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
    getApprovedList() { },
    getApprovedListSuccess(state, action) {
      if (action?.payload) {
        state.approvedList = action.payload?.data?.quotations || [];
        state.fetchedApprovalList = true;
      }
    },
    handleSetBottomBarData(state, action) {
      state.bottomBarData = action.payload
    },
    handleSetTotalOtherFees(state, action) {
      state.bottomBarData.otherFees = action.payload;
      state.bottomBarData.totalBeforeGST = +state.bottomBarData.sumSections + +action.payload;
      state.bottomBarData.grandTotal = +state.bottomBarData.sumSections + +action.payload - + +state.bottomBarData.discountAmount;
    },
    handleSetDiscountAmount(state, action) {
      state.bottomBarData.discountAmount = action.payload.discountAmount;
      state.bottomBarData.discountType = action.payload.discountType;
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
    resetBottomBarData(state, action) {
      state.bottomBarData = {
        otherFees: 0,
        discountAmount: 0,
        discountType: QUOTATION.PERCENT_VALUE,
        sumSections: 0,
        grandTotal: 0,
        estimateScrapCost: 0,
        totalBeforeGST: 0,
      }
    },
    downloadPDF() { },
    resetFetchedList(state) {
      state.fetched = false;
    },
    handleDiscountChange(state, action) { },
    handleDiscountChangeSuccess(state, action) {
      if (action?.payload && action.payload?.discount_amount && state.bottomBarData.totalBeforeGST) {
        state.bottomBarData.discountType = action.payload?.discount_type;
        state.bottomBarData.discountAmount = action.payload.discount_amount;
        state.bottomBarData.grandTotal = +state.bottomBarData.totalBeforeGST - +action.payload.discount_amount;
      }
    },
    getRevenue() { },
    getRevenueSuccess(state, action) {
      if (action?.payload) {
        state.revenueData = {
          ...action.payload,
          pending: action.payload?.pending_approval,
        };
      }
    },
    handleSendToApproval(state, action) {
      state.submitting = true;
    },
    handleSendToApprovalSuccess(state, action) {
      const newStatus = QUOTATION.STATUS_VALUE.PENDING;
      state.detail.quotation.status = newStatus;
      state.submitting = false;
      if (action?.payload) {
        state.detail.activities = [action.payload, ...state.detail.activities]
      }
    },
    handleApproveQuotation(state) {
      state.submitting = true;
    },
    handleApproveQuotationSuccess(state, action) {
      if (action?.payload && state.detail) {
        const newStatus = +action.payload?.status;
        state.detail.quotation.status = newStatus;
        if (newStatus === QUOTATION.STATUS_VALUE.REJECTED) {
          const updatedData = {
            ...state.detail?.quotation,
            reject_reason: action.payload?.reject_reason,
          };
          state.detail = {
            ...state.detail,
            quotation: updatedData,
          };
        }
        state.detail.activities = [action.payload.logsInfo, ...state.detail.activities]
      }
      state.submitting = false;
    },
    resetSubmittingState(state) {
      state.submitting = false;
    },
    handleSetSelectedQuotation(state, action) {
      state.selectedQuotationData = action?.payload;
    },
    clearSelectedQuotationData(state) {
      state.selectedQuotationData = {};
    },
    handleSendEmail() { },
    handleResetFetchedAll(state) {
      state.fetchedAll = false;
    }
  },
})

export const { actions: quotationActions } = slice

export const useQuotationSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: quotationSaga })
  return { actions: slice.actions }
}
