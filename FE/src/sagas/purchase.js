import { call, put, takeLatest } from 'redux-saga/effects';
import { purchaseActions as actions, purchaseActions } from 'src/slices/purchase';
import { alertActions } from 'src/slices/alert';
import { ALERT, DEFAULT_GST_VALUE, DISCOUNT } from 'src/constants/config';

import * as api from '../api/purchase';

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

function* getVendorPurchaseListSaga({ payload }) {
  try {
    const res = yield call(api.getPurchaseList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getVendorPurchaseListSuccess(res.data?.data));
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

function* deletePurchaseSaga({ payload }) {
  try {
    const res = yield call(api.deletePurchase, { data: payload.data });
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Purchase order has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deletePurchaseSuccess(payload.data.purchase_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Purchase order unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Purchase order unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* deleteMultiPurchaseSaga({ payload }) {
  try {
    const res = yield call(api.deleteMultiPurchase, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Purchase order has been deleted',
      ));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess(res.data?.message)
      }
      yield put(actions.deleteMultiPurchaseSuccess(payload.purchase_id));
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Purchase order unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Purchase order unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getPurchaseDetailSaga({ payload }) {
  try {
    const res = yield call(api.getPurchaseDetail, payload);
    if (res.data?.status === 1) {
      const purchase = res.data?.data?.purchase_orders;
      const bottomBarData = {
        tax: purchase?.tax || 0,
        subTotal: purchase?.subtotal || 0,
        grandTotal: purchase?.total_amount || 0,
        shippingFee: purchase?.shipping_fee || 0,
        discountAmount: purchase?.discount_amount || 0,
        gstAmount: +purchase?.subtotal * ((+purchase?.tax || DEFAULT_GST_VALUE) / 100 || 0),
        discountType: purchase?.discount_type || DISCOUNT.TYPE.PERCENT,
      }
      yield put(actions.getPurchaseDetailSuccess(res.data?.data));
      yield put(purchaseActions.handleSetBottomBarData(bottomBarData));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      if (payload?.getClaimDetailError) {
        payload?.getClaimDetailError(res.data?.message);
      }
    }
  } catch (error) {
    if (payload?.getClaimDetailError) {
      payload?.getClaimDetailError('There was a problem.')
    }
  }
}

function* createPurchaseSaga({ payload }) {
  try {
    const res = yield call(api.createPurchase, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Created',
        'Purchase order has been created',
      ));
      yield put(actions.createPurchaseSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.data?.id)
      }
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Purchase order unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Purchase order unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateShippingFeeSaga({ payload }) {
  try {
    const res = yield call(api.updateShippingFee, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Shipping fee has been saved',
      ));
      yield put(actions.updateShippingFeeSuccess(payload?.shipping_fee));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.data?.id)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Shipping fee unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Shipping fee unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* updateDiscountSaga({ payload }) {
  try {
    const res = yield call(api.updateDiscount, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Discount has been saved',
      ));
      yield put(actions.updateDiscountSuccess(payload));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Discount unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Discount unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}
function* updateTaxSaga({ payload }) {
  try {
    const res = yield call(api.updateTax, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'GST rate has been saved',
      ));
      yield put(actions.updateTaxSuccess(payload?.tax));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'GST rate unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'GST rate unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleOrderChangeSaga({ payload }) {
  try {
    const res = yield call(api.handleOrderChange, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Action has been saved',
      ));
      yield put(actions.handleOrderChangeSuccess());
      yield put(actions.updateSubtotal(+payload?.subtotal));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Action unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Action unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updatePurchaseSaga({ payload }) {
  try {
    const res = yield call(api.updatePurchase, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Purchase order has been saved',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(payload)
      }
      yield put(actions.updatePurchaseSuccess(payload));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Purchase order unable to save',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Purchase order unable to save',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* exportPurchaseCSVSaga({ payload }) {
  try {
    const res = yield call(api.exportPurchaseCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Purchase order unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'Purchase order unable to export',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* downloadPurchasePDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadPurchasePDF, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onDownloadSuccess) {
        payload?.onDownloadSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Downloaded',
        'Purchase order has been downloaded',
      ));
    } else {
      yield put(addFailedAlert(
        'Download Failed',
        'Purchase order unable to download',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Download Failed',
      'Purchase order unable to download',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* sendPurchasePDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadPurchasePDF, payload);
    if (res.data?.status === 1) {
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.url)
      }
    } else {
      yield put(addFailedAlert(
        'Sended Failed',
        'Purchase order unable to send',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Sended  Failed',
      'Purchase order unable to send',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updatePurchaseStatusSaga({ payload }) {
  try {
    const res = yield call(api.updatePurchaseStatus, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(payload)
      }
      yield put(actions.updatePurchaseStatusSuccess(payload?.purchase_order_id));
    } else {
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'There was a problem.',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* purchaseSaga() {
  yield takeLatest(actions.getVendorPurchaseList.type, getVendorPurchaseListSaga);
  yield takeLatest(actions.deletePurchase.type, deletePurchaseSaga);
  yield takeLatest(actions.deleteMultiPurchase.type, deleteMultiPurchaseSaga);
  yield takeLatest(actions.getPurchaseDetail.type, getPurchaseDetailSaga);
  yield takeLatest(actions.createPurchase.type, createPurchaseSaga);
  yield takeLatest(actions.updateShippingFee.type, updateShippingFeeSaga);
  yield takeLatest(actions.updateDiscount.type, updateDiscountSaga);
  yield takeLatest(actions.updateTax.type, updateTaxSaga);
  yield takeLatest(actions.handleOrderChange.type, handleOrderChangeSaga);
  yield takeLatest(actions.updatePurchase.type, updatePurchaseSaga);
  yield takeLatest(actions.downloadPurchasePDF.type, downloadPurchasePDFSaga);
  yield takeLatest(actions.exportPurchaseCSV.type, exportPurchaseCSVSaga);
  yield takeLatest(actions.sendPurchasePDF.type, sendPurchasePDFSaga);
  yield takeLatest(actions.updatePurchaseStatus.type, updatePurchaseStatusSaga);
}

export default purchaseSaga
