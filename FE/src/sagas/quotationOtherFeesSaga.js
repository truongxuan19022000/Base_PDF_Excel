import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationOtherFeesActions as actions } from 'src/slices/quotationOtherFees';
import { quotationActions } from 'src/slices/quotation';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/quotationOtherFees';

const addSuccessAlert = (title = 'Action Successfully', description = '') => alertActions.openAlert({
  type: ALERT.SUCCESS_VALUE,
  title,
  isHovered: false,
  description,
})

const addFailedAlert = (title = 'Action Failed', description = '') => alertActions.openAlert({
  type: ALERT.FAILED_VALUE,
  title,
  isHovered: false,
  description,
})

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
    const { totalFees, ...restOfPayload } = payload;
    const res = yield call(api.handleQuotationOtherFees, restOfPayload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Other fee has been save',
      ));
      yield put(actions.handleQuotationOtherFeesSuccess(res.data?.data));
      yield put(quotationActions.handleSetTotalOtherFees(totalFees));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Other fee unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Other fee unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropOtherFeesSaga({ payload }) {
  try {
    const res = yield call(api.updateOrderNumber, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Action Successfully',
        'Action has been save',
      ));
      yield put(actions.handleDragAndDropOtherFeesSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Action unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Action unable to save',
    ));
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
