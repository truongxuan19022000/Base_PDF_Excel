import { call, put, takeLatest } from 'redux-saga/effects';
import { termsConditionsActions as actions } from 'src/slices/termsConditions';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/termsConditions';

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

function* getTermsConditionsSaga({ payload }) {
  try {
    const res = yield call(api.getTermsConditions, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getTermsConditionsSuccess(res.data?.data));
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

function* handleTermsConditionsSaga({ payload }) {
  try {
    const { totalFees, ...restOfPayload } = payload;
    const res = yield call(api.handleTermsConditions, restOfPayload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Term has been save',
      ));
      yield put(actions.handleTermsConditionsSuccess(res.data?.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Term unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Term unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropSaga({ payload }) {
  try {
    const res = yield call(api.updateOrderNumber, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Term has been save',
      ));
      yield put(actions.handleDragAndDropSuccess(payload?.termList));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Term unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Term unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* termsConditionsSaga() {
  yield takeLatest(actions.getTermsConditions.type, getTermsConditionsSaga);
  yield takeLatest(actions.handleTermsConditions.type, handleTermsConditionsSaga);
  yield takeLatest(actions.handleDragAndDrop.type, handleDragAndDropSaga);
}

export default termsConditionsSaga
