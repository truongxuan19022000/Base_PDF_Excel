import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationActions as actions } from 'src/slices/quotation';
import { customerActions as customerActions } from 'src/slices/customer';

import * as api from '../api/quotation';
import { PAGINATION } from 'src/constants/config';

function* getQuotationListSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationList, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationListSuccess(res.data));
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

function* getQuotationDetailSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationDetailSuccess(res.data?.data));
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

function* multiDeleteQuotationSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteQuotation, payload);
    if (res.data?.status === 1) {
      yield put(actions.multiDeleteQuotationSuccess(payload?.quotation_id));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess()
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

function* createQuotationSaga({ payload }) {
  try {
    const res = yield call(api.createQuotation, payload);
    if (res?.data?.status === 1) {
      if (payload.is_new_customer) {
        const new_customer = {
          id: res.data?.data?.customer_id,
          name: payload.name,
          phone_number: payload.phone_number,
          email: payload.email,
          created_at: payload.created_at,
        }
        yield put(customerActions.createCustomerSuccess(new_customer));
      }
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const updatedData = {
        ...res.data?.data,
        name: payload?.name || '',
      }
      yield put(actions.createQuotationSuccess(updatedData));
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

function* getExportQuotationCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportQuotationCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportQuotationCSVSuccess(res.data));
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

function* updateQuotationSaga({ payload }) {
  try {
    const res = yield call(api.updateQuotation, payload);
    if (res.data?.status === 1) {
      yield put(actions.updateQuotationSuccess(payload));
      if (payload?.onSuccess) {
        payload.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload.onError('There was a problem.')
    }
  }
}

function* getSearchQuotationListSaga({ payload }) {
  try {
    const requestData = {
      search: payload?.search,
      paginate: PAGINATION.GET_ALL_LIST,
    }
    const res = yield call(api.getQuotationList, requestData);
    if (res?.data?.status === 1) {
      yield put(actions.getSearchQuotationListSuccess(res.data.data));
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

function* getQuotationWithPageSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getQuotationWithPageSuccess(res.data?.data?.quotations));
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

function* getAllQuotationListSaga({ payload }) {
  try {
    const res = yield call(api.getAllQuotationList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getAllQuotationListSuccess(res.data));
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

function* quotationSaga() {
  yield takeLatest(actions.getQuotationList.type, getQuotationListSaga);
  yield takeLatest(actions.getQuotationDetail.type, getQuotationDetailSaga);
  yield takeLatest(actions.updateQuotation.type, updateQuotationSaga);
  yield takeLatest(actions.createQuotation.type, createQuotationSaga);
  yield takeLatest(actions.getQuotationWithPage.type, getQuotationWithPageSaga);
  yield takeLatest(actions.multiDeleteQuotation.type, multiDeleteQuotationSaga);
  yield takeLatest(actions.getExportQuotationCSV.type, getExportQuotationCSVSaga);
  yield takeLatest(actions.getSearchQuotationList.type, getSearchQuotationListSaga);
  yield takeLatest(actions.getAllQuotationList.type, getAllQuotationListSaga);
}

export default quotationSaga
