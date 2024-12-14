// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import qrReducer from './slices/qrSlice';
import categoryReducer from './slices/categorySlice';
import supplierReducer from './slices/supplierSlice';
import stockReducer from './slices/stockSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    qr: qrReducer,
    category: categoryReducer,
    suppliers: supplierReducer,
    inventories: stockReducer,
  },
});

export default store;
