import { combineReducers } from 'redux'
import foo from './foo'
const rootState = {
  foo
}
const rootReducer = (injectedReducers) => {
  const appReducer = combineReducers({
    ...rootState,
    ...injectedReducers,
  })

  return (state, action) => {
    if (action.type === 'RESET_ALL_STATE') {
      return appReducer({ auth: state.auth }, action)
    }
    return appReducer(state, action)
  }
}

const createReducer = (injectedReducers = {}) => rootReducer(injectedReducers)

export { rootState, createReducer }
