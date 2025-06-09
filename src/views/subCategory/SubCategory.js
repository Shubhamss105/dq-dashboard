import React, { useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CFormInput,
  CRow,
  CCol,
  CFormSelect,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../redux/slices/subCategorySlice'
import { fetchCategories, fetchCategoryById } from '../../redux/slices/categorySlice'

export default function SubCategory() {
  const [modalVisible, setModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)

  const [subCategoryName, setSubCategoryName] = useState('')

  const [categoryId, setCategoryId] = useState('')

  const [editedSubCategory, setEditedSubCategory] = useState({})

  const [searchTerm, setSearchTerm] = useState('')

  const [filter, setFilter] = useState('All')

  const [dropdownOpen, setDropdownOpen] = useState({})

  const [categoriesById, setCategoriesById] = useState({})

  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)
  const restaurantId = useSelector((state) => state.auth.restaurantId)
  const { subCategories, loading } = useSelector((state) => state.subCategory)
  const { categories } = useSelector((state) => state.category)

  useEffect(() => {
    if (token) {
      dispatch(fetchSubCategories({ token }))
      dispatch(fetchCategories({ token, restaurantId }))
    }
  }, [dispatch, token, restaurantId])

  useEffect(() => {
    const uniqueCategoryIds = [...new Set(subCategories.map((sub) => sub.category_id))]

    uniqueCategoryIds.forEach((catId) => {
      if (!categoriesById[catId]) {
        dispatch(fetchCategoryById({ id: catId, token })).then((res) => {
          if (res.payload) {
            setCategoriesById((prev) => ({
              ...prev,
              [catId]: res.payload,
            }))
          }
        })
      }
    })
  }, [subCategories, dispatch, token, categoriesById])

  const handleAddSubCategory = () => {
    if (!subCategoryName || !categoryId) {
      alert('Please fill in all fields')

      return
    }
    dispatch(
      createSubCategory({
        sub_category_name: subCategoryName,
        category_id: categoryId,
        token,
        restaurantId,
      }),
    ).then(() => {
      dispatch(fetchSubCategories({ token }))
      setSubCategoryName('')
      setCategoryId('')
      setModalVisible(false)
    })
  }

  const handleEditSubCategory = (sub) => {
    setEditedSubCategory(sub)
    setEditModalVisible(true)
  }

  const handleUpdateSubCategory = () => {
    if (!editedSubCategory.sub_category_name || !editedSubCategory.category_id) return
    dispatch(
      updateSubCategory({
        id: editedSubCategory.id,
        sub_category_name: editedSubCategory.sub_category_name,
        category_id: editedSubCategory.category_id,
        token,
      }),
    ).then(() => {
      setEditModalVisible(false)
      setEditedSubCategory({})
      dispatch(fetchSubCategories({ token }))
    })
  }

  const handleDeleteSubCategory = (id) => {
    dispatch(deleteSubCategory({ id, token })).then(() => {
      dispatch(fetchSubCategories({ token }))
    })
  }

  const toggleDropdown = (id) => {
    setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredSubCategories = subCategories
    ?.filter((sub) => {
      if (filter === 'All') return true
      const createdAt = new Date(sub.created_at)
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
    .filter((sub) => sub.sub_category_name?.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        <CSpinner className="m-auto" />
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-4 fw-semibold">My Subcategories</h1>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Subcategory
        </CButton>
      </div>

      <div className="d-flex mb-4">
        <CFormInput
          placeholder="Search subcategories..."
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
  {filteredSubCategories.map((sub) => (
    <CCol key={sub.id} xs="12" sm="6" md="4" lg="3" className="mb-4 d-flex">
      <CCard className="shadow-sm border rounded p-3 flex-fill">
        <CCardBody className="d-flex flex-column justify-content-between h-100">
          <div>
            <h5 className="fw-bold mb-1">{sub.sub_category_name}</h5>
            <small className="text-muted">
              Category:{' '}
              {categoriesById[sub.category_id]
                ? categoriesById[sub.category_id].categoryName
                : 'Loading...'}
            </small>
          </div>
          <div className="position-relative mt-3 text-end">
            <CButton
              color="light"
              className="p-0 border-0"
              style={{ fontSize: '20px' }}
              onClick={() => toggleDropdown(sub.id)}
            >
              &#8942;
            </CButton>

            {dropdownOpen[sub.id] && (
              <div
                className="dropdown-menu show position-absolute"
                style={{ right: 0, zIndex: 1000 }}
              >
                <button className="dropdown-item" onClick={() => handleEditSubCategory(sub)}>
                  Edit
                </button>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => handleDeleteSubCategory(sub.id)}
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


      {/* Add Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <h5>Add Subcategory</h5>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            placeholder="Subcategory Name"
            value={subCategoryName}
            onChange={(e) => setSubCategoryName(e.target.value)}
            className="mb-3"
          />
          <CFormSelect
            className="mb-3"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled hidden>
              Select Category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAddSubCategory} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Edit Modal */}
      <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
        <CModalHeader>
          <h5>Edit Subcategory</h5>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={editedSubCategory.sub_category_name || ''}
            onChange={(e) =>
              setEditedSubCategory((prev) => ({ ...prev, sub_category_name: e.target.value }))
            }
            className="mb-3"
          />
          <CFormSelect 
            value={editedSubCategory.category_id || ''}
            onChange={(e) =>
              setEditedSubCategory((prev) => ({ ...prev, category_id: e.target.value }))
            }
          >
            {Object.values(categoriesById).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.categoryName}
              </option>
            ))}
          </CFormSelect>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModalVisible(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleUpdateSubCategory}>
            {loading ? <CSpinner as="span" size="sm" /> : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
