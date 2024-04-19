import { createSlice } from '@reduxjs/toolkit';
import { useInjectReducer, useInjectSaga } from 'src/utils/redux-injector';
import { DEFAULT_GST_VALUE, DISCOUNT, STATUS } from 'src/constants/config';

import purchaseSaga from 'src/sagas/purchase';

import dayjs from 'dayjs';

export const initialState = {
  list: {},
  detail: {},
  vendorPurchaseList: {},
  fetched: false,
  isLoading: false,
  bottomBarData: {
    tax: DEFAULT_GST_VALUE,
    subTotal: 0,
    gstAmount: 0,
    grandTotal: 0,
    shippingFee: 0,
    discountAmount: 0,
    discountType: 0,
  }
};

const slice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {
    getVendorPurchaseList(state, action) { },
    getVendorPurchaseListSuccess(state, action) {
      state.vendorPurchaseList = action?.payload || {};
      state.fetched = true;
    },
    resetFetchedList(state) {
      state.fetched = false;
    },
    deletePurchase() { },
    deletePurchaseSuccess() { },
    deleteMultiPurchase() { },
    deleteMultiPurchaseSuccess() { },
    getPurchaseDetail() { },
    getPurchaseDetailSuccess(state, action) {
      state.detail = action?.payload;
      state.isLoading = false;
    },
    clearDetailData(state) {
      state.detail = {}
    },
    handleOrderChange(state, action) { },
    handleOrderChangeSuccess(state, action) {
      if (action?.payload && state.bottomBarData) {
        state.bottomBarData.subTotal = action.payload;
        state.gstAmount = action.payload * state.bottomBarData.tax / 100;
        state.grandTotal = action.payload + state.gstAmount;
      }
    },
    handleDragAndDrop(state, action) { },
    handleDragAndDropSuccess(state, action) { },
    createPurchase() { },
    createPurchaseSuccess(state, action) {
      if (action?.payload && state.vendorPurchaseList?.data) {
        if (state.vendorPurchaseList.data.length >= 10) {
          state.vendorPurchaseList.data.pop();
        }
        state.vendorPurchaseList.data.unshift(action.payload);
        state.vendorPurchaseList.total++
      }
    },
    handleSetBottomBarData(state, action) {
      state.bottomBarData = action?.payload;
    },
    updateDiscount(state, action) { },
    updateDiscountSuccess(state, action) {
      if (action?.payload && state.bottomBarData.subTotal) {
        const discountType = +action.payload?.discount_type;
        const discountAmount = +action.payload?.discount_amount;
        const discountPercent = +action.payload?.discount_percent;
        if (discountType === DISCOUNT.TYPE.PERCENT && discountPercent !== undefined) {
          state.bottomBarData.discountType = discountType;
          state.bottomBarData.discountAmount = discountAmount;
          state.bottomBarData.grandTotal = state.bottomBarData.subTotal - (state.bottomBarData.subTotal * (discountPercent / 100)) + +state.bottomBarData.shippingFee + +state.bottomBarData.gstAmount;
        } else if (discountType === DISCOUNT.TYPE.AMOUNT && discountAmount !== undefined) {
          state.bottomBarData.discountType = discountType;
          state.bottomBarData.discountAmount = discountAmount;
          state.bottomBarData.grandTotal = state.bottomBarData.subTotal - discountAmount + +state.bottomBarData.shippingFee + +state.bottomBarData.gstAmount;
        }
      }
    },
    updateShippingFee() { },
    updateShippingFeeSuccess(state, action) {
      if (action?.payload !== undefined && action.payload !== null) {
        const feeValue = +action.payload;
        state.bottomBarData.shippingFee = feeValue;
        state.bottomBarData.grandTotal = +state.bottomBarData.subTotal + feeValue - +state.bottomBarData.discountAmount + +state.bottomBarData.gstAmount;
      }
    },
    updateTax() { },
    updateTaxSuccess(state, action) {
      state.bottomBarData.tax = action?.payload;
      state.bottomBarData.gstAmount = +action?.payload * +state.bottomBarData.subTotal / 100;
      state.bottomBarData.grandTotal = +state.bottomBarData.subTotal - +state.bottomBarData.discountAmount + +state.bottomBarData.shippingFee + +state.bottomBarData.gstAmount
    },
    updateSubtotal(state, action) {
      if (action?.payload) {
        state.bottomBarData.subTotal = action.payload;
        state.bottomBarData.gstAmount = action.payload * state.bottomBarData.tax / 100;
        state.bottomBarData.grandTotal = action.payload + state.bottomBarData.gstAmount;
      }
    },
    updatePurchase() { },
    updatePurchaseSuccess(state, action) {
      if (action?.payload && state.detail?.activities && state.detail?.purchase_orders) {
        state.detail.activities = [action.payload?.logsInfo, ...state.detail.activities];
        const updatedDetail = { ...state.detail.purchase_orders };
        state.detail.purchase_orders = {
          ...updatedDetail,
          purchase_order_no: action.payload?.purchase_order_no,
          issue_date: dayjs(action.payload?.issue_date).format('DD/MM/YYYY'),
        };
      }
    },
    downloadPurchasePDF() { },
    exportPurchaseCSV() { },
    sendPurchasePDF() { },
    updatePurchaseStatus() { },
    updatePurchaseStatusSuccess(state, action) {
      if (action?.payload) {
        if (state.list && state.list?.data) {
          state.list.data = state.list.data.map(item =>
            item.id === action.payload ? { ...item, status: STATUS.SEND_VALUE } : item
          )
        }

        if (state.detail && +state.detail.purchase_orders?.id === action.payload) {
          state.detail.purchase_orders = {
            ...state.detail.purchase_orders, status: STATUS.SEND_VALUE
          }
        }
      }
    },
  }
})

export const { actions: purchaseActions } = slice

export const usePurchaseSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: purchaseSaga })
  return { actions: slice.actions }
}
