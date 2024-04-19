import { call, put, takeLatest } from 'redux-saga/effects';

import { claimsActions as actions } from 'src/slices/claims';
import { alertActions } from 'src/slices/alert';
import { ALERT } from 'src/constants/config';

import * as api from '../api/claims';
import { customerActions } from 'src/slices/customer';

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

function* getClaimsListSaga({ payload }) {
  try {
    const res = yield call(api.getClaimsList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getClaimsListSuccess(res.data.data));
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* getTotalAmountClaimSaga({ payload }) {
  try {
    const res = yield call(api.getTotalAmountClaim, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getTotalAmountClaimSuccess(res.data));
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* deleteClaimSaga({ payload }) {
  try {
    const res = yield call(api.deleteClaim, { data: payload.data });
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Claim has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteClaimSuccess(payload.data.claim_id));
      yield put(customerActions.handleResetFetchedLogsData());
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Claim unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Claim unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* deleteMultiClaimSaga({ payload }) {
  try {
    const res = yield call(api.deleteMultiClaim, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Claim has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteMultiClaimSuccess(payload.claim_id));
      yield put(customerActions.handleResetFetchedLogsData());
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Claim unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Claim unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* getExportClaimsCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportClaimsCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Exported',
        'Claim has been exported',
      ));
      yield put(actions.getExportClaimsCSVSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Claim unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Claim unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* createClaimSaga({ payload }) {
  try {
    const res = yield call(api.createClaim, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Claim has been created',
      ));
      yield put(actions.createClaimSuccess(res.data));
      if (payload?.onCreateClaimSuccess) {
        payload?.onCreateClaimSuccess(res.data?.data?.id)
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Claim unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Claim unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* createClaimCopySaga({ payload }) {
  try {
    const res = yield call(api.createClaimCopy, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Claim has been created',
      ));
      yield put(actions.createClaimCopySuccess(res.data));
      if (payload?.onCreateClaimSuccess) {
        payload?.onCreateClaimSuccess(res.data?.data?.id)
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Claim unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Claim unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* getClaimDetailSaga({ payload }) {
  try {
    const res = yield call(api.getClaimDetail, payload.id);
    if (res.data?.status === 1) {
      yield put(actions.getClaimDetailSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.getClaimDetailError) {
        payload?.getClaimDetailError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.getClaimDetailError) {
      payload?.getClaimDetailError('There was a problem.')
    }
  }
}

function* getCopyClaimDetailSaga({ payload }) {
  try {
    const res = yield call(api.getClaimDetail, payload.id);
    if (res.data?.status === 1) {
      yield put(actions.getCopyClaimDetailSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.getClaimDetailError) {
        payload?.getClaimDetailError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.getClaimDetailError) {
      payload?.getClaimDetailError('There was a problem.')
    }
  }
}

function* getClaimTabInfoSaga({ payload }) {
  try {
    const res = yield call(api.getClaimTabInfo, payload.id);
    if (res.data?.status === 1) {
      yield put(actions.getClaimTabInfoSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.getClaimDetailError) {
        payload?.getClaimDetailError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.getClaimDetailError) {
      payload?.getClaimDetailError('There was a problem.')
    }
  }
}

function* getClaimRevenueSaga({ payload }) {
  try {
    const res = yield call(api.getClaimRevenue, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getClaimRevenueSuccess(res.data?.data));
    } else {
      yield put(addFailedAlert(
        'Get Data Failed',
        'Claim data unable to get',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Get Data Failed',
      'Claim data unable to get',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateClaimProgressSaga({ payload }) {
  try {
    const res = yield call(api.updateClaimProgress, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Claim has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateClaimProgressSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Claim unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Claim unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* downloadClaimPDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadClaimPDF, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onDownloadSuccess) {
        payload?.onDownloadSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Downloaded',
        'Claim has been downloaded',
      ));
      yield put(actions.downloadClaimPDFSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Downloaded Failed',
        'Claim unable to download',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Downloaded Failed',
      'Claim unable to download',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateClaimDetailSaga({ payload }) {
  try {
    const res = yield call(api.updateClaimDetail, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Claim has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.updateClaimDetailSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Claim unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Claim unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateTaxSaga({ payload }) {
  try {
    const res = yield call(api.updateTax, payload);
    if (res.data?.status === 1 && payload) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Gst rate has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload.gst_rates)
      }
      yield put(actions.updateTaxSuccess(payload.gst_rates));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Gst rate unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Gst rate unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* sendClaimPDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadClaimPDF, payload);
    if (res.data?.status === 1) {
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.url)
      }
    } else {
      yield put(addFailedAlert(
        'Sended Failed',
        'Claim unable to send',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Sended Failed',
      'Claim unable to send',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* claimsSaga() {
  yield takeLatest(actions.getClaimsList.type, getClaimsListSaga);
  yield takeLatest(actions.getTotalAmountClaim.type, getTotalAmountClaimSaga);
  yield takeLatest(actions.deleteClaim.type, deleteClaimSaga);
  yield takeLatest(actions.deleteMultiClaim.type, deleteMultiClaimSaga);
  yield takeLatest(actions.getExportClaimsCSV.type, getExportClaimsCSVSaga);
  yield takeLatest(actions.createClaim.type, createClaimSaga);
  yield takeLatest(actions.getClaimDetail.type, getClaimDetailSaga);
  yield takeLatest(actions.getClaimRevenue.type, getClaimRevenueSaga);
  yield takeLatest(actions.createClaimCopy.type, createClaimCopySaga);
  yield takeLatest(actions.getClaimTabInfo.type, getClaimTabInfoSaga);
  yield takeLatest(actions.updateClaimProgress.type, updateClaimProgressSaga);
  yield takeLatest(actions.getCopyClaimDetail.type, getCopyClaimDetailSaga);
  yield takeLatest(actions.downloadClaimPDF.type, downloadClaimPDFSaga);
  yield takeLatest(actions.updateClaimDetail.type, updateClaimDetailSaga);
  yield takeLatest(actions.updateTax.type, updateTaxSaga);
  yield takeLatest(actions.sendClaimPDF.type, sendClaimPDFSaga);
}

export default claimsSaga
