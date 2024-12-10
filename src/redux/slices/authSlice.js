// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';

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
  

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    restaurantId: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.restaurantId = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('restaurantId');
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
        // Additional processing can be done here if needed
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
        state.restaurantId = action.payload.restaurantId;

        // Save to localStorage
        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('restaurantId', action.payload.restaurantId);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export the logout action
export const { logout } = authSlice.actions;

export default authSlice.reducer;
