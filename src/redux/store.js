// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import qrReducer from './slices/qrSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    qr: qrReducer,
  },
});

export default store;
