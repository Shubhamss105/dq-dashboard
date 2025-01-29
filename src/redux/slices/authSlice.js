import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const configureHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, credentials);
      return response.data;
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

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.post(`${BASE_URL}/logout`, {}, configureHeaders(token));
      return true; // Logout successful
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed.');
    }
  }
);

// Async thunk to fetch restaurant details
export const fetchRestaurantDetails = createAsyncThunk(
  'auth/fetchRestaurantDetails',
  async ({ restaurantId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/rest-profile/${restaurantId}`, configureHeaders(token));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant details');
    }
  }
);

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
    localLogout: (state) => {
      state.user = null;
      state.token = null;
      state.restaurantId = null;

      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('restaurantId');
      localStorage.removeItem('userId');

      toast.info('Logged out locally.', { autoClose: 3000 });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        toast.success('OTP sent to email', { autoClose: 3000 });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Login failed: ${action.payload}`, { autoClose: 3000 });
      });

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

        localStorage.setItem('authToken', action.payload.token);
        localStorage.setItem('restaurantId', action.payload.restaurant_id);
        localStorage.setItem('userId', action.payload.user_id);

        toast.success('OTP verified successfully!', { autoClose: 3000 });
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`OTP verification failed: ${action.payload}`, { autoClose: 3000 });
      });

    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.user = null;
        state.token = null;
        state.restaurantId = null;

        localStorage.removeItem('authToken');
        localStorage.removeItem('restaurantId');
        localStorage.removeItem('userId');

        toast.info('You have been logged out.', { autoClose: 3000 });
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Logout failed: ${action.payload}`, { autoClose: 3000 });
      })

            // Fetch a restaurant by ID
            .addCase(fetchRestaurantDetails.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
              state.loading = false;
              state.auth = action.payload;
            })
            .addCase(fetchRestaurantDetails.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload;
              toast.error(action.payload);
            })
  },
});

// Export localLogout action
export const { localLogout } = authSlice.actions;

// Selector for auth data
export const selectAuth = (state) => ({
  restaurantId: state.auth.restaurantId,
  token: state.auth.token,
  userId: state.auth.user,
});

export default authSlice.reducer;
