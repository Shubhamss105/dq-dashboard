import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/constants';

// Fetch all orders for a restaurant
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${BASE_URL}/orders?restaurantId=${restaurantId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

// Fetch order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${BASE_URL}/orders/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order details');
    }
  }
);

// Change order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.put(
        `${BASE_URL}/orders/${id}/status`,
        { status },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Error in API:', error.response?.data); 
      return rejectWithValue(error.response?.data?.error || 'Failed to change order status');
    }
  }
);


// Fetch orders with notification status 0 for a restaurant
export const fetchNotificationOrders = createAsyncThunk(
  'orders/fetchNotificationOrders',
  async ({ restaurantId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`${BASE_URL}/notification/${restaurantId}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch notification orders');
    }
  }
);

// Update order notification status
export const updateOrderNotificationStatus = createAsyncThunk(
  'orders/updateOrderNotificationStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.put(
        `${BASE_URL}/orders/status/notification/${id}`,
        { status },
        { headers }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update notification status');
    }
  }
);

// Delete an order by ID
export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.delete(`${BASE_URL}/orders/${id}`, { headers });
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete order');
    }
  }
);

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    orderDetails: null,
    notificationOrders: [],
    newOrderCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetNewOrderCount: (state) => {
      state.newOrderCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // const newOrders = action.payload.filter(
        //   (order) => !state.orders.find((o) => o.id === order.id)
        // );
        // state.newOrderCount += newOrders.length;
        state.orders = action.payload.data;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch orders.');
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch order details.');
      });

// Change order status
builder
  .addCase(updateOrderStatus.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(updateOrderStatus.fulfilled, (state, action) => {
    state.loading = false;
    const updatedOrder = action.payload.order;

    const index = state.orders.findIndex((order) => order.order_id === updatedOrder.id);
    if (index !== -1) {
        state.orders[index] = { ...state.orders[index], status: updatedOrder.status };
    } else {
        console.log('Order not found.');
    }
})
  .addCase(updateOrderStatus.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
    toast.error('Failed to change order status.');
  });


    // Update notification status
    builder
      .addCase(updateOrderNotificationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderNotificationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload.data;
        const index = state.orders.findIndex((order) => order.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index].notification_status = updatedOrder.notification_status;
        }
        toast.success('Notification status updated successfully!');
      })
      .addCase(updateOrderNotificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.data;
        toast.error('Failed to update notification status.');
      });

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter((order) => order.id !== action.payload.id);
        toast.success('Order deleted successfully!');
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to delete order.');
      });
  },
});

// export const { resetNewOrderCount } = orderSlice.actions;

export default orderSlice.reducer;
