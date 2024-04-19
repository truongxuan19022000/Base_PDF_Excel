import { invoiceBillActions as actions } from 'src/slices/invoiceBill';
import { call, put, takeLatest } from 'redux-saga/effects';
import { invoiceActions } from 'src/slices/invoice';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/invoiceBill';


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

function* getInvoiceBillsSaga({ payload }) {
  try {
    const res = yield call(api.getInvoiceBills, payload.id);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getInvoiceBillsSuccess(res.data?.data));
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'There was a problem.',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'There was a problem.',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleBillSaga({ payload }) {
  try {
    const res = yield call(api.handleInvoiceBills, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Invoice has been save',
      ));
      yield put(actions.handleBillSuccess(res.data?.data?.data?.bill_schedules));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Invoice unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Invoice unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateTaxSaga({ payload }) {
  try {
    const res = yield call(api.updateTax, payload);
    if (res.data?.status === 1 && payload) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Gst rate has been save',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.gst_rates)
      }
      yield put(actions.updateTaxSuccess(payload));
      yield put(invoiceActions.updateDetailTax(payload?.gst_rates));
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Gst rate unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Gst rate unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropBillSaga({ payload }) {
  try {
    const res = yield call(api.handleDragDropBill, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Action been save',
      ));
      yield put(actions.handleDragAndDropBillSuccess(payload?.bills));
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


function* invoiceBillSaga() {
  yield takeLatest(actions.getInvoiceBills.type, getInvoiceBillsSaga);
  yield takeLatest(actions.handleBill.type, handleBillSaga);
  yield takeLatest(actions.updateTax.type, updateTaxSaga);
  yield takeLatest(actions.handleDragAndDropBill.type, handleDragAndDropBillSaga);
}
export default invoiceBillSaga
