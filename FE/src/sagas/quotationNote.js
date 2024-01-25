import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationNoteActions as actions } from 'src/slices/quotationNote';

import * as api from '../api/quotationNote';

function* getQuotationNotesSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationNotes, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationNotesSuccess(res.data));
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

function* handleQuotationNoteSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationNote, payload);
    if (res.data?.data?.status) {
      yield put(actions.handleQuotationNoteSuccess(res.data?.data));
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

function* handleDragAndDropNoteSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationNote, payload);
    if (res.data?.data?.status) {
      yield put(actions.handleDragAndDropNoteSuccess(res.data?.data));
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

function* quotationNoteSaga() {
  yield takeLatest(actions.getQuotationNotes.type, getQuotationNotesSaga);
  yield takeLatest(actions.handleQuotationNote.type, handleQuotationNoteSaga);
  yield takeLatest(actions.handleDragAndDropNote.type, handleDragAndDropNoteSaga);
}

export default quotationNoteSaga
