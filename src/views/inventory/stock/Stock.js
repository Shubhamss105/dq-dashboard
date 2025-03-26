import React, { useState, useEffect, useCallback } from 'react'
import {
    DataGrid
  } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchInventories,
  addInventory,
  updateInventory,
  deleteInventory,
} from '../../../redux/slices/stockSlice'
import { fetchSuppliers } from '../../../redux/slices/supplierSlice'
import CustomToolbar from '../../../utils/CustomToolbar';
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CSpinner,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const Stock = () => {
  const dispatch = useDispatch()
  const { inventories, loading: inventoryLoading } = useSelector((state) => state.inventories)
  const { suppliers, loading: supplierLoading } = useSelector((state) => state.suppliers)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: '',
    supplierId: '',
  })
  const [selectedStock, setSelectedStock] = useState(null)

  // Fetch inventories and suppliers on component mount
  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchInventories({ restaurantId }))
      dispatch(fetchSuppliers({ restaurantId }))
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveStock = () => {
    dispatch(addInventory({ restaurantId, ...formData }))
    // dispatch(fetchInventories({ restaurantId }))
    resetForm()
    setModalVisible(false)
  }

  const handleUpdateInventory = async () => {
    try {
       dispatch(updateInventory({ id: selectedStock.id, restaurantId, ...formData }));
      dispatch(fetchInventories({ restaurantId }));
      resetForm();
      // setEditModalVisible(false);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };
  

  const handleDeleteInventory = () => {
    dispatch(deleteInventory({ id: selectedStock.id, restaurantId })).unwrap();
    // dispatch(fetchInventories({ restaurantId }))
    setDeleteModalVisible(false)
  }

  const resetForm = () => {
    setFormData({ itemName: '', quantity: '', unit: '', supplierId: '' })
  }

  const exportToCSV = useCallback(() => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Stock ID,Item Name,Quantity,Unit,Supplier Name'].join(',') +
      '\n' +
      inventories
        ?.map((row) =>
          [row.id, row.itemName, row.quantity, row.unit, row.supplier?.supplierName || 'N/A'].join(
            ',',
          ),
        )
        .join('\n')
    const link = document.createElement('a')
    link.href = encodeURI(csvContent)
    link.download = 'inventories.csv'
    link.click()
  }, [inventories])

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF()
    doc.text('Stock Management', 10, 10)
    const tableColumn = ['Stock ID', 'Item Name', 'Quantity', 'Unit', 'Supplier Name']
    const tableRows = inventories?.map((row) => [
      row?.id,
      row?.itemName,
      row?.quantity,
      row?.unit,
      row?.supplier?.supplierName || 'N/A',
    ])
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 })
    doc.save('inventories.pdf')
  }, [inventories])

  const columns = [
    { field: 'id', headerName: 'Stock ID', flex: 1 },
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    {
      field: 'supplierName',
      headerName: 'Supplier Name',
      flex: 1,
      valueGetter: (params) => params?.row?.supplier?.supplierName || 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Edit Button */}
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setSelectedStock(params.row)
              setFormData({
                itemName: params.row.itemName || '',
                quantity: params.row.quantity || '',
                unit: params.row.unit || '',
                supplierId: params.row.supplier?.id || '',
              })
              setEditModalVisible(true)
            }}
          >
            <CIcon icon={cilPencil} />
          </CButton>
          {/* Delete Button */}
          <CButton
            color="danger"
            size="sm"
            onClick={() => {
              setSelectedStock(params.row)
              setDeleteModalVisible(true)
            }}
          >
            <CIcon icon={cilTrash} />
          </CButton>
        </div>
      ),
    },
  ]

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2>Stock</h2>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Inventory
        </CButton>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <CButton color="info" onClick={exportToCSV}>
          Export to CSV
        </CButton>
        <CButton color="secondary" onClick={exportToPDF}>
          Export to PDF
        </CButton>
      </div>
      <div style={{ height: 'auto', width: '100%', backgroundColor: 'white' }}>
      {inventoryLoading || supplierLoading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <DataGrid
          rows={inventories || []}
          columns={columns}
          autoHeight
        //   components={{ Toolbar: GridToolbar }}
        slots={{
            toolbar: CustomToolbar,
          }}
        />
      )}
      </div>
      {/* Add Inventory Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Add Inventory</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            className="mb-3"
            placeholder="Item Name"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Unit (e.g., kg, ltr)"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
          />
          <CFormSelect
            className="mb-3"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
          >
            <option value="">Select Supplier</option>
            {suppliers?.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplierName}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveStock}>
            {inventoryLoading?"Saving...":"Save"}
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Edit Inventory Modal */}
      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit Inventory</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            className="mb-3"
            placeholder="Item Name"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Unit (e.g., kg, ltr)"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
          />
          <CFormSelect
            className="mb-3"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
          >
            <option value="">Select Supplier</option>
            {suppliers?.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.supplierName}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleUpdateInventory}>
            {inventoryLoading ? "Updating...": "Update"}
          </CButton>
        </CModalFooter>
      </CModal>
      {/* Delete Confirmation Modal */}
      <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Delete Inventory</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this inventory?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteInventory}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Stock
