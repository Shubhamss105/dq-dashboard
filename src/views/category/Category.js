import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CFormInput,
  CContainer,
  CRow,
  CCol,
  CFormSelect,
  CCard,
  CCardImage,
  CCardBody,
  CForm,
  CSpinner
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../redux/slices/categorySlice'
import { toast } from 'react-toastify'

export default function Category() {
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryImage, setCategoryImage] = useState(null)
  const [editedCategory, setEditedCategory] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')
  const [dropdownOpen, setDropdownOpen] = useState({})

  const dispatch = useDispatch()
  const { categories, loading } = useSelector((state) => state.category)
  // console.log(categories)
  const token = useSelector((state) => state.auth.token)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchCategories({ restaurantId, token }))
    }
  }, [dispatch, token, restaurantId])

  const handleAddCategory = () => {
    if (!categoryName || !categoryImage) {
      toast.error('Please provide all required fields.')
      return
    }
  
    const formData = { categoryName, categoryImage, restaurantId, token }
    // console.log('formData', formData)
    dispatch(createCategory(formData)).then(() => {
      dispatch(fetchCategories({ restaurantId, token }));
      setCategoryName('')
      setCategoryImage(null)
      setModalVisible(false);
    })
  }
  

  const handleEditCategory = (category) => {
    setEditedCategory(category)
    setEditModalVisible(true)
  }

  const handleUpdateCategory = () => {
    if (!editedCategory.categoryName) {
      toast.error('Category name is required.');
      return;
    }
  
    const { id, categoryName, categoryImage } = editedCategory;
  
    const payload = {
      id,
      categoryName,
      categoryImage: categoryImage instanceof File ? categoryImage : null,
      restaurantId, // Add restaurantId from your Redux state
      token,
    };
  
    dispatch(updateCategory(payload))
      .unwrap()
      .then(() => {
        toast.success('Category updated successfully!');
        setEditModalVisible(false);
        setEditedCategory({});
      })
      .catch((error) => {
        toast.error(error || 'Failed to update category.');
      });
  };
  
  

  const handleDeleteCategory = (id) => {
    dispatch(deleteCategory({ id, token }))
  }

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditedCategory((prev) => ({
        ...prev,
        categoryImage: file,
      }))
    }
  }

  const filteredCategories = categories
    ?.filter((cat) => {
      if (filter === 'All') return true

      const createdAt = new Date(cat.created_at)
      const now = new Date()

      switch (filter) {
        case 'This week':
          return createdAt >= new Date(now.setDate(now.getDate() - 7))
        case 'This month':
          return createdAt.getMonth() === new Date().getMonth()
        case 'Last 3 Months':
          return createdAt >= new Date(now.setMonth(now.getMonth() - 3))
        default:
          return true
      }
    })
    .filter((cat) => cat.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()))



    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <CSpinner className="m-auto" />
        </div>
      );
    }
    

  const AddCategoryModal = () => (
    <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
      <CModalHeader>
        <h5>Add New Category</h5>
      </CModalHeader>
      <CModalBody>
        <CFormInput
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="mb-3"
        />
        <CFormInput
          type="file"
          onChange={(e) => setCategoryImage(e.target.files[0])}
          className="mb-3"
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setModalVisible(false)}>
          Close
        </CButton>
        <CButton color="primary" onClick={handleAddCategory} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )

  const EditCategoryModal = () => (
    <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
      <CModalHeader>
        <h5>Edit Category</h5>
      </CModalHeader>
      <CModalBody>
        <CForm>
          {/* Category Name Input */}
          <div className="mb-3">
            <label htmlFor="editCategoryName" className="form-label">
              Category Name
            </label>
            <CFormInput
              id="editCategoryName"
              type="text"
              value={editedCategory.categoryName}
              onChange={(e) =>
                setEditedCategory((prev) => ({
                  ...prev,
                  categoryName: e.target.value,
                }))
              }
            />
          </div>

          {/* Category Image Input */}
          <div className="mb-3">
            <label htmlFor="editCategoryImage" className="form-label">
              Category Image
            </label>
            <CFormInput id="editCategoryImage" type="file" onChange={(e) => handleImageChange(e)} />
            {/* Image Preview */}
            {editedCategory.categoryImage && (
              <img
                src={
                  typeof editedCategory.categoryImage === 'string'
                    ? editedCategory.categoryImage
                    : URL.createObjectURL(editedCategory.categoryImage)
                }
                alt="Category Preview"
                className="img-fluid rounded mt-3"
                style={{ maxHeight: '150px', objectFit: 'cover' }}
              />
            )}
          </div>
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
          Cancel
        </CButton>
        <CButton color="primary" onClick={() => handleUpdateCategory(editedCategory)}>
          {loading ? <CSpinner as="span" size="sm" aria-hidden="true" /> : 'Save Changes'}
        </CButton>
      </CModalFooter>
    </CModal>
  )

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-4 fw-semibold">My Categories</h1>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Category
        </CButton>
      </div>

      <div className="d-flex mb-4">
        <CFormInput
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="me-3"
        />
        <CFormSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="This week">This Week</option>
          <option value="This month">This Month</option>
          <option value="Last 3 Months">Last 3 Months</option>
        </CFormSelect>
      </div>

      <CRow>
        {filteredCategories?.map((cat) => (
          <CCol key={cat.id} xs="12" sm="6" md="4" lg="2" className="mb-4">
            <CCard className="shadow-sm border rounded">
              {/* Full-width Image */}
              <CCardImage
                orientation="top"
                src={cat.categoryImage}
                alt={cat.categoryName}
                className="img-fluid"
                style={{ height: '150px', objectFit: 'cover' }}
              />
              {/* Card Body */}
              <CCardBody className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">{cat.categoryName}</h5>
                {/* 3-dot Button */}
                <div className="position-relative">
                  <CButton
                    color="light"
                    className="p-0 border-0"
                    style={{ fontSize: '20px' }}
                    onClick={() => toggleDropdown(cat.id)}
                  >
                    &#8942;
                  </CButton>

                  {dropdownOpen[cat.id] && (
                    <div
                      className="dropdown-menu show position-absolute"
                      style={{ right: '0', zIndex: '1000' }}
                    >
                      <button className="dropdown-item" onClick={() => handleEditCategory(cat)}>
                        Edit
                      </button>
                      <button
                        className="dropdown-item text-danger"
                        onClick={() => handleDeleteCategory(cat.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {AddCategoryModal()}
      {EditCategoryModal()}
    </div>
  )
}
