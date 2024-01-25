import { createSlice } from '@reduxjs/toolkit'
import { useInjectReducer, useInjectSaga } from '../utils/redux-injector'

import { dashboardSaga } from '../sagas/dashboard'

export const initialState = {
  dash: 'board'
}

const slice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    initDashboard() {},
    initDashboardSuccess() {},
  },
})

export const { actions: dashboardActions } = slice

export const useDashboardSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  useInjectSaga({ key: slice.name, saga: dashboardSaga })
  return { actions: slice.actions }
}
