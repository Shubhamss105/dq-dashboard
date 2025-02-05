import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../utils/constants";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Fetch all dues
export const fetchDues = createAsyncThunk(
  "dues/fetchDues",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/dues`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dues");
    }
  }
);

// Add a new due
export const addDue = createAsyncThunk(
  "dues/addDue",
  async ({ transaction_id, total, status }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/dues`,
        { transaction_id, total, status },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add due");
    }
  }
);

// Update a due
export const updateDue = createAsyncThunk(
  "dues/updateDue",
  async ({ id, transaction_id, total, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/dues/${id}`,
        { transaction_id, total, status },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update due");
    }
  }
);

// Delete a due
export const deleteDue = createAsyncThunk(
  "dues/deleteDue",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/dues/${id}`, {
        headers: getAuthHeaders(),
      });
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete due");
    }
  }
);

// Slice
const dueSlice = createSlice({
  name: "dues",
  initialState: {
    dues: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch dues
    builder
      .addCase(fetchDues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDues.fulfilled, (state, action) => {
        state.loading = false;
        state.dues = action.payload;
      })
      .addCase(fetchDues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error("Failed to fetch dues.");
      });

    // Add due
    builder
      .addCase(addDue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDue.fulfilled, (state, action) => {
        state.loading = false;
        state.dues.push(action.payload);
        toast.success("Due added successfully!");
      })
      .addCase(addDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to add due.");
      });

    // Update due
    builder
      .addCase(updateDue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDue.fulfilled, (state, action) => {
        state.loading = false;
        const updatedDue = action.payload;
        const index = state.dues.findIndex((due) => due.id === updatedDue.id);
        if (index !== -1) {
          state.dues[index] = updatedDue;
        }
        // toast.success("Due updated successfully!");
      })
      .addCase(updateDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update due.");
      });

    // Delete due
    builder
      .addCase(deleteDue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDue.fulfilled, (state, action) => {
        state.loading = false;
        state.dues = state.dues.filter((due) => due.due_details.id !== action.payload.id);
      })
      .addCase(deleteDue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to delete due.");
      });
  },
});

export default dueSlice.reducer;
