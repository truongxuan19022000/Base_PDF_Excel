import { call, put, takeLatest } from 'redux-saga/effects';
import { customerActions as actions, customerActions } from 'src/slices/customer';
import { messageActions as messageActions } from 'src/slices/message';
import { ALERT, PAGINATION } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';

import * as api from '../api/customer';
import * as apiInvoice from '../api/invoice';
import * as apiQuotation from '../api/quotation';
import * as apiDocument from '../api/document';

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

function* getNewCustomerCountSaga({ payload }) {
  try {
    const res = yield call(api.getNewCustomerCount, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getNewCustomerCountSuccess(res.data));
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
      yield put(addSuccessAlert(
        'Successfully Created',
        'Customer has been created',
      ));
      yield put(actions.createCustomerSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Customer unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Customer unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteCustomerSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteCustomer, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Customer has been deleted',
      ));
      yield put(actions.multiDeleteCustomerSuccess(payload?.customer_id));
      yield put(messageActions.deleteChatWithCustomerId(payload?.customer_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.customer_id, res.data?.message,)
      }
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Customer unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Customer unable to delete',
    ));
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

function* getCustomerActivitySaga({ payload }) {
  try {
    const data = {
      ...payload,
      per_page: PAGINATION.CUSTOMER_LOG_PER_PAGE_NUMBER,
    }
    const res = yield call(api.getCustomerActivity, data);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getCustomerActivitySuccess(res.data.data?.activities));
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
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Customer has been saved',
      ));
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
      yield put(addFailedAlert(
        'Save Failed',
        'Customer unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Customer unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportCustomerCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportCustomerCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Exportation',
        'Customer has been export',
      ));
      yield put(actions.getExportCustomerCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Customer unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Customer unable to export',
    ));
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

function* getQuotationListWithCustomerSaga({ payload }) {
  try {
    const res = yield call(apiQuotation.getAllQuotationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getQuotationListWithCustomerSuccess(res.data));
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

function* getCustomerClaimListSaga({ payload }) {
  try {
    const res = yield call(api.getCustomerClaimList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getCustomerClaimListSuccess(res.data));
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
      yield put(actions.handleResetFetchedLogsData());
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Customer document has been deleted',
      ));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Customer document unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Customer document unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteCustomerInvoiceSaga({ payload }) {
  try {
    const res = yield call(apiInvoice.multiDeleteInvoice, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Customer invoice has been deleted',
      ));
      yield put(actions.deleteCustomerInvoiceSuccess(payload?.quotation_id));
      yield put(actions.handleResetFetchedLogsData());
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Customer invoice unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Customer invoice unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportCustomerDocumentCSVSaga({ payload }) {
  try {
    const res = yield call(apiDocument.getExportDocumentCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Customer document unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Customer document unable to export',
    ));
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
  yield takeLatest(actions.getNewCustomerCount.type, getNewCustomerCountSaga);
  yield takeLatest(actions.getCustomerClaimList.type, getCustomerClaimListSaga);
  yield takeLatest(actions.getCustomerInvoiceList.type, getCustomerInvoiceListSaga);
  yield takeLatest(actions.getCustomerDocumentList.type, getCustomerDocumentListSaga);
  yield takeLatest(actions.getCustomerQuotationList.type, getCustomerQuotationListSaga);
  yield takeLatest(actions.deleteCustomerQuotation.type, deleteCustomerQuotationSaga);
  yield takeLatest(actions.deleteCustomerInvoice.type, deleteCustomerInvoiceSaga);
  yield takeLatest(actions.getExportCustomerDocumentCSV.type, getExportCustomerDocumentCSVSaga);
  yield takeLatest(actions.getQuotationListWithCustomer.type, getQuotationListWithCustomerSaga);
  yield takeLatest(actions.getCustomerActivity.type, getCustomerActivitySaga);
}

export default customerSaga
