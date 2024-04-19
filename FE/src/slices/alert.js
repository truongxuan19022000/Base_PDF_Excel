import { createSlice } from '@reduxjs/toolkit'
import { useInjectReducer } from '../utils/redux-injector'

export const initialState = {
  isShowAlert: true,
  alertData: {},
  turnOffTime: 3000,
}

const slice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    openAlert(state, action) {
      state.isShowAlert = true;
      state.alertData = action?.payload;
      state.turnOffTime = 3000;
    },
    closeAlert(state) {
      state.isShowAlert = false;
      state.alertData = {};
    },
    handleHoverOnAlert(state, action) {
      state.alertData.isHovered = true;
      state.turnOffTime = action?.payload;
    },
    handleMouseOutAlert(state, action) {
      state.alertData.isHovered = false;
      state.turnOffTime = action?.payload;
    },
  },
})

export const { actions: alertActions } = slice

export const useAlertSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer })
  return { actions: slice.actions }
}
