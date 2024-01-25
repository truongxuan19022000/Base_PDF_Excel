import { call, put, takeLatest } from 'redux-saga/effects';
import { productActions as actions } from 'src/slices/product';

import * as api from '../api/product';
import { PAGINATION } from 'src/constants/config';

function* getProductListSaga({ payload }) {
  try {
    const res = yield call(api.getProductList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getProductListSuccess(res.data));
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

function* createProductTemplateSaga({ payload }) {
  try {
    const res = yield call(api.createProductTemplate, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createProductTemplateSuccess(res.data?.data));
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

function* getExportProductCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportProductCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportProductCSVSuccess(res.data));
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

function* multiDeleteProductSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteProduct, payload);
    if (res.data?.status === 1) {
      yield put(actions.multiDeleteProductSuccess(payload?.material_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.material_id)
      }
      const product_res = yield call(api.getProductList, payload);
      if (product_res.data?.status === 1) {
        yield put(actions.getProductListSuccess(product_res.data));
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

function* getProductDetailSaga({ payload }) {
  try {
    const res = yield call(api.getProductDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getProductDetailSuccess(res.data?.data?.product_templates));
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

function* updateProductDetailSaga({ payload }) {
  try {
    const res = yield call(api.updateProductDetail, payload);
    if (res.data?.status === 1) {
      yield put(actions.updateProductDetailSuccess(payload));
      if (payload?.onUpdatedSuccess) {
        const data = {
          message: 'Your changes has been saved.',
          data: payload,
        }
        payload?.onUpdatedSuccess(data)
      }
    } else {
      if (payload?.onError) {
        payload?.onError('There was a problem.');
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getAllProductListSaga({ payload }) {
  try {
    const payloadData = { ...payload, paginate: PAGINATION.GET_ALL_LIST }
    const res = yield call(api.getAllProductList, payloadData);
    if (res?.data?.status === 1) {
      yield put(actions.getAllProductListSuccess(res.data?.data?.product_templates));
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
function* productSaga() {
  yield takeLatest(actions.getProductList.type, getProductListSaga);
  yield takeLatest(actions.getAllProductList.type, getAllProductListSaga);
  yield takeLatest(actions.getProductDetail.type, getProductDetailSaga);
  yield takeLatest(actions.multiDeleteProduct.type, multiDeleteProductSaga);
  yield takeLatest(actions.getExportProductCSV.type, getExportProductCSVSaga);
  yield takeLatest(actions.updateProductDetail.type, updateProductDetailSaga);
  yield takeLatest(actions.createProductTemplate.type, createProductTemplateSaga);
}

export default productSaga
