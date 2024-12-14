import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// POST API: Create a transaction
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async ({restaurantId}, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/transaction/${restaurantId}`, transactionData);
      toast.success('Transaction created successfully.');
      return response.data;
    } catch (error) {
      toast.error('Failed to create transaction.');
      return rejectWithValue(error.response.data);
    }
  }
);

// GET API: Fetch transactions by restaurantId
export const fetchTransactionsByRestaurant = createAsyncThunk(
  'transactions/fetchTransactionsByRestaurant',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`${BASE_URL}/transactions/${restaurantId}`,{headers});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// GET API: Fetch transaction details by transactionId
export const fetchTransactionDetails = createAsyncThunk(
  'transactions/fetchTransactionDetails',
  async ({ transactionId }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`${BASE_URL}/transactionById/${transactionId}`,{headers});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState: {
    transactions: [],
    transactionDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Transactions by Restaurant
      .addCase(fetchTransactionsByRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactionsByRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch transactions.');
      })

      // Fetch Transaction Details
      .addCase(fetchTransactionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.transactionDetails = action.payload;
      })
      .addCase(fetchTransactionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch transaction details.');
      });
  },
});

export default transactionSlice.reducer;
