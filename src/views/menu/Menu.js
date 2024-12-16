import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CSpinner,
} from '@coreui/react'
import {DataGrid} from '@mui/x-data-grid'
import CustomToolbar from '../../utils/CustomToolbar'
import { fetchCategories } from '../../redux/slices/categorySlice'
import { fetchInventories } from '../../redux/slices/stockSlice'
import { addMenuItem,deleteMenuItem,fetchMenuItems } from '../../redux/slices/menuSlice'

const Menu = () => {
  const dispatch = useDispatch()
  const { menuItems, loading } = useSelector((state) => state.menuItems)
  const { categories, loading: categoryLoading } = useSelector((state) => state.category)
  const { inventories, loading: inventoryLoading } = useSelector((state) => state.inventories)
  const restaurantId = useSelector((state) => state.auth.restaurantId)
    const token = useSelector((state) => state.auth.token)

  const [modalVisible, setModalVisible] = useState(false)
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    itemImage: null,
    price: '',
    stock: [{ inventoryId: '', quantity: '' }],
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  useEffect(() => {
    dispatch(fetchCategories({restaurantId,token}))
    dispatch(fetchInventories({restaurantId}))
  }, [dispatch])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setFormData((prevState) => ({
      ...prevState,
      itemImage: file,
    }))
    setPreviewImage(URL.createObjectURL(file))
  }

  const handleStockChange = (index, field, value) => {
    const updatedStock = [...formData.stock]
    updatedStock[index][field] = value
    setFormData((prevState) => ({
      ...prevState,
      stock: updatedStock,
    }))
  }

  const addStockField = () => {
    setFormData((prevState) => ({
      ...prevState,
      stock: [...prevState.stock, { inventoryId: '', quantity: '' }],
    }))
  }

  const handleCancel = () => {
    setFormData({
      itemName: '',
      categoryId: '',
      itemImage: null,
      price: '',
      stock: [{ inventoryId: '', quantity: '' }],
    })
    setPreviewImage(null)
    setModalVisible(false)
  }

  const handledeleteMenuItem = () => {
    dispatch(deleteMenuItem({ id: selectedMenu.id, restaurantId }))
    dispatch(fetchMenuItems({ restaurantId }))
    setDeleteModalVisible(false)
  }

  const handleAddMenuItem = () => {
    const formDataToSubmit = {itemName,itemImage,price,categoryId,restaurantId,stock}
    // formDataToSubmit.append('itemName', formData.itemName)
    // formDataToSubmit.append('categoryId', formData.categoryId)
    // formDataToSubmit.append('itemImage', formData.itemImage)
    // formDataToSubmit.append('price', formData.price)
    // formDataToSubmit.append('stock', JSON.stringify(formData.stock))
    dispatch(addMenuItem(formDataToSubmit))
    handleCancel()
  }

  const renderAddMenuItemModal = () => (
    <CModal visible={modalVisible} onClose={handleCancel}>
      <CModalHeader>
        <CModalTitle>Add Menu Item</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CFormInput
            type="text"
            name="itemName"
            label="Item Name"
            value={formData.itemName}
            onChange={handleInputChange}
            placeholder="Enter item name"
          />
          <CFormSelect
            name="categoryId"
            label="Category Name"
            value={formData.categoryId}
            onChange={handleInputChange}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </CFormSelect>
          <CFormInput
            type="file"
            label="Item Image"
            onChange={handleImageChange}
            accept="image/*"
          />
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              className="img-thumbnail mt-2"
              style={{ height: '100px' }}
            />
          )}
          <CFormInput
            type="number"
            name="price"
            label="Price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter price"
          />
          {formData.stock.map((stock, index) => (
            <CRow key={index} className="align-items-center mb-2">
              <CCol xs={6}>
                <CFormSelect
                  value={stock.inventoryId}
                  onChange={(e) => handleStockChange(index, 'inventoryId', e.target.value)}
                >
                  <option value="">Select Inventory</option>
                  {inventories.map((inventory) => (
                    <option key={inventory.id} value={inventory.id}>
                      {inventory.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol xs={4}>
                <CFormInput
                  type="number"
                  value={stock.quantity}
                  onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                  placeholder="Quantity"
                />
              </CCol>
              <CCol xs={2}>
                {index === formData.stock.length - 1 && (
                  <CButton color="success" onClick={addStockField}>
                    Add
                  </CButton>
                )}
              </CCol>
            </CRow>
          ))}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={handleCancel}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={handleAddMenuItem}>
          Add Menu Item
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
      {renderAddMenuItemModal()}
      {/* {renderEditMenuModal()} */}
      {renderdeleteMenuItemModal()}
    </div>
  )
}

export default Menu
