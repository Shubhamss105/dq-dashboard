// Order.js
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { fetchOrders, updateOrderStatus } from '../../redux/slices/orderSlice'
import { CButton, CSpinner } from '@coreui/react'
import CustomToolbar from '../../utils/CustomToolbar'

const Order = () => {
  const dispatch = useDispatch()
  const { orders, loading } = useSelector((state) => state.orders)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchOrders({ restaurantId }))
    }
  }, [dispatch, restaurantId])

// Handle order status update
const handleStatusChange = async (id, status) => {
  
  await dispatch(updateOrderStatus({ id, status }));

  await dispatch(fetchOrders({ restaurantId }));

  closeSidebar();
};

  

  const closeSidebar = () => {
    setSelectedOrder(null)
  }

  // Generate serial numbers
  let serialCounter = 1
  const generateSerialNumber = () => serialCounter++

  const columns = [
    {
      field: 'sno',
      headerName: 'S.No.',
      flex: 0.5,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.sno,
    },
    {
      field: 'order_id',
      headerName: 'Order Number',
      flex: 1,
      headerClassName: 'header-style',
    },
    {
      field: 'items',
      headerName: 'Items',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) =>
        params.row.order_details
          ?.map((item) => `${item.item_name} (x${item.quantity})`)
          .join(', ') || 'N/A',
    },
    {
      field: 'userName',
      headerName: 'Customer Name',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.user?.name || 'N/A',
    },
    {
      field: 'table_number',
      headerName: 'Table Number',
      flex: 1,
      headerClassName: 'header-style',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      headerClassName: 'header-style',
      renderCell: (params) => (
        <div
          style={{
            padding: '2px 10px',
            borderRadius: '15px',
            color: 'white',
            textAlign: 'center',
            backgroundColor:
              params.value === 'complete'
                ? '#4CAF50'
                : params.value === 'reject'
                  ? '#F44336'
                  : '#FFC107',
          }}
        >
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}{' '}
          {/* Capitalize the first letter */}
        </div>
      ),
    },

    {
      field: 'created_at',
      headerName: 'Datae',
      flex: 1,
      headerClassName: 'header-style',
    },

    {
      field: 'total',
      headerName: 'Total',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => `₹${params.row.total}`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'header-style',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <CButton color="primary" size="sm" onClick={() => setSelectedOrder(params.row)}>
          View Details
        </CButton>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4">Orders</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <DataGrid
          style={{ height: 'auto', width: '100%', backgroundColor: 'white' }}
          rows={orders?.map((order) => ({
            ...order,
            sno: generateSerialNumber(),
          }))}
          getRowId={(row) => row.order_id}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          slots={{ Toolbar: CustomToolbar }}
          sx={{
            '& .header-style': {
              fontWeight: 'bold',
              fontSize: '1.1rem',
            },
          }}
        />
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
            zIndex: 1050, // Ensures it overlays other elements
            borderLeft: '1px solid #ccc',
            overflowY: 'auto',
            padding: '20px',
          }}
        >
          {/* Header */}
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
            <h5 style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Order Details: #{selectedOrder.order_id}</h5>
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

          {/* Content */}
          <div>
            <p>
              <strong>Order Number:</strong> {selectedOrder.order_id}
            </p>
            <p>
              <strong>Customer Name:</strong> {selectedOrder.user?.name || 'N/A'}
            </p>
            <p>
              <strong>Table Number:</strong> {selectedOrder.table_number}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status}
            </p>
            <p>
              <strong>Total:</strong> ₹{selectedOrder.total}
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

          {/* Footer Buttons */}
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
  )
}

export default Order
