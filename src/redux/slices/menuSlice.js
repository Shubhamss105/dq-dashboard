import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// Fetch menu items
export const fetchMenuItems = createAsyncThunk(
  'menu/fetchMenuItems',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(
        `${BASE_URL}/menu?restaurantId=${restaurantId}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch menu items');
    }
  }
);

// Add a new menu item
export const addMenuItem = createAsyncThunk(
  'menu/addMenuItem',
  async ({itemName,itemImage,price,categoryId,restaurantId,stock  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      formData.append('itemName', itemName);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('categoryId', categoryId);
      if (itemImage) {
        formData.append('itemImage', itemImage);
      }

      const response = await axios.post(`${BASE_URL}/menu`, formData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add menu item');
    }
  }
);

// Update a menu item
export const updateMenuItem = createAsyncThunk(
  'menu/updateMenuItem',
  async ({ id, restaurantId, itemName, price, description, category, image }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };

      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      formData.append('itemName', itemName);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.put(`${BASE_URL}/menu/${id}`, formData, { headers });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu item');
    }
  }
);

// Delete a menu item
export const deleteMenuItem = createAsyncThunk(
  'menu/deleteMenuItem',
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.delete(`${BASE_URL}/menu/${id}`, { headers });
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu item');
    }
  }
);

// Slice
const menuSlice = createSlice({
  name: 'menuItems',
  initialState: {
    menuItems: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch menu items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload.data;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch menu items.');
      });

    // Add menu item
    builder
      .addCase(addMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems.push(action.payload.data);
        toast.success('Menu item added successfully!');
      })
      .addCase(addMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to add menu item.');
      });

    // Update menu item
    builder
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.data;
        const index = state.menuItems.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
          state.menuItems[index] = updatedItem;
        }
        toast.success('Menu item updated successfully!');
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to update menu item.');
      });

    // Delete menu item
    builder
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = state.menuItems.filter((item) => item.id !== action.payload.id);
        toast.success('Menu item deleted successfully!');
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to delete menu item.');
      });
  },
});

export default menuSlice.reducer;
