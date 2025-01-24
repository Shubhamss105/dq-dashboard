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
  async ({ itemName, itemImage, price, categoryId, restaurantId, stock }, { rejectWithValue }) => {
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
      formData.append('categoryId', categoryId);

      // Append stock data as a JSON string
      if (stock && stock.length > 0) {
        formData.append('stock', JSON.stringify(stock));
      }

      // Append the image file if it exists
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

// Update menu item status
export const updateMenuItemStatus = createAsyncThunk(
  'menu/updateMenuItemStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const response = await axios.put(
        `${BASE_URL}/menus/status`,
        { id, status },
        { headers }
      );

      return { id, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update menu status');
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

      // Update menu item status
    builder
    .addCase(updateMenuItemStatus.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateMenuItemStatus.fulfilled, (state, action) => {
      state.loading = false;
      const { id, status } = action.payload;
      const menuItem = state.menuItems.find((item) => item.id === id);
      if (menuItem) {
        menuItem.status = status;
      }
      toast.success('Menu item status updated successfully!');
    })
    .addCase(updateMenuItemStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      toast.error(action.payload || 'Failed to update menu status.');
    });
  },
});

export default menuSlice.reducer;
