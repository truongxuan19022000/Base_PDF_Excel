import { call, put, takeLatest } from 'redux-saga/effects';
import { scrapActions as actions } from 'src/slices/scrap';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/scrap';

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

function* getScrapListSaga({ payload }) {
  try {
    const res = yield call(api.getScrapList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getScrapListSuccess(res.data?.data));
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

function* getScrapsSaga({ payload }) {
  try {
    const res = yield call(api.getScraps, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getScrapsSuccess(res.data?.data));
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

function* deleteScrapSaga({ payload }) {
  try {
    const res = yield call(api.deleteScrap, { data: payload.data });
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Scrap has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteScrapSuccess(payload.data.scrap_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Scrap unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Scrap unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteMultiScrapSaga({ payload }) {
  try {
    const res = yield call(api.deleteMultiScrap, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Scrap has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteMultiScrapSuccess(payload.scrap_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Scrap unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Scrap unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getScrapDetailSaga({ payload }) {
  try {
    const res = yield call(api.getScrapDetail, payload.id);
    if (res.data?.status === 1) {
      yield put(actions.getScrapDetailSuccess(res.data?.data));
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
function* updateScrapSaga({ payload }) {
  try {
    const res = yield call(api.updateScrap, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Scrap has been saved',
      ));
      yield put(actions.updateScrapSuccess());
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Scrap unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Scrap unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportScrapCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportScrapCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Exported',
        'Scrap item has been exported',
      ));
      yield put(actions.getExportScrapCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Scrap item unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Scrap item unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleExportCSVToMailSaga({ payload }) {
  try {
    const res = yield call(api.getExportScrapCSV, payload);
    if (res.data?.status === 1) {
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.url)
      }
      yield put(addSuccessAlert(
        'Successfully Exported',
        'Scrap item has been exported',
      ));
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Scrap item unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Scrap item unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* scrapSaga() {
  yield takeLatest(actions.getScraps.type, getScrapsSaga);
  yield takeLatest(actions.getScrapList.type, getScrapListSaga);
  yield takeLatest(actions.deleteScrap.type, deleteScrapSaga);
  yield takeLatest(actions.deleteMultiScrap.type, deleteMultiScrapSaga);
  yield takeLatest(actions.getScrapDetail.type, getScrapDetailSaga);
  yield takeLatest(actions.updateScrap.type, updateScrapSaga);
  yield takeLatest(actions.getExportScrapCSV.type, getExportScrapCSVSaga);
  yield takeLatest(actions.handleExportCSVToMail.type, handleExportCSVToMailSaga);
}

export default scrapSaga
