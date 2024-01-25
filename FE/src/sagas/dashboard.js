import { call, put, takeLatest } from 'redux-saga/effects'
import { dashboardActions as actions } from '../slices/dashboard'
import { getFoo } from '../api/foo';

function* initDashboard({ payload }) {
  try {
    const response = yield call(getFoo);
    console.log(response);
    yield put(actions.initDashboardSuccess())
  } catch {
  }
}

export function* dashboardSaga() {
  yield takeLatest(actions.initDashboard.type, initDashboard)
}
