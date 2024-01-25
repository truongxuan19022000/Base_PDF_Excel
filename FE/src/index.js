import 'react-app-polyfill/ie11' // For IE 11 support
import 'react-app-polyfill/stable'
import './polyfill'
import React from 'react'
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import App from './App'
import * as serviceWorker from './serviceWorker'
import configStore from './configStore'

const store = configStore()

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister()
