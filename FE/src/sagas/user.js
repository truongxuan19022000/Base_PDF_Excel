import { call, put, takeLatest } from 'redux-saga/effects';

import { userActions as actions } from 'src/slices/user';
import { handleFormData, setToken } from 'src/helper/helper';
import { dashboardActions } from 'src/slices/dashboard';
import { alertActions } from 'src/slices/alert';
import { roleActions } from 'src/slices/role';
import { ALERT } from 'src/constants/config';

import * as api from '../api/user';

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

function* loginSaga({ payload }) {
  try {
    const res = yield call(api.login, payload);
    if (res.data?.status === 0) {
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    } else {
      yield put(actions.loginSuccess(res.data));
      setToken('access_token', res.data.access_token, res.data.expires_in)
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
      yield put(roleActions.resetRoleStatusChange());
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
      yield put(addSuccessAlert(
        'Successfully Created',
        'User has been created',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      const newUser = { ...res.data?.data, role_name: payload.data?.role_name }
      yield put(actions.createUserSuccess(newUser));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'User unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'User unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* multiDeleteUserSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteUser, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'User has been deleted',
      ));
      yield put(actions.multiDeleteUserSuccess(payload?.user_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'User unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'User unable to delete',
    ));
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
      yield put(addSuccessAlert(
        'Successfully Saved',
        'User has been saved',
      ));
      if (payload?.onSuccess) {
        const data = {
          isCurrentUserChanged: payload?.data?.isCurrentUserChanged,
          isCurrentPasswordChanged: payload?.data?.isCurrentPasswordChanged
        }
        payload?.onSuccess(data)
      }
      yield put(actions.updateUserSuccess(payload?.data));

    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'User unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'User unable to save',
    ));
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
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportUserCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'User unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'User unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* getNotificationsSaga({ payload }) {
  try {
    const res = yield call(api.getNotifications, payload);
    if (res.data.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getNotificationsSuccess(res.data.data));
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
function* updateNotificationsStatusSaga({ payload }) {
  try {
    const res = yield call(api.updateNotificationsStatus, payload);
    if (res.data.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.updateNotificationsStatusSuccess(payload));
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
function* getMessagesSaga({ payload }) {
  try {
    const response = yield call(api.getMessages, payload);
    if (response.data?.status === 1) {
      yield put(actions.getMessagesSuccess(response.data?.data))
    }
  } catch {
  }
}
function* updateMessageStatusSaga({ payload }) {
  try {
    const res = yield call(api.updateMessageStatus, payload);
    if (res.data.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.updateMessagesStatusSuccess(payload.id));
      yield put(dashboardActions.updateMessagesStatusSuccess(payload.id));
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
  yield takeLatest(actions.getNotifications.type, getNotificationsSaga);
  yield takeLatest(actions.updateMessagesStatus.type, updateMessageStatusSaga);
  yield takeLatest(actions.updateNotificationsStatus.type, updateNotificationsStatusSaga);
  yield takeLatest(actions.getMessages.type, getMessagesSaga)

}

export default userSaga
