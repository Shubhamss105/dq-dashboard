// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      return response.data; // Returns the API response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for OTP verification
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/verify-otp`, otpData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed.');
    }
});

// Initial state
const initialState = {
  user: localStorage.getItem('userId') || null,
  token: localStorage.getItem('authToken') || null,
  restaurantId: localStorage.getItem('restaurantId') || null,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.restaurantId = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('restaurantId');
      localStorage.removeItem('userId');
      toast.info('You have been logged out.', { autoClose: 3000 });
    },
  },
  extraReducers: (builder) => {
    // Handle login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Show success toast
        toast.success('OTP sent to email', { autoClose: 3000 });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Show error toast
        toast.error(`Login failed: ${action.payload}`, { autoClose: 3000 });
      });

    // Handle OTP verification
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.restaurantId = action.payload.restaurant_id;
        state.user = action.payload.user_id;

        // Save to localStorage
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('restaurantId', action.payload.restaurant_id);
        localStorage.setItem('userId', action.payload.user_id);

        // Show success toast
        toast.success('OTP verified successfully!', { autoClose: 3000 });
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Show error toast
        toast.error(`OTP verification failed: ${action.payload}`, { autoClose: 3000 });
      });
  },
});

export const { logout } = authSlice.actions;

export const selectAuth = (state) => ({
  restaurantId: state.auth.restaurantId,
  token: state.auth.token,
  userId: state.auth.user,
});

export default authSlice.reducer;
