import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import { CButton, CSpinner } from '@coreui/react';
import CustomToolbar from '../../utils/CustomToolbar';
import { format } from 'date-fns';
import { useMediaQuery } from '@mui/material';

const Order = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchOrders({ restaurantId }));
    }
  }, [dispatch, restaurantId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
      closeSidebar();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const closeSidebar = () => setSelectedOrder(null);

  // Style based on status
  const getStatusStyle = (status) => ({
    padding: '2px 10px',
    borderRadius: '15px',
    color: 'white',
    textAlign: 'center',
    backgroundColor:
      status === 'complete'
        ? '#4CAF50'
        : status === 'reject'
        ? '#F44336'
        : '#FFC107',
  });

  const columns = [
    // { field: 'sno', headerName: 'S.No.', flex: isMobile ? undefined : 0.5, minWidth: isMobile ? 80 : undefined, headerClassName: 'header-style' },
    { field: 'order_id', headerName: 'Order Number', flex: isMobile ? undefined : 1, minWidth: isMobile ? 120 : undefined, headerClassName: 'header-style' },
    {
      field: 'items',
      headerName: 'Items',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
      valueGetter: (params) =>
        params.row.order_details
          ?.map((item) => `${item.item_name} (x${item.quantity})`)
          .join(', ') || 'N/A',
    },
    {
      field: 'userName',
      headerName: 'Customer Name',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.user?.name || 'N/A',
    },
    {
      field: 'table_number',
      headerName: 'Table Number',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 120 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 120 : undefined,
      headerClassName: 'header-style',
      renderCell: (params) => (
        <div style={getStatusStyle(params.value)}>
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </div>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Date',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
      valueGetter: (params) =>
        format(new Date(params.row.created_at), 'dd/MM/yyyy HH:mm'),
    },
    {
      field: 'total',
      headerName: 'Total',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 100 : undefined,
      headerClassName: 'header-style',
      valueGetter: (params) => `₹${params.row.total || 0}`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 100 : undefined,
      headerClassName: 'header-style',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <CButton
          color="primary"
          size={isMobile ? 'sm' : 'md'} // Adjust button size for mobile
          style={isMobile ? { padding: '5px 10px', fontSize: '0.8rem', marginRight:'1rem' } : {}}
          onClick={() => setSelectedOrder(params.row)}
        >
          View Details
        </CButton>
      ),
    },
  ];

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <h2 className="mb-4">Orders</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <DataGrid
            style={{ height: 'auto', width: '100%', backgroundColor: 'white' }}
            rows={orders
              ?.slice()
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((order, index) => ({
                ...order,
                sno: index + 1,
              }))}
              getRowId={(row) => row.id || row.data?.id || Math.random()}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            slots={{ Toolbar: CustomToolbar }}
            sx={{
              '& .header-style': {
                fontWeight: 'bold',
                fontSize: '1.1rem',
              },
              '@media (max-width: 600px)': {
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontSize: '0.9rem',
                },
                '& .MuiDataGrid-cell': {
                  fontSize: '0.8rem',
                },
              },
            }}
          />
        </div>
      )}

      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            height: '100vh',
            width: '30%',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            borderLeft: '1px solid #ccc',
            overflowY: 'auto',
            padding: '20px',
            ...(window.innerWidth <= 500 && { width: '70%' }),
          }}
        >
          {/* Sidebar content */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #ddd',
              paddingBottom: '10px',
              marginBottom: '20px',
            }}
          >
            <h5 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              Order Details: #{selectedOrder.order_id}
            </h5>
            <button
              onClick={closeSidebar}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>
          </div>
          <div>
            <p>
              <strong>Order Number:</strong> {selectedOrder.order_id}
            </p>
            <p>
              <strong>Customer Name:</strong> {selectedOrder.user?.name || 'N/A'}
            </p>
            <p>
              <strong>Customer Address:</strong> {selectedOrder.user?.address || 'N/A'}
            </p>
            <p>
              <strong>Table Number:</strong> {selectedOrder.table_number}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{selectedOrder.total || 0}
            </p>
            <p>
              <strong>Items:</strong>
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              {selectedOrder.order_details?.map((item, index) => (
                <li key={index}>
                  {item.item_name} (x{item.quantity})
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
            }}
          >
            <CButton
              color="success"
              onClick={() => handleStatusChange(selectedOrder.order_id, 'complete')}
              style={{ flex: '0 0 48%' }}
            >
              Mark as Complete
            </CButton>
            <CButton
              color="danger"
              onClick={() => handleStatusChange(selectedOrder.order_id, 'reject')}
              style={{ flex: '0 0 48%' }}
            >
              Reject Order
            </CButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;