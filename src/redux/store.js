// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import qrReducer from './slices/qrSlice';
import categoryReducer from './slices/categorySlice';
import supplierReducer from './slices/supplierSlice';
import stockReducer from './slices/stockSlice';
import menuReducer from './slices/menuSlice';
import customerReducer from './slices/customerSlice';
import transactionReducer from './slices/transactionSlice';
import orderReducer from './slices/orderSlice';
import restaurantProfileReducer from './slices/restaurantProfileSlice';
import reportReducer from './slices/reportSlice';
import dashboardReducer from './slices/dashboardSlice';
import feedbackReducer from './slices/feedbackSlice';
import sidebarReducer from './slices/sidebarSlice';
import reservationReducer from './slices/reservationSlice';

// Configure the Redux store
const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    qr: qrReducer,
    category: categoryReducer,
    suppliers: supplierReducer,
    inventories: stockReducer,
    menuItems: menuReducer,
    customers: customerReducer,
    transactions: transactionReducer,
    orders: orderReducer,
    restaurantProfile: restaurantProfileReducer,
    reports: reportReducer,
    dashboard: dashboardReducer,
    feedbacks: feedbackReducer,
    sidebar: sidebarReducer,
    reservations: reservationReducer,
  },
});

export default store;
