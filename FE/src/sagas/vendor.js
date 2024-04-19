import { call, put, takeLatest } from 'redux-saga/effects';
import { vendorActions as actions } from 'src/slices/vendor';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/vendor';

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

function* getVendorListSaga({ payload }) {
  try {
    const res = yield call(api.getVendorList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getVendorListSuccess(res.data?.data));
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

function* deleteVendorSaga({ payload }) {
  try {
    const res = yield call(api.deleteVendor, { data: payload.data });
    if (res.data?.status === 1) {
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Vendor has been deleted',
      ));
      yield put(actions.deleteVendorSuccess(payload.data.vendor_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Vendor unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Vendor unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteMultiVendorSaga({ payload }) {
  try {
    const res = yield call(api.deleteMultiVendor, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Vendor has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteMultiVendorSuccess(payload.vendor_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Vendor unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Vendor unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getVendorDetailSaga({ payload }) {
  try {
    const res = yield call(api.getVendorDetail, payload.id);
    if (res.data?.status === 1) {
      yield put(actions.getVendorDetailSuccess(res.data?.data));
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

function* createVendorSaga({ payload }) {
  try {
    const res = yield call(api.createVendor, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Vendor has been created',
      ));
      if (payload?.onCreateSuccess) {
        payload?.onCreateSuccess(res.data?.data?.id)
      }
      yield put(actions.createVendorSuccess(res.data));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Vendor unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Vendor unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateVendorSaga({ payload }) {
  try {
    const res = yield call(api.updateVendor, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Vendor has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload)
      }
      yield put(actions.updateVendorSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Vendor unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Vendor unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportVendorCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportVendorCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportVendorCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Vendor unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Vendor unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* vendorSaga() {
  yield takeLatest(actions.getVendorList.type, getVendorListSaga);
  yield takeLatest(actions.deleteVendor.type, deleteVendorSaga);
  yield takeLatest(actions.deleteMultiVendor.type, deleteMultiVendorSaga);
  yield takeLatest(actions.getVendorDetail.type, getVendorDetailSaga);
  yield takeLatest(actions.createVendor.type, createVendorSaga);
  yield takeLatest(actions.updateVendor.type, updateVendorSaga);
  yield takeLatest(actions.getExportVendorCSV.type, getExportVendorCSVSaga);
}

export default vendorSaga
