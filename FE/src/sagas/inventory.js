import { call, put, takeLatest } from 'redux-saga/effects';
import { inventoryActions as actions } from 'src/slices/inventory';

import * as api from '../api/inventory';

function* getInventoryListSaga({ payload }) {
  try {
    const res = yield call(api.getInventoryList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getInventoryListSuccess(res.data));
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

function* getInventoryDetailSaga({ payload }) {
  try {
    const res = yield call(api.getInventoryDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getInventoryDetailSuccess(res.data.data));
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

function* createInventorySaga({ payload }) {
  try {
    const res = yield call(api.createInventory, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createInventorySuccess(res.data));
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

function* updateInventorySaga({ payload }) {
  try {
    const res = yield call(api.updateInventory, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateInventorySuccess(res.data));
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

function* multiDeleteInventorySaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteInventory, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.inventory_id, res.data?.message)
      }
      yield put(actions.multiDeleteInventorySuccess(payload?.inventory_id));
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

function* inventorySaga() {
  yield takeLatest(actions.createInventory.type, createInventorySaga);
  yield takeLatest(actions.updateInventory.type, updateInventorySaga);
  yield takeLatest(actions.getInventoryList.type, getInventoryListSaga);
  yield takeLatest(actions.getInventoryDetail.type, getInventoryDetailSaga);
  yield takeLatest(actions.multiDeleteInventory.type, multiDeleteInventorySaga);
}

export default inventorySaga
