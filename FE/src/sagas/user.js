import { call, put, takeLatest } from 'redux-saga/effects';

import { userActions as actions } from 'src/slices/user';
import { handleFormData, setToken } from 'src/helper/helper';

import * as api from '../api/user';

function* loginSaga({ payload }) {
  try {
    const res = yield call(api.login, payload);
    if (res.data?.status === 0) {
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    } else {
      yield put(actions.loginSuccess(res.data));
      setToken('access_token', res.data.access_token)
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload.onError('There was a problem.')
    }
  }
}

function* resetPasswordSaga({ payload }) {
  try {
    const res = yield call(api.resetPassword, payload);
    if (res?.data?.status === 1) {
      setToken('access_token', null)
      yield put(actions.resetPasswordSuccess());
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
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

function* forgotPasswordSaga({ payload }) {
  try {
    const res = yield call(api.forgotPassword, payload);
    if (res?.data?.status === 0) {
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    } else {
      setToken('access_token', null)
      yield put(actions.forgotPasswordSuccess());
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload.onError('There was a problem.')
    }
  }
}

function* getUserSaga({ payload }) {
  try {
    const res = yield call(api.getUser);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getUserSuccess(res.data));
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

function* getUserListSaga({ payload }) {
  try {
    const res = yield call(api.getUserList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getUserListSuccess(res.data));
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

function* getUserDetailSaga({ payload }) {
  try {
    const res = yield call(api.getUserDetail, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getUserDetailSuccess(res.data.data));
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

function* createUserSaga({ payload }) {
  try {
    const formData = handleFormData(payload?.data);
    const res = yield call(api.createUser, formData);
    if (res?.data?.status === 1 && payload) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const newUser = { ...res.data?.data, role_name: payload.data?.role_name }
      yield put(actions.createUserSuccess(newUser));
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

function* multiDeleteUserSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteUser, payload);
    if (res?.data?.status === 1) {
      yield put(actions.multiDeleteUserSuccess(payload?.user_id));
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

function* updateUserSaga({ payload }) {
  try {
    const formData = handleFormData(payload?.data);
    const res = yield call(api.updateUser, formData);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateUserSuccess(payload?.data));
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

function* logoutSaga({ payload }) {
  try {
    const res = yield call(api.logout, payload);
    yield put(actions.logoutSuccess());
    setToken('access_token', null)
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload.onSuccess(res.data?.message);
      }
    } else {
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.onError) {
      payload?.onError('There was a problem.');
    }
  }
}

function* getExportUserCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportUserCSV, payload);
    if (res.status === 200) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportUserCSVSuccess(res.data));
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

function* userSaga() {
  yield takeLatest(actions.login.type, loginSaga);
  yield takeLatest(actions.logout.type, logoutSaga);
  yield takeLatest(actions.getUser.type, getUserSaga);
  yield takeLatest(actions.createUser.type, createUserSaga);
  yield takeLatest(actions.updateUser.type, updateUserSaga);
  yield takeLatest(actions.getUserList.type, getUserListSaga);
  yield takeLatest(actions.getUserDetail.type, getUserDetailSaga);
  yield takeLatest(actions.resetPassword.type, resetPasswordSaga);
  yield takeLatest(actions.forgotPassword.type, forgotPasswordSaga);
  yield takeLatest(actions.multiDeleteUser.type, multiDeleteUserSaga);
  yield takeLatest(actions.getExportUserCSV.type, getExportUserCSVSaga);
}

export default userSaga
