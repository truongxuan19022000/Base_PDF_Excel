import { createSlice } from '@reduxjs/toolkit'
import { useInjectReducer, useInjectSaga } from '../utils/redux-injector'

import { fooSaga } from '../sagas/foo'

export const initialState = {
  for: 'bar'
}

const slice = createSlice({
  name: 'foo',
  initialState,
  reducers: {
    initFoo() {},
  },
})

export const { actions: fooActions } = slice

export const useFooSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: fooSaga })
  return { actions: slice.actions }
}
