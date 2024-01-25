import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'
import { fooActions as actions } from '../slices/foo'

function* initFoo({ payload }) {
  try {
    console.log('Init Foo Saga');
  } catch {
  }
}

export function* fooSaga() {
  yield takeLatest(actions.initFoo.type, initFoo)
}
