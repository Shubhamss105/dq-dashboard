import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import 'core-js'

import App from './App'
import store from './redux/store'
import { GlobalProvider } from './context/GlobalContext'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <GlobalProvider>
    <App />
    </GlobalProvider>
  </Provider>,
)
