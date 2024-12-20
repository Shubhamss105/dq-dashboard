import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// GET API: Fetch restaurant profile
export const getRestaurantProfile = createAsyncThunk(
  'restaurantProfile/getRestaurantProfile',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`${BASE_URL}/rest-profile/${restaurantId}`, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

// PUT API: Update restaurant profile
export const updateRestaurantProfile = createAsyncThunk(
  'restaurantProfile/updateRestaurantProfile',
  async ({ restaurantId, profileData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.put(`${BASE_URL}/profile/${restaurantId}`, profileData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

const restaurantProfileSlice = createSlice({
  name: 'restaurantProfile',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Restaurant Profile
      .addCase(getRestaurantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch restaurant profile.');
      })

      // Update Restaurant Profile
      .addCase(updateRestaurantProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurantProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        toast.success('Profile updated successfully.');
      })
      .addCase(updateRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to update profile.');
      });
  },
});

export default restaurantProfileSlice.reducer;
