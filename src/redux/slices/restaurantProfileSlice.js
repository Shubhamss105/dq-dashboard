import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// GET API: Fetch restaurant profile
export const getRestaurantProfile = createAsyncThunk(
  'restaurantProfile/getRestaurantProfile',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/rest-profile/${restaurantId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);
// GET API: check restaurant permission
export const checkRestaurantPermission = createAsyncThunk(
  'restaurantProfile/checkRestaurantPermission',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/admin/check-permission/${restaurantId}`, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

// PUT API: Update restaurant profile
export const updateRestaurantProfile = createAsyncThunk(
    'restaurantProfile/updateRestaurantProfile',
    async ({ id, profileData }, { rejectWithValue }) => {
      try {
        console.log('profileData',id)
        const token = localStorage.getItem('authToken');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
        // Send restaurantId in the body
        const response = await axios.put(`${BASE_URL}/profile/${id}`, profileData, { headers });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Something went wrong');
      }
    }
  );

  export const uploadRestaurantImage = createAsyncThunk(
    'restaurantProfile/uploadRestaurantImage',
    async ({ id, imageFile }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
  
        const response = await axios.post(`${BASE_URL}/profile/${id}/image`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
  
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Image upload failed');
      }
    }
  );
  

const restaurantProfileSlice = createSlice({
  name: 'restaurantProfile',
  initialState: {
    restaurantProfile: null,
    loading: false,
    error: null,
    restaurantPermission: null
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
        state.restaurantProfile = action.payload;
      })
      .addCase(getRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch restaurant profile.');
      })
      // check restaurant permission
      .addCase(checkRestaurantPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkRestaurantPermission.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantPermission = action.payload;
      })
      .addCase(checkRestaurantPermission.rejected, (state, action) => {
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
        state.restaurantProfile = action.payload;
        toast.success('Profile updated successfully.');
      })
      .addCase(updateRestaurantProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to update profile.');
      });

      builder
  .addCase(uploadRestaurantImage.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(uploadRestaurantImage.fulfilled, (state, action) => {
    state.loading = false;
    state.restaurantProfile.image = action.payload.image; // Update image in state
    toast.success('Image uploaded successfully.');
  })
  .addCase(uploadRestaurantImage.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    toast.error('Failed to upload image.');
  });

  },
});

export default restaurantProfileSlice.reducer;
