import { createLogger } from 'redux-logger'
import createSagaMiddleware from 'redux-saga'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { createInjectorsEnhancer } from 'redux-injectors'

import { rootState, createReducer } from './reducers'
import rootSaga from './sagas'

const isDev = process.env.NODE_ENV === 'development'
const sagaMiddleware = createSagaMiddleware({})
const { run: runSaga } = sagaMiddleware

let middlewares = [sagaMiddleware]
if (isDev) {
  const logger = createLogger({
    collapsed: true,
  })
  middlewares = [...middlewares, logger]
}

const enhancers = [
  createInjectorsEnhancer({
    createReducer,
    runSaga,
  }),
]

const store = configureStore({
  reducer: createReducer(),
  middleware: [
    ...getDefaultMiddleware({
      immutableCheck: { ignore: Object.keys(rootState) },
      serializableCheck: false,
    }),
    ...middlewares,
  ],
  devTools: isDev,
  enhancers,
})
sagaMiddleware.run(rootSaga)

export default () => {
  return store
}
