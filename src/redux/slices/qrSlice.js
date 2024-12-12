// src/redux/slices/qrSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

// Async thunk for creating a QR code
export const createQrCode = createAsyncThunk(
  'qr/createQrCode',
  async ({ restaurantId, tableNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/qr/create`, { restaurantId, tableNumber });
      return response.data; // Assuming API returns success, qrCodeUrl, etc.
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'QR code creation failed');
    }
  }
);

// QR Slice
const qrSlice = createSlice({
  name: 'qr',
  initialState: {
    qrList: [], // Stores generated QR codes
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle create QR code
      .addCase(createQrCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQrCode.fulfilled, (state, action) => {
        state.loading = false;
        state.qrList.push({
          tableNumber: action.meta.arg.tableNumber,
          qrCodeUrl: action.payload.qrCodeUrl,
        });
        toast.success('QR code generated successfully!', { autoClose: 3000 });
      })
      .addCase(createQrCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(`Error: ${action.payload}`, { autoClose: 3000 });
      });
  },
});

export default qrSlice.reducer;
