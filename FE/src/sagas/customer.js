import { call, put, takeLatest } from 'redux-saga/effects';
import { customerActions as actions } from 'src/slices/customer';
import { messageActions as messageActions } from 'src/slices/message';

import * as api from '../api/customer';
import * as apiInvoice from '../api/invoice';
import * as apiQuotation from '../api/quotation';
import * as apiDocument from '../api/document';

import { PAGINATION } from 'src/constants/config';

function* getCustomerListSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerListSuccess(res.data));
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

function* createCustomerSaga({ payload }) {
  try {
    const res = yield call(api.createCustomer, payload);
    if (res?.data?.status === 1) {
      yield put(actions.createCustomerSuccess(res.data?.data));
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

function* multiDeleteCustomerSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteCustomer, payload);
    if (res?.data?.status === 1) {
      const requestData = {
        page: payload?.page,
        search: payload?.search,
        sort_name: payload.sort_name,
        start_date: payload?.start_date,
        end_date: payload?.end_date,
      }
      const customer_res = yield call(api.getCustomerList, requestData);
      yield put(actions.multiDeleteCustomerSuccess(payload?.customer_id));
      yield put(messageActions.deleteChatWithCustomerId(payload?.customer_id));
      if (customer_res.data?.status === 1) {
        yield put(actions.getCustomerListSuccess(customer_res.data));
      }
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.customer_id, res.data?.message,)
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

function* getCustomerSaga({ payload }) {
  try {
    const res = yield call(api.getCustomer, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getCustomerSuccess(res.data.data));
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

function* updateCustomerSaga({ payload }) {
  try {
    const res = yield call(api.updateCustomer, payload);
    if (res.data?.status === 1 && payload) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const updatedInfo = {
        id: +payload?.customer_id,
        name: payload?.name,
        phone_number: payload?.phone_number,
      }
      yield put(actions.updateCustomerSuccess(payload));
      yield put(messageActions.updateCustomerName(updatedInfo));
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

function* getExportCustomerCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportCustomerCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportCustomerCSVSuccess(res.data));
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

function* getSearchCustomerListSaga({ payload }) {
  try {
    const requestData = {
      search: payload?.search,
      paginate: PAGINATION.GET_ALL_LIST,
    }
    const res = yield call(api.getCustomerList, requestData);
    if (res?.data?.status === 1) {
      yield put(actions.getSearchCustomerListSuccess(res.data.data));
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

function* getCustomerWithPageSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerWithPageSuccess(res.data?.data?.customers));
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

function* getAllCustomerListSaga({ payload }) {
  try {
    const res = yield call(api.getAllCustomerList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getAllCustomerListSuccess(res.data));
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

function* getCustomerQuotationListSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerQuotationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerQuotationListSuccess(res.data));
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

function* getCustomerInvoiceListSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerInvoiceList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerInvoiceListSuccess(res.data));
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

function* getCustomerDocumentListSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerDocumentList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerDocumentListSuccess(res.data));
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

function* deleteCustomerQuotationSaga({ payload }) {
  try {
    const res = yield call(apiQuotation.multiDeleteQuotation, payload);
    if (res?.data?.status === 1) {
      yield put(actions.deleteCustomerQuotationSuccess(payload?.quotation_id));
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

function* deleteCustomerInvoiceSaga({ payload }) {
  try {
    const res = yield call(apiInvoice.multiDeleteInvoice, payload);
    if (res?.data?.status === 1) {
      yield put(actions.deleteCustomerInvoiceSuccess(payload?.quotation_id));
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

function* getExportCustomerQuotationCSVSaga({ payload }) {
  try {
    const res = yield call(apiQuotation.getExportQuotationCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportCustomerQuotationCSVSuccess(res.data));
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

function* getExportCustomerInvoiceCSVSaga({ payload }) {
  try {
    const res = yield call(apiInvoice.getExportInvoiceCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportCustomerQuotationCSVSuccess(res.data));
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

function* getExportCustomerDocumentCSVSaga({ payload }) {
  try {
    const res = yield call(apiDocument.getExportDocumentCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportCustomerQuotationCSVSuccess(res.data));
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

function* customerSaga() {
  yield takeLatest(actions.getCustomer.type, getCustomerSaga);
  yield takeLatest(actions.createCustomer.type, createCustomerSaga);
  yield takeLatest(actions.updateCustomer.type, updateCustomerSaga);
  yield takeLatest(actions.getCustomerList.type, getCustomerListSaga);
  yield takeLatest(actions.multiDeleteCustomer.type, multiDeleteCustomerSaga);
  yield takeLatest(actions.getExportCustomerCSV.type, getExportCustomerCSVSaga);
  yield takeLatest(actions.getSearchCustomerList.type, getSearchCustomerListSaga);
  yield takeLatest(actions.getCustomerWithPage.type, getCustomerWithPageSaga);
  yield takeLatest(actions.getAllCustomerList.type, getAllCustomerListSaga);
  yield takeLatest(actions.getCustomerInvoiceList.type, getCustomerInvoiceListSaga);
  yield takeLatest(actions.getCustomerDocumentList.type, getCustomerDocumentListSaga);
  yield takeLatest(actions.getCustomerQuotationList.type, getCustomerQuotationListSaga);
  yield takeLatest(actions.deleteCustomerQuotation.type, deleteCustomerQuotationSaga);
  yield takeLatest(actions.deleteCustomerInvoice.type, deleteCustomerInvoiceSaga);
  yield takeLatest(actions.getExportCustomerInvoiceCSV.type, getExportCustomerInvoiceCSVSaga);
  yield takeLatest(actions.getExportCustomerQuotationCSV.type, getExportCustomerQuotationCSVSaga);
  yield takeLatest(actions.getExportCustomerDocumentCSV.type, getExportCustomerDocumentCSVSaga);
}

export default customerSaga
