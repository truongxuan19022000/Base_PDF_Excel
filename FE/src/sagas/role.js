import { call, put, takeLatest } from 'redux-saga/effects';
import { roleActions as actions } from 'src/slices/role';

import * as api from '../api/role';
import { PAGINATION } from 'src/constants/config';

function* getRoleListSaga({ payload }) {
  try {
    const res = yield call(api.getRoleList, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getRoleListSuccess(res.data));
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

function* getRoleDetailSaga({ payload }) {
  try {
    const res = yield call(api.getRoleDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getRoleDetailSuccess(res.data?.data));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createRoleSaga({ payload }) {
  try {
    const res = yield call(api.createRole, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createRoleSuccess(res.data, payload));
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

function* multiDeleteRoleSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteRole, payload);
    if (res?.data?.status === 1) {
      yield put(actions.multiDeleteRoleSuccess(payload?.role_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.role_id, res.data?.message)
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

function* updateRoleSaga({ payload }) {
  try {
    const res = yield call(api.updateRole, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateRoleSuccess(payload));
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

function* getExportRoleCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportRoleCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportRoleCSVSuccess(res.data));
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

function* getAllRolesSaga({ payload }) {
  try {
    const requestData = {
      ...payload,
      paginate: PAGINATION.GET_ALL_LIST,
    }
    const res = yield call(api.getRoleList, requestData);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getAllRolesSuccess(res.data.data));
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

function* roleSaga() {
  yield takeLatest(actions.createRole.type, createRoleSaga);
  yield takeLatest(actions.updateRole.type, updateRoleSaga);
  yield takeLatest(actions.getRoleList.type, getRoleListSaga);
  yield takeLatest(actions.getRoleDetail.type, getRoleDetailSaga);
  yield takeLatest(actions.multiDeleteRole.type, multiDeleteRoleSaga);
  yield takeLatest(actions.getExportRoleCSV.type, getExportRoleCSVSaga);
  yield takeLatest(actions.getAllRoles.type, getAllRolesSaga);
}

export default roleSaga
