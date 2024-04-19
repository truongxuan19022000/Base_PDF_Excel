import { call, put, takeLatest } from 'redux-saga/effects';
import { roleActions as actions } from 'src/slices/role';
import { ALERT, PAGINATION } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';

import * as api from '../api/role';

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
      yield put(addSuccessAlert(
        'Successfully Created',
        'Role has been created',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.createRoleSuccess(res.data, payload));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Role unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Role unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteRoleSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteRole, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Role has been deleted',
      ));
      yield put(actions.multiDeleteRoleSuccess(payload?.role_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.role_id, res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Role unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Role unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateRoleSaga({ payload }) {
  try {
    const res = yield call(api.updateRole, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Role has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateRoleSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Role unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Role unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportRoleCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportRoleCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportRoleCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Role unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Role unable to export',
    ));
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
