import { call, put, takeLatest } from 'redux-saga/effects';
import { invoiceActions as actions } from 'src/slices/invoice';

import * as api from '../api/invoice';

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
    if (res.data?.status === 1 && Object.keys(payload)?.length > 0) {
      const updatedData = {
        id: +res.data?.data?.id,
        invoice_no: payload?.invoice_no,
        reference_no: payload?.reference_no,
        invoice_name: payload?.invoice_name,
        created_at: res.data?.data?.created_at,
        customer_name: payload?.customer_name,
      }
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createInvoiceSuccess(updatedData));
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

function* multiDeleteInvoiceSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteInvoice, payload);
    if (res?.data?.status === 1) {
      const requestData = {
        page: payload?.page,
        search: payload?.search,
        start_date: payload?.start_date,
        end_date: payload?.end_date,
      }
      const invoice_res = yield call(api.getInvoiceList, requestData);
      yield put(actions.multiDeleteInvoiceSuccess(payload?.invoice_id));
      if (invoice_res.data?.status === 1) {
        yield put(actions.getInvoiceListSuccess(invoice_res.data));
      }
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.invoice_id, res.data?.message,)
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

function* updateInvoiceSaga({ payload }) {
  try {
    const res = yield call(api.updateInvoice, payload);
    if (res.data?.status === 1 && payload) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateInvoiceSuccess(payload));
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

function* getExportInvoiceCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportInvoiceCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportInvoiceCSVSuccess(res.data));
    } else {
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
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
}

export default invoiceSaga
