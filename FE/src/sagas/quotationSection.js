import { call, put, takeLatest } from 'redux-saga/effects';
import { quotationSectionActions as actions } from 'src/slices/quotationSection';

import * as api from '../api/quotationSection';

function* getQuotationSectionListSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationSectionList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationSectionListSuccess(res.data));
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

function* createQuotationSectionSaga({ payload }) {
  try {
    const res = yield call(api.createQuotationSection, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createQuotationSectionSuccess(res.data?.data));
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

function* deleteQuotationSectionSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationSection, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.deleteQuotationSectionSuccess(res.data?.data));
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

function* handleDragAndDropSectionSaga({ payload }) {
  try {
    const res = yield call(api.handleQuotationSection, payload);
    if (res.data?.data?.status) {
      yield put(actions.handleDragAndDropSectionSuccess(res.data?.data));
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

function* createQuotationSectionProductSaga({ payload }) {
  try {
    const res = yield call(api.createQuotationSectionProduct, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      if (res.data?.data?.id) {
        const newData = {
          ...res.data?.data,
          productId: res.data.data.id,
        }
        yield put(actions.createQuotationSectionProductSuccess(newData));
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

function* handleChangeProductOrderSaga({ payload }) {
  try {
    const res = yield call(api.handleChangeProductOrder, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.handleChangeProductOrderSuccess());
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

function* createProductMaterialSaga({ payload }) {
  try {
    const res = yield call(api.createProductMaterial, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const updatedData = {
        ...res.data?.data,
        productId: res.data?.data?.id,
        quotation_section_id: payload.quotation_section_id,
      }
      yield put(actions.createProductMaterialSuccess(updatedData));
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

function* quotationSectionSaga() {
  yield takeLatest(actions.createProductMaterial.type, createProductMaterialSaga);
  yield takeLatest(actions.createQuotationSection.type, createQuotationSectionSaga);
  yield takeLatest(actions.deleteQuotationSection.type, deleteQuotationSectionSaga);
  yield takeLatest(actions.getQuotationSectionList.type, getQuotationSectionListSaga);
  yield takeLatest(actions.handleDragAndDropSection.type, handleDragAndDropSectionSaga);
  yield takeLatest(actions.handleChangeProductOrder.type, handleChangeProductOrderSaga);
  yield takeLatest(actions.createQuotationSectionProduct.type, createQuotationSectionProductSaga);
}

export default quotationSectionSaga
