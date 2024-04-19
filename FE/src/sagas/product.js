import { call, put, takeLatest } from 'redux-saga/effects';
import { productActions as actions } from 'src/slices/product';
import { ALERT, PAGINATION } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';

import * as api from '../api/product';

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
      yield put(addSuccessAlert(
        'Successfully Created',
        'Product template has been created',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createProductTemplateSuccess(res.data?.data));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Product template unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Product template unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportProductCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportProductCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportProductCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Product template unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Product template unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteProductSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteProduct, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Product template has been deleted',
      ));
      yield put(actions.multiDeleteProductSuccess(payload?.product_template_ids));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const product_res = yield call(api.getProductList, payload);
      if (product_res.data?.status === 1) {
        yield put(actions.getProductListSuccess(product_res.data));
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Product template unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Product template unable to delete',
    ));
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
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Product template has been saved',
      ));
      yield put(actions.updateProductDetailSuccess(payload));
      if (payload?.onUpdatedSuccess) {
        const data = {
          message: 'Your changes has been saved.',
          data: payload,
        }
        payload?.onUpdatedSuccess(data)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Product template unable to save',
      ));
      if (payload?.onError) {
        payload?.onError('There was a problem.');
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Product template unable to save',
    ));
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
