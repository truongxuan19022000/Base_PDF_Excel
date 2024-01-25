import { call, put, takeLatest } from 'redux-saga/effects';
import { materialActions as actions } from 'src/slices/material';

import * as api from '../api/material';
import { PAGINATION } from 'src/constants/config';

function* getMaterialListSaga({ payload }) {
  try {
    const res = yield call(api.getMaterialList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getMaterialListSuccess(res.data));
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

function* multiDeleteMaterialSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteMaterial, payload);
    if (res.data?.status === 1) {
      yield put(actions.multiDeleteMaterialSuccess(payload?.material_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.material_id)
      }
      const material_res = yield call(api.getMaterialList, payload);
      if (material_res.data?.status === 1) {
        yield put(actions.getMaterialListSuccess(material_res.data));
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

function* getMaterialDetailSaga({ payload }) {
  try {
    const res = yield call(api.getMaterialDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getMaterialDetailSuccess(res.data?.data));
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

function* updateMaterialDetailSaga({ payload }) {
  try {
    const res = yield call(api.updateMaterialDetail, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        const data = {
          message: res.data?.message,
          data: payload,
        }
        payload?.onSuccess(data)
      }
      yield put(actions.updateMaterialDetailSuccess(payload));
      const updated_res = yield call(api.getMaterialDetail, payload.id);
      if (updated_res?.data?.status === 1) {
        yield put(actions.getMaterialDetailSuccess(updated_res.data?.data));
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

function* createMaterialItemSaga({ payload }) {
  try {
    const res = yield call(api.createMaterialItem, payload);
    if (res.data?.status === 1) {
      if (payload?.onCreatedSuccess) {
        payload?.onCreatedSuccess(res.data?.message)
      }
      const updatedData = {
        ...res.data?.data,
        name: payload?.name || '',
      }
      yield put(actions.createMaterialItemSuccess(updatedData));
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

function* getExportMaterialCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportMaterialCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportMaterialCSVSuccess(res.data));
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

function* getAllMaterialListSaga({ payload }) {
  try {
    const payloadData = { ...payload, paginate: PAGINATION.GET_ALL_LIST }
    const res = yield call(api.getAllMaterialList, payloadData);
    if (res?.data?.status === 1) {
      yield put(actions.getAllMaterialListSuccess(res.data?.data?.materials));
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

function* materialSaga() {
  yield takeLatest(actions.getMaterialList.type, getMaterialListSaga);
  yield takeLatest(actions.getAllMaterialList.type, getAllMaterialListSaga);
  yield takeLatest(actions.getMaterialDetail.type, getMaterialDetailSaga);
  yield takeLatest(actions.multiDeleteMaterial.type, multiDeleteMaterialSaga);
  yield takeLatest(actions.createMaterialItem.type, createMaterialItemSaga);
  yield takeLatest(actions.updateMaterialDetail.type, updateMaterialDetailSaga);
  yield takeLatest(actions.getExportMaterialCSV.type, getExportMaterialCSVSaga);
}

export default materialSaga
