// Customer.js
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {DataGrid} from '@mui/x-data-grid'
import { fetchCustomers } from '../../redux/slices/customerSlice'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen, cilChatBubble } from '@coreui/icons'
import CustomToolbar from '../../utils/CustomToolbar'

const Customer = () => {
  const dispatch = useDispatch()
  const { customers, loading } = useSelector((state) => state.customers)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchCustomers({ restaurantId }))
    }
  }, [dispatch, restaurantId])


  const sendEmail = (email) => {
    window.location.href = `mailto:${email}?subject=Hello&body=Hi there!`
  }

  const sendWhatsApp = (phoneNumber) => {
    const sanitizedPhone = phoneNumber.replace(/[^0-9]/g, '') // Ensure the number is in the correct format
    window.open(`https://wa.me/${sanitizedPhone}?text=Hi!`, '_blank')
  }


  // Static method to generate serial numbers
  let serialCounter = 1;
  const generateSerialNumber = () => {
    return serialCounter++;
  };

  const columns = [
    { 
        field: 'sno', 
        headerName: 'S.No.', 
        flex: 0.5, 
        headerClassName: 'header-style',
        valueGetter: (params) => params.row.sno, // Use the `sno` from rows
      },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.name || 'N/A',
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.email || 'N/A',
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.phoneNumber || 'N/A',
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      headerClassName: 'header-style',
      valueGetter: (params) => params.row.address || 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      headerClassName: 'header-style',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton
            color="primary"
            size="sm"
            onClick={() => sendEmail(params.row.email)}
            // disabled={!params.row.email || params.row.email === 'N/A'}
          >
            <CIcon icon={cilEnvelopeOpen} /> Email
          </CButton>
          <CButton
            color="success"
            size="sm"
            onClick={() => sendWhatsApp(params.row.phoneNumber)}
            // disabled={!params.row.phoneNumber || params.row.phoneNumber === 'N/A'}
          >
            <CIcon icon={cilChatBubble} /> WhatsApp
          </CButton>
        </div>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4">Customers</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <DataGrid
        rows={customers?.map((customer) => ({
            ...customer,
            sno: generateSerialNumber(), 
          }))}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          components={{ Toolbar: CustomToolbar }}
          sx={{
            '& .header-style': {
              fontWeight: 'bold',
              fontSize: '1.1rem',
            },
          }}
        />
      )}
    </div>
  )
}

export default Customer
