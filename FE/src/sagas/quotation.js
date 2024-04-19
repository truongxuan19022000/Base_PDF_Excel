import { call, put, takeLatest } from 'redux-saga/effects';
import { alertActions as alertActions } from 'src/slices/alert';
import { quotationActions as actions } from 'src/slices/quotation';
import { customerActions as customerActions } from 'src/slices/customer';

import * as api from '../api/quotation';
import { ALERT, PAGINATION, QUOTATION } from 'src/constants/config';

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

function* getQuotationListSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationList, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationListSuccess(res.data));
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

function* getTotalAmountQuotationSaga({ payload }) {
  try {
    const res = yield call(api.getTotalAmountQuotation, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getTotalAmountQuotationSuccess(res.data));
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

function* getQuotationDetailSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationDetail, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getQuotationDetailSuccess(res.data?.data));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getQuotationDetailSuccess(res.data?.data));
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

function* multiDeleteQuotationSaga({ payload }) {
  try {
    const res = yield call(api.multiDeleteQuotation, payload);
    if (res.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Deleted',
        'Quotation has been deleted',
      ));
      yield put(actions.multiDeleteQuotationSuccess(payload?.quotation_id));
      if (payload?.onDeleteSuccess) {
        payload?.onDeleteSuccess()
      }
    } else {
      yield put(addFailedAlert(
        'Deletion Failed',
        'Quotation unable to delete',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Deletion Failed',
      'Quotation unable to delete',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* createQuotationSaga({ payload }) {
  try {
    const res = yield call(api.createQuotation, payload);
    if (res?.data?.status === 1) {
      if (payload.is_new_customer) {
        const new_customer = {
          id: res.data?.data?.customer_id,
          name: payload.name,
          phone_number: payload.phone_number,
          email: payload.email,
          created_at: payload.created_at,
        }
        yield put(customerActions.createCustomerSuccess(new_customer));
      }
      if (payload?.onSuccess) {
        const newId = res.data?.data?.id
        payload?.onSuccess(newId)
      }
      const updatedData = {
        ...res.data?.data,
        name: payload?.name || '',
      }
      yield put(addSuccessAlert(
        'Successfully Created',
        'Quotation has been created',
      ));
      yield put(actions.createQuotationSuccess(updatedData));
    } else {
      yield put(addFailedAlert(
        'Creation Failed',
        'Quotation unable to create',
      ));
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Creation Failed',
      'Quotation unable to create',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getExportQuotationCSVSaga({ payload }) {
  try {
    const res = yield call(api.getExportQuotationCSV, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onSuccess) {
        payload?.onSuccess()
      }
      yield put(actions.getExportQuotationCSVSuccess());
      yield put(addSuccessAlert(
        'Successfully Exported',
        'Quotation has been exported',
      ));
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Quotation unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'There was a problem',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* updateQuotationSaga({ payload }) {
  try {
    const res = yield call(api.updateQuotation, payload);
    if (res.data?.status === 1) {
      yield put(actions.updateQuotationSuccess(payload));
      if (payload?.onSuccess) {
        payload.onSuccess(res.data?.message)
      }
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Quotation has been save',
      ));
    } else {
      yield put(addFailedAlert(
        'Save Failed',
        'Quotation unable to save',
      ));
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Save Failed',
      'Quotation unable to save',
    ));
    if (payload?.onError) {
      payload.onError('There was a problem.')
    }
  }
}

function* getSearchQuotationListSaga({ payload }) {
  try {
    const requestData = {
      search: payload?.search,
      paginate: PAGINATION.GET_ALL_LIST,
    }
    const res = yield call(api.getQuotationList, requestData);
    if (res?.data?.status === 1) {
      yield put(actions.getSearchQuotationListSuccess(res.data.data));
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

function* getQuotationWithPageSaga({ payload }) {
  try {
    const res = yield call(api.getQuotationList, payload);
    if (res?.data?.status === 1) {
      yield put(actions.getQuotationWithPageSuccess(res.data?.data?.quotations));
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

function* getAllQuotationListSaga({ payload }) {
  try {
    const res = yield call(api.getAllQuotationList, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getAllQuotationListSuccess(res.data));
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

function* getApprovedListSaga({ payload }) {
  try {
    const data = { status: [QUOTATION.STATUS_VALUE.APPROVED] }
    const res = yield call(api.getAllQuotationList, data);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getApprovedListSuccess(res.data));
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

function* downloadPDFSaga({ payload }) {
  try {
    const res = yield call(api.downloadPDF, payload);
    if (res.data?.status === 1) {
      window.open(res.data?.url, '_blank');
      if (payload?.onDownloadSuccess) {
        payload?.onDownloadSuccess()
      }
      yield put(addSuccessAlert(
        'Successfully Downloaded',
        'Quotation has been downloaded',
      ));
    } else {
      yield put(addFailedAlert(
        'Download Failed',
        'Quotation unable to download',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Download Failed',
      'There was a problem',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleDiscountChangeSaga({ payload }) {
  try {
    const res = yield call(api.handleDiscountChange, payload);
    if (res.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(addSuccessAlert(
        'Successfully Saved',
        'Discount has been save',
      ));
      yield put(actions.handleDiscountChangeSuccess(payload));
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
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* getRevenueSaga({ payload }) {
  try {
    const res = yield call(api.getRevenue, payload);
    if (res?.data?.status === 1) {
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.getRevenueSuccess(res.data?.data));
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

function* handleSendToApprovalSaga({ payload }) {
  try {
    const res = yield call(api.sendApproval, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        'Successfully Send',
        'Quotation has been sent',
      ));
      if (payload?.onSuccess) {
        payload?.onSuccess(res.data?.message)
      }
      yield put(actions.handleSendToApprovalSuccess(payload.logsInfo));
    } else {
      yield put(addFailedAlert(
        'Send Failed',
        'Quotation unable to send',
      ));
      yield put(actions.resetSubmittingState());
      if (payload?.onError) {
        payload?.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Send Failed',
      'Quotation unable to send',
    ));
    yield put(actions.resetSubmittingState());
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* handleApproveQuotationSaga({ payload }) {
  let actionTitle = '';
  let actionDescription = '';

  switch (payload?.status) {
    case QUOTATION.STATUS_VALUE.APPROVED:
      actionTitle = 'Approved';
      actionDescription = 'approve';
      break;
    case QUOTATION.STATUS_VALUE.REJECTED:
      actionTitle = 'Rejected';
      actionDescription = 'reject';
      break;
    case QUOTATION.STATUS_VALUE.CANCELED:
      actionTitle = 'Canceled';
      actionDescription = 'cancel';
      break;
    default:
      break;
  }

  try {
    const res = yield call(api.handleApproveQuotation, payload);
    if (res?.data?.status === 1) {
      yield put(addSuccessAlert(
        `Successfully ${actionTitle}`,
        `Quotation has been ${actionDescription}d`,
      ));
      if (payload?.onSuccess) {
        payload.onSuccess(res.data?.message);
      }
      yield put(actions.handleApproveQuotationSuccess(payload));
    } else {
      yield put(addFailedAlert(
        `${actionTitle} Failed`,
        `Quotation unable to ${actionDescription}`,
      ));
      yield put(actions.resetSubmittingState());
      if (payload?.onError) {
        payload.onError(res.data?.message);
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      `${actionTitle} Failed`,
      `Quotation unable to ${actionDescription}`,
    ));
    yield put(actions.resetSubmittingState());
    if (payload?.onError) {
      payload.onError('There was a problem.');
    }
  }
}

function* handleSendEmailSaga({ payload }) {
  try {
    const res = yield call(api.downloadPDF, payload);
    if (res.data?.status === 1) {
      if (payload?.onSendSuccess) {
        payload?.onSendSuccess(res.data?.url)
      }
      yield put(addSuccessAlert(
        'Successfully Exportation',
        'Quotation has been export to email',
      ));
    } else {
      yield put(addFailedAlert(
        'Exportation Failed',
        'Quotation unable to export',
      ));
      if (payload?.onError) {
        payload?.onError();
      }
    }
  } catch (error) {
    yield put(addFailedAlert(
      'Exportation Failed',
      'There was a problem',
    ));
    if (payload?.onError) {
      payload?.onError('There was a problem.')
    }
  }
}

function* quotationSaga() {
  yield takeLatest(actions.getQuotationList.type, getQuotationListSaga);
  yield takeLatest(actions.getTotalAmountQuotation.type, getTotalAmountQuotationSaga);
  yield takeLatest(actions.getQuotationDetail.type, getQuotationDetailSaga);
  yield takeLatest(actions.updateQuotation.type, updateQuotationSaga);
  yield takeLatest(actions.createQuotation.type, createQuotationSaga);
  yield takeLatest(actions.getQuotationWithPage.type, getQuotationWithPageSaga);
  yield takeLatest(actions.multiDeleteQuotation.type, multiDeleteQuotationSaga);
  yield takeLatest(actions.getExportQuotationCSV.type, getExportQuotationCSVSaga);
  yield takeLatest(actions.getSearchQuotationList.type, getSearchQuotationListSaga);
  yield takeLatest(actions.getAllQuotationList.type, getAllQuotationListSaga);
  yield takeLatest(actions.downloadPDF.type, downloadPDFSaga);
  yield takeLatest(actions.getRevenue.type, getRevenueSaga);
  yield takeLatest(actions.handleDiscountChange.type, handleDiscountChangeSaga);
  yield takeLatest(actions.handleSendToApproval.type, handleSendToApprovalSaga);
  yield takeLatest(actions.handleApproveQuotation.type, handleApproveQuotationSaga);
  yield takeLatest(actions.handleSendEmail.type, handleSendEmailSaga);
  yield takeLatest(actions.getApprovedList.type, getApprovedListSaga);
}

export default quotationSaga
