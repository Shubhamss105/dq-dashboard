import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { fetchCustomers, deleteCustomer } from '../../redux/slices/customerSlice'
import { CButton, CSpinner, CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen, cilChatBubble, cilTrash } from '@coreui/icons'
import CustomToolbar from '../../utils/CustomToolbar'

const Customer = () => {
  const dispatch = useDispatch()
  const { customers, loading } = useSelector((state) => state.customers)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)

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

  const handleDelete = () => {
    if (selectedCustomerId) {
      dispatch(deleteCustomer({ id: selectedCustomerId })).then(() => {
        setDeleteModalVisible(false);
        setSelectedCustomerId(null);
      });
    }
  };
  

  const openDeleteModal = (id) => {
    setSelectedCustomerId(id)
    setDeleteModalVisible(true)
  }

  // Static method to generate serial numbers
  let serialCounter = 1
  const generateSerialNumber = () => {
    return serialCounter++
  }

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
      flex: 1.5,
      headerClassName: 'header-style',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <CButton
            color="primary"
            size="sm"
            onClick={() => sendEmail(params.row.email)}
          >
            <CIcon icon={cilEnvelopeOpen} /> Email
          </CButton>
          <CButton
            color="success"
            size="sm"
            onClick={() => sendWhatsApp(params.row.phoneNumber)}
          >
            <CIcon icon={cilChatBubble} /> WhatsApp
          </CButton>
          <CButton
            color="danger"
            size="sm"
            onClick={() => openDeleteModal(params.row.id)}
          >
            <CIcon icon={cilTrash} /> Delete
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
          style={{ height: 'auto', width: '100%', backgroundColor: 'white' }}
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

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        backdrop="static"
      >
        <CModalHeader>Confirm Deletion</CModalHeader>
        <CModalBody>
          Are you sure you want to delete this customer?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Customer
