import { call, put, takeLatest } from 'redux-saga/effects'
import { dashboardActions as actions } from '../slices/dashboard'
import { getFoo } from '../api/foo';
import * as api from '../api/dashboard';

function* initDashboard({ payload }) {
  try {
    const response = yield call(getFoo);
    console.log(response);
    yield put(actions.initDashboardSuccess())
  } catch {
  }
}

function* getSalesRevenueSaga({ payload }) {
  try {
    const response = yield call(api.getSalesRevenue, payload);
    if (response.data?.status === 1) {
      yield put(actions.getSalesRevenueSuccess(response.data?.data))
    }
  } catch {
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


export function* dashboardSaga() {
  yield takeLatest(actions.initDashboard.type, initDashboard)
  yield takeLatest(actions.getSalesRevenue.type, getSalesRevenueSaga)
  yield takeLatest(actions.getMessages.type, getMessagesSaga)
}
