import dayjs from 'dayjs';
import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import { CLAIM, DEFAULT_GST_VALUE } from 'src/constants/config';

import claimsSaga from 'src/sagas/claims';

export const initialState = {
  list: {},
  csvData: {},
  fetched: false,
  isLoading: false,
  copiedClaim: {},
  claimDetail: {},
  claimTabInfo: {},
  totalClaim: 0,
  selectedCopyClaim: {},
  selectedClaimProduct: {},
  revenueData: {
    pending: 0,
    received: 0,
  },
  newClaimNumber: 0,
  bottomData: {
    gstAmount: 0,
    depositAmount: 0,
    balanceAfterGST: 0,
    balanceBeforeGST: 0,
    totalQuotationAmount: 0,
    taxValue: DEFAULT_GST_VALUE,
  },
};

const slice = createSlice({
  name: 'claims',
  initialState,
  reducers: {
    getClaimsList(state, action) { },
    getClaimsListSuccess(state, action) {
      if (action?.payload) {
        state.list = action.payload
        state.fetched = true
        const revenue = action.payload?.total_revenue;
        const revenueData = {
          pending: revenue?.pending_revenue,
          received: revenue?.paid_revenue,
        };
        state.revenueData = revenueData;
        state.newClaimNumber = action.payload?.new_claims;
      }
    },
    getTotalAmountClaim() { },
    getTotalAmountClaimSuccess(state, action) {
      if (action?.payload) {
        state.totalClaim = action.payload?.data
      }
    },
    deleteClaim(state, action) { },
    deleteClaimSuccess(state, action) { },
    deleteMultiClaim(state, action) { },
    deleteMultiClaimSuccess(state, action) { },
    getExportClaimsCSV(state, action) { },
    getExportClaimsCSVSuccess(state, action) {
      if (state.claimDetail && state.claimDetail?.activities && action?.payload) {
        state.claimDetail.activities = [action.payload?.logsInfo, ...state.claimDetail.activities];
      }
    },
    createClaim(state, action) { },
    createClaimSuccess(state, action) { },
    getClaimDetail(state, action) {
      state.isLoading = true;
    },
    getClaimDetailSuccess(state, action) {
      state.claimDetail = action?.payload;
      state.isLoading = false;
    },
    getClaimTabInfo(state, action) { },
    getClaimTabInfoSuccess(state, action) {
      if (action?.payload) {
        const { payload } = action;
        state.claimTabInfo = payload;
      }
    },
    getClaimRevenue() { },
    getClaimRevenueSuccess(state, action) {
      if (action?.payload) {
        const revenueData = {
          pending: action.payload?.pending_revenue,
          received: action.payload?.paid_revenue,
        };
        state.revenueData = revenueData;
      }
    },
    handleSetSelectCopyClaim(state, action) {
      state.selectedCopyClaim = action?.payload;
    },
    clearSelectedCopyClaim(state) {
      state.selectedCopyClaim = {}
    },
    handleSetSelectClaimProduct(state, action) {
      state.selectedClaimProduct = action?.payload;
    },
    clearSelectedClaimProduct(state) {
      state.selectedClaimProduct = {};
    },
    createClaimCopy(state, action) { },
    createClaimCopySuccess(state, action) { },
    resetFetchedList(state) {
      state.fetched = false;
    },
    updateClaimProgress(state, action) { },
    updateClaimProgressSuccess(state, action) {
      if (action?.payload && state.claimTabInfo) {
        const payload = action.payload;
        if (state.claimTabInfo) {
          if (payload.item_type === CLAIM.TYPES.PRODUCT) {
            const updatedSections = state.claimTabInfo.quotation?.quotation_sections.map(section =>
              section.id === payload?.quotation_section_id ? {
                ...section,
                products: section.products?.map(product =>
                  product.id === payload.product_id
                    ? {
                      ...product,
                      claim_progress: payload.progress,
                    } : product)
              } : section)
            state.claimTabInfo.quotation.quotation_sections = updatedSections;
          } else if (payload.item_type === CLAIM.TYPES.OTHER_FEE) {
            const updateFeeList = state.claimTabInfo.quotation?.other_fees?.map(fee =>
              fee.id === payload?.other_fee_id ? {
                ...fee,
                claim_progress: payload?.progress,
              } : fee
            );
            state.claimTabInfo.quotation.other_fees = updateFeeList;
          } else if (payload.item_type === CLAIM.TYPES.DISCOUNT) {
            state.claimTabInfo.quotation.discount.claim_progress = payload?.progress;
          }
          state.claimTabInfo.accumulative_from_claim = payload?.accumulative_from_claim;
        }
        if (state.claimDetail) {
          state.claimDetail.claim.actual_paid_amount = payload?.total_after_gst;
          state.claimDetail.activities = [action.payload?.logsInfo, ...state.claimDetail.activities];
        }
      }
    },
    clearClaimCopiedDetailInfo(state, action) {
      state.copiedClaim = {};
    },
    getCopyClaimDetail(state, action) {
      state.isLoading = true;
    },
    getCopyClaimDetailSuccess(state, action) {
      state.copiedClaim = action?.payload;
      state.isLoading = false;
    },
    downloadClaimPDF() { },
    downloadClaimPDFSuccess(state, action) {
      if (state.claimDetail && state.claimDetail?.activities && action?.payload) {
        state.claimDetail.activities = [action.payload?.logsInfo, ...state.claimDetail.activities];
      }
    },
    updateClaimDetail() { },
    updateClaimDetailSuccess(state, action) {
      const { payload } = action;
      const { claimDetail } = state;
      if (payload && claimDetail) {
        const { activities, claim } = claimDetail;
        if (activities) {
          state.claimDetail.activities = [payload.logsInfo, ...activities];
        }

        if (payload.payment_received_date) {
          claim.payment_received_date = dayjs(payload.payment_received_date).format('DD/MM/YYYY');
        }

        if (payload.actual_paid_amount) {
          claim.actual_paid_amount = payload.actual_paid_amount;
        }

        claim.issue_date = dayjs(payload.issue_date).format('DD/MM/YYYY');
        claim.claim_no = payload.claim_no;
      }
    },
    updateTax() { },
    updateTaxSuccess(state, action) {
      if (state.bottomData && action?.payload) {
        state.bottomData.taxValue = action.payload;
        state.bottomData.gstAmount = state.bottomData.balanceBeforeGST * action.payload / 100;
        state.bottomData.balanceAfterGST = state.bottomData.balanceBeforeGST + +state.bottomData.balanceBeforeGST * action.payload / 100;
        state.claimTabInfo.tax = action.payload;
      }
    },
    sendClaimPDF(state, action) { },
    clearDetailTabInfo(state) {
      state.copiedClaim = {};
      state.claimDetail = {};
      state.claimTabInfo = {};
      state.selectedCopyClaim = {};
      state.selectedClaimProduct = {};
    }
  }
})

export const { actions: claimsActions } = slice

export const useClaimsSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: claimsSaga })
  return { actions: slice.actions }
}
