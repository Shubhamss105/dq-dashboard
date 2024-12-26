// Import necessary modules
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// Fetch all days' reports
export const fetchAllDaysReports = createAsyncThunk(
  'reports/fetchAllDaysReports',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/reports/${restaurantId}/all-days`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch report by type (daily or payment report)
export const fetchReportByType = createAsyncThunk(
  'reports/fetchReportByType',
  async ({ restaurantId, reportType }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/getReportByType/${restaurantId}`, {
        params: { type: reportType },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Report slice
const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    allDaysReports: [],
    reportByType: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all days' reports
      .addCase(fetchAllDaysReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDaysReports.fulfilled, (state, action) => {
        state.loading = false;
        state.allDaysReports = action.payload;
      })
      .addCase(fetchAllDaysReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch all days reports.');
      })
      // Fetch report by type
      .addCase(fetchReportByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReportByType.fulfilled, (state, action) => {
        state.loading = false;
        state.reportByType = action.payload;
      })
      .addCase(fetchReportByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch report by type.');
      });
  },
});

export default reportSlice.reducer;
