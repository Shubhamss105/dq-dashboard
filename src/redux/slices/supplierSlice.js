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

// Fetch suppliers
export const fetchSuppliers = createAsyncThunk(
    "suppliers/fetchSuppliers",
    async ({ restaurantId }, { rejectWithValue }) => {
      try {
  
        const response = await axios.get(
          `${BASE_URL}/suppliers?restaurantId=${restaurantId}`,
          { headers: getAuthHeaders() }
        );
        return response.data.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.error || "Failed to fetch suppliers");
      }
    }
  );
  

// Add a new supplier
export const addSupplier = createAsyncThunk(
    'suppliers/addSupplier',
    async ({ restaurantId, supplierName, email, phoneNumber, rawItem }, { rejectWithValue }) => {
      try {
  
        const response = await axios.post(
          `${BASE_URL}/suppliers`,
          { supplierName, email, phoneNumber, rawItem,restaurantId },
          { headers: getAuthHeaders() }
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add supplier');
      }
    }
  );
  

// Update a supplier
export const updateSupplier = createAsyncThunk(
    'suppliers/updateSupplier',
    async ({ id, restaurantId, supplierName, email, phoneNumber, rawItem }, { rejectWithValue }) => {
      try {
  
        const response = await axios.put(
          `${BASE_URL}/suppliers/${id}`,
          { supplierName, email, phoneNumber, rawItem,restaurantId },
          { headers: getAuthHeaders() } 
        );
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update supplier');
      }
    }
  );
  

// Delete a supplier
export const deleteSupplier = createAsyncThunk(
    'suppliers/deleteSupplier',
    async ({ id, restaurantId }, { rejectWithValue }) => {
      try {
  
        const response = await axios.delete(
          `${BASE_URL}/suppliers/${id}`,
          { headers: getAuthHeaders() }
        );
        return { id, message: response.data.message };
      } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete supplier');
      }
    }
  );
  

// Slice
const supplierSlice = createSlice({
    name: "suppliers",
    initialState: {
      suppliers: [],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      // Fetch suppliers
      builder
        .addCase(fetchSuppliers.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchSuppliers.fulfilled, (state, action) => {
          state.loading = false;
          state.suppliers = action.payload;
        })
        .addCase(fetchSuppliers.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          toast.error("Failed to fetch suppliers.");
        });
  
      // Add supplier
      builder
        .addCase(addSupplier.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addSupplier.fulfilled, (state, action) => {
          state.loading = false;
          state.suppliers.push(action.payload.data);
          toast.success("Supplier added successfully!");
        })
        .addCase(addSupplier.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          toast.error(action.payload || "Failed to add supplier.");
        });
  
      // Update supplier
      builder
        .addCase(updateSupplier.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(updateSupplier.fulfilled, (state, action) => {
          state.loading = false;
          const updatedSupplier = action.payload.data;
          const index = state.suppliers.findIndex(
            (supplier) => supplier.id === updatedSupplier.id
          );
          if (index !== -1) {
            state.suppliers[index] = updatedSupplier;
          }
          toast.success("Supplier updated successfully!");
        })
        .addCase(updateSupplier.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          toast.error(action.payload || "Failed to update supplier.");
        });
  
      // Delete supplier
      builder
        .addCase(deleteSupplier.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deleteSupplier.fulfilled, (state, action) => {
          state.loading = false;
          state.suppliers = state.suppliers.filter(
            (supplier) => supplier.id !== action.payload.id
          );
          toast.success("Supplier deleted successfully!");
        })
        .addCase(deleteSupplier.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
          toast.error(action.payload || "Failed to delete supplier.");
        });
    },
  });

export default supplierSlice.reducer;
