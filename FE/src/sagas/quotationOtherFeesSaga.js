import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationOtherFeesActions as actions } from 'src/slices/quotationOtherFees';

import * as api from '../api/quotationOtherFees';

function* getQuotationOtherFeesSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationOtherFees, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationOtherFeesSuccess(res.data?.data?.other_fees));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleQuotationOtherFeesSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationOtherFees, payload);
    if (res.data?.data?.status) {
      yield put(actions.handleQuotationOtherFeesSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropOtherFeesSaga({ payload }) {
  try {
    const res = yield call(api.updateOrderNumber, payload);
    if (res.data?.status === 1) {
      yield put(actions.handleDragAndDropOtherFeesSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* quotationOtherFeesSaga() {
  yield takeLatest(actions.getQuotationOtherFees.type, getQuotationOtherFeesSaga);
  yield takeLatest(actions.handleQuotationOtherFees.type, handleQuotationOtherFeesSaga);
  yield takeLatest(actions.handleDragAndDropOtherFees.type, handleDragAndDropOtherFeesSaga);
}

export default quotationOtherFeesSaga
