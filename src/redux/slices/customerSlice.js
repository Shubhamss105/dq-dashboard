import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// Fetch customers
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/${restaurantId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.delete(`${BASE_URL}/customer/${id}`,{headers});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Customer slice
const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch Customers.');
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCustomerId = action.meta.arg.id;
        state.customers = state.customers.filter(
          (customer) => customer.id !== deletedCustomerId
        );
        toast.success('Customer deleted successfully.');
      })      
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to delete Customer.');
      });
  },
});

export default customerSlice.reducer;
