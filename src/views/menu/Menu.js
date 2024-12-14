import React, { useState, useEffect } from 'react'
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../../redux/slices/menuSlice'
import CustomToolbar from '../../utils/CustomToolbar'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormInput,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const Menu = () => {
  const dispatch = useDispatch()
  const { menuItems, loading } = useSelector((state) => state.menuItems)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    itemImage: null,
    price: '',
  })
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchMenuItems({ restaurantId }))
    }
  }, [dispatch, restaurantId])

  console.log('menuItems',menuItems)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setFormData({ ...formData, itemImage: file })
    setPreviewImage(URL.createObjectURL(file))
  }

  const handleSaveMenu = async () => {
    const menuData = new FormData()
    menuData.append('restaurantId', restaurantId)
    menuData.append('itemName', formData.itemName)
    menuData.append('categoryId', formData.categoryId)
    menuData.append('itemImage', formData.itemImage)
    menuData.append('price', formData.price)

    await dispatch(addMenuItem(menuData))
    dispatch(fetchMenuItems({ restaurantId }))
    setModalVisible(false)
    setFormData({ itemName: '', categoryId: '', itemImage: null, price: '' })
    setPreviewImage(null)
  }

  const handleupdateMenuItem = async () => {
    const menuData = new FormData()
    menuData.append('id', selectedMenu.id)
    menuData.append('restaurantId', restaurantId)
    menuData.append('itemName', formData.itemName)
    menuData.append('categoryId', formData.categoryId)
    if (formData.itemImage instanceof File) {
      menuData.append('itemImage', formData.itemImage)
    }
    menuData.append('price', formData.price)

    await dispatch(updateMenuItem(menuData))
    dispatch(fetchMenuItems({ restaurantId }))
    setEditModalVisible(false)
    setFormData({ itemName: '', categoryId: '', itemImage: null, price: '' })
    setPreviewImage(null)
  }

  const handledeleteMenuItem = () => {
    dispatch(deleteMenuItem({ id: selectedMenu.id, restaurantId }))
    dispatch(fetchMenuItems({ restaurantId }))
    setDeleteModalVisible(false)
  }

  const exportToCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Menu ID,Item Name,Category ID,Price,Image URL'].join(',') +
      '\n' +
      menuItems
        ?.map((row) => [row.id, row.itemName, row.categoryId, row.price, row.itemImage].join(','))
        .join('\n')
    const link = document.createElement('a')
    link.href = encodeURI(csvContent)
    link.download = 'menuItems.csv'
    link.click()
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Menu Management', 10, 10)
    const tableColumn = ['Menu ID', 'Item Name', 'Category ID', 'Price']
    const tableRows = menuItems?.map((row) => [row.id, row.itemName, row.categoryId, row.price])
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 })
    doc.save('menuItems.pdf')
  }


  const renderaddMenuItemModal = () => (
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Add Menu Item</CModalTitle>
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
          placeholder="Category ID"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        />
        <CFormInput className="mb-3" type="file" name="itemImage" onChange={handleImageChange} />
        {previewImage && <img src={previewImage} alt="Preview" style={{ maxWidth: '100%' }} />}
        <CFormInput
          className="mb-3"
          placeholder="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={handleSaveMenu} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )

  const renderEditMenuModal = () => (
    <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Edit Menu Item</CModalTitle>
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
          placeholder="Category ID"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
        />
        <CFormInput className="mb-3" type="file" name="itemImage" onChange={handleImageChange} />
        {previewImage ? (
          <img src={previewImage} alt="Preview" style={{ maxWidth: '100%' }} />
        ) : (
          <img src={selectedMenu?.itemImage} alt="Current" style={{ maxWidth: '100%' }} />
        )}
        <CFormInput
          className="mb-3"
          placeholder="Price"
          name="price"
          value={formData.price}
          onChange={handleChange}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={handleupdateMenuItem} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </CButton>
      </CModalFooter>
    </CModal>
  )

  const renderdeleteMenuItemModal = () => (
    <CModal visible={deleteModalVisible} onClose={() => setDeleteModalVisible(false)}>
      <CModalHeader>
        <CModalTitle>Delete Menu Item</CModalTitle>
      </CModalHeader>
      <CModalBody>Are you sure you want to delete this menu item?</CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setDeleteModalVisible(false)}>
          Cancel
        </CButton>
        <CButton color="danger" onClick={handledeleteMenuItem} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </CButton>
      </CModalFooter>
    </CModal>
  )

  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'categoryId', headerName: 'Category ID', flex: 1 },
    { field: 'price', headerName: 'Price', flex: 1 },
    {
      field: 'itemImage',
      headerName: 'Image',
      flex: 1,
      renderCell: (params) => (
        <img src={params.value} alt={params.row.itemName} style={{ maxWidth: '100px' }} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <div>
          <CButton
            color="info"
            size="sm"
            onClick={() => {
              setSelectedMenu(params.row)
              setFormData({
                itemName: params.row.itemName,
                categoryId: params.row.categoryId,
                itemImage: null,
                price: params.row.price,
              })
              setPreviewImage(params.row.itemImage)
              setEditModalVisible(true)
            }}
          >
            <CIcon icon={cilPencil} />
          </CButton>
          <CButton
            color="danger"
            size="sm"
            className="ms-2"
            onClick={() => {
              setSelectedMenu(params.row)
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
    <div style={{ padding: '20px' }}>
     <div
             style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: '20px',
             }}
           >
             <h2>Menu</h2>
             <CButton color="primary" onClick={() => setModalVisible(true)}>
               Add Menu
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
      <div style={{height: 'auto', width: '100%', backgroundColor: 'white' }}>
        <DataGrid
          rows={menuItems}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          loading={loading}
          autoHeight
          slots={{ Toolbar: CustomToolbar }}
        />
      </div>
      {renderaddMenuItemModal()}
      {renderEditMenuModal()}
      {renderdeleteMenuItemModal()}
    </div>
  )
}

export default Menu
