import { call, put, takeLatest } from 'redux-saga/effects';
import { invoiceActions as actions } from 'src/slices/invoice';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/invoice';

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

function* getInvoiceListSaga({ payload }) {
  try {
    const res = yield call(api.getInvoiceList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getInvoiceListSuccess(res.data));
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

function* getInvoiceDetailSaga({ payload }) {
  try {
    const res = yield call(api.getInvoiceDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getInvoiceDetailSuccess(res.data.data));
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

function* createInvoiceSaga({ payload }) {
  try {
    const res = yield call(api.createInvoice, payload);
    if (res.data?.status === 1 && Object.keys(payload).length > 0) {
      const updatedData = {
        id: +res.data?.data?.id,
        invoice_no: payload?.invoice_no,
        reference_no: payload?.reference_no,
        invoice_name: payload?.invoice_name,
        created_at: res.data?.data?.created_at,
        customer_name: payload?.customer_name,
      }
      yield put(addSuccessAlert(
        'Successfully Created',
        'Invoice has been created',
      ));
      if (payload?.onSuccess) {
        const newId = res.data?.data?.id;
        payload?.onSuccess(newId)
      }
      yield put(actions.createInvoiceSuccess(updatedData));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Invoice unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Invoice unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteInvoiceSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteInvoice, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Invoice has been deleted',
      ));
      yield put(actions.multiDeleteInvoiceSuccess(payload?.invoice_id));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Invoice unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Invoice unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateInvoiceSaga({ payload }) {
  try {
    const res = yield call(api.updateInvoice, payload);
    if (res.data?.status === 1 && payload) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Invoice has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateInvoiceSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Invoice unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Invoice unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportInvoiceCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportInvoiceCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportInvoiceCSVSuccess(payload?.logsInfo));
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Invoice unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Invoice unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* downloadInvoicePDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadInvoicePDF, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      yield put(actions.downloadInvoicePDFSuccess(payload?.logsInfo));
      if (payload?.onDownloadSuccess) {
        payload?.onDownloadSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Downloaded Failed',
        'Invoice unable to download',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Downloaded Failed',
      'Invoice unable to download',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* sendInvoicePDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadInvoicePDF, payload);
    if (res.data?.status === 1) {
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.url)
      }
    } else {
      yield put(addFailedAlert(
        'Sended Failed',
        'Invoice unable to send',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Sended  Failed',
      'Invoice unable to send',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* invoiceSaga() {
  yield takeLatest(actions.createInvoice.type, createInvoiceSaga);
  yield takeLatest(actions.getInvoiceList.type, getInvoiceListSaga);
  yield takeLatest(actions.getInvoiceDetail.type, getInvoiceDetailSaga);
  yield takeLatest(actions.multiDeleteInvoice.type, multiDeleteInvoiceSaga);
  yield takeLatest(actions.updateInvoice.type, updateInvoiceSaga);
  yield takeLatest(actions.getExportInvoiceCSV.type, getExportInvoiceCSVSaga);
  yield takeLatest(actions.downloadInvoicePDF.type, downloadInvoicePDFSaga);
  yield takeLatest(actions.sendInvoicePDF.type, sendInvoicePDFSaga);
}

export default invoiceSaga
