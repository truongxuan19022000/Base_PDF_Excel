import { call, put, takeLatest } from 'redux-saga/effects';
import { documentActions as actions } from 'src/slices/document';
import { customerActions as customerActions } from 'src/slices/customer';

import * as api from '../api/document';
import { handleFormData } from 'src/helper/helper';

function* uploadDocumentSaga({ payload }) {
  try {
    const formData = handleFormData(payload)
    const res = yield call(api.uploadDocument, formData);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.uploadDocumentSuccess(res.data?.data));
      yield put(customerActions.updateNewDocumentDocument(res.data?.data));
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

function* multiDeleteDocumentSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteDocument, payload);
    if (res?.data?.status === 1) {
      yield put(actions.multiDeleteDocumentSuccess(payload?.document_id));
      yield put(customerActions.deleteCustomerDocument(payload?.document_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.document_id, res.data?.message,)
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

function* documentSaga() {
  yield takeLatest(actions.uploadDocument.type, uploadDocumentSaga);
  yield takeLatest(actions.multiDeleteDocument.type, multiDeleteDocumentSaga);
}

export default documentSaga
