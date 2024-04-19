import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationNoteActions as actions } from 'src/slices/quotationNote';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/quotationNote';

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


function* getQuotationNotesSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationNotes, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationNotesSuccess(res.data));
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

function* handleQuotationNoteSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationNote, payload);
    if (res.data?.data?.status) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Note has been save',
      ));
      yield put(actions.handleQuotationNoteSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Note unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Note unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDragAndDropNoteSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationNote, payload);
    if (res.data?.data?.status) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Note has been save',
      ));
      yield put(actions.handleDragAndDropNoteSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Action Failed',
        'Note unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Action Failed',
      'Note unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* quotationNoteSaga() {
  yield takeLatest(actions.getQuotationNotes.type, getQuotationNotesSaga);
  yield takeLatest(actions.handleQuotationNote.type, handleQuotationNoteSaga);
  yield takeLatest(actions.handleDragAndDropNote.type, handleDragAndDropNoteSaga);
}

export default quotationNoteSaga
