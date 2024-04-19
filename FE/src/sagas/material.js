import { call, put, takeLatest } from 'redux-saga/effects';
import { materialActions as actions } from 'src/slices/material';
import { ALERT, PAGINATION } from 'src/constants/config';
import { alertActions } from 'src/slices/alert';

import * as api from '../api/material';
import { handleFormData } from 'src/helper/helper';

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
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Material has been deleted',
      ));
      yield put(actions.multiDeleteMaterialSuccess(payload?.material_id));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload?.material_id)
      }
      const material_res = yield call(api.getMaterialList, payload);
      if (material_res.data?.status === 1) {
        yield put(actions.getMaterialListSuccess(material_res.data));
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Material unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Material unable to delete',
    ));
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
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Material has been saved',
      ));
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
      yield put(addFailedAlert(
        'Save Failed',
        'Material unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Material unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createMaterialItemSaga({ payload }) {
  try {
    const res = yield call(api.createMaterialItem, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Material has been created',
      ));
      if (payload?.onCreatedSuccess) {
        payload?.onCreatedSuccess(res.data?.message)
      }
      const updatedData = {
        ...res.data?.data,
        name: payload?.name || '',
      }
      yield put(actions.createMaterialItemSuccess(updatedData));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Material unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Material unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportMaterialCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportMaterialCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportMaterialCSVSuccess());
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Material unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Material unable to export',
    ));
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

function* handleUploadCSVFileSaga({ payload }) {
  try {
    const formData = handleFormData(payload)
    const res = yield call(api.uploadCSV, formData);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Uploaded',
        'File has been uploaded',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.handleUploadCSVFileSuccess());
    } else {
      const message = res.data[0]?.error.replace(/^Error in row \d+/, '$&:').replace(/\n/g, '<br />');

      yield put(addFailedAlert(
        'Uploaded Failed',
        'File unable to upload',
      ));
      yield put(actions.resetUploadingStatus());
      if (payload?.onError) {
        payload?.onError(message);
      }
    }
  } catch (error) {
    yield put(actions.resetUploadingStatus());
    yield put(addFailedAlert(
      'Uploaded Failed',
      'There was a problem',
    ));
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
  yield takeLatest(actions.handleUploadCSVFile.type, handleUploadCSVFileSaga);
}

export default materialSaga
