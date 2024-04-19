import { call, put, takeLatest } from 'redux-saga/effects';
import { fileActions as actions } from 'src/slices/file';
import { customerActions } from 'src/slices/customer';
import { alertActions } from 'src/slices/alert';
import { handleFormData } from 'src/helper/helper';
import { ALERT } from 'src/constants/config';

import * as api from '../api/document';

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

function* uploadDocumentSaga({ payload }) {
  try {
    const formData = handleFormData(payload)
    const res = yield call(api.uploadDocument, formData);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Uploaded',
        'Document has been uploaded',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const newData = {
        ...res.data?.data,
        reference_no: payload?.reference_no,
      }
      yield put(actions.uploadDocumentSuccess(res.data?.data));
      yield put(customerActions.updateNewCustomerDocument(newData));
      yield put(customerActions.handleResetFetchedLogsData());
    } else {
      yield put(addFailedAlert(
        'Uploaded Failed',
        'Document unable to upload',
      ));
      yield put(actions.resetLoadingStatus());
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(actions.resetLoadingStatus());
    yield put(addFailedAlert(
      'Uploaded Failed',
      'Document unable to upload',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteDocumentSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteDocument, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Document has been deleted',
      ));
      yield put(actions.multiDeleteDocumentSuccess(payload?.document_id));
      yield put(customerActions.deleteCustomerDocument(payload?.document_id));
      yield put(customerActions.handleResetFetchedLogsData());
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message,)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Document unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Document unable to delete',
    ));
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
