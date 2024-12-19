import React, { useState, useEffect } from 'react'
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CInputGroup,
  CFormInput,
  CFormSelect,
  CCardFooter,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormTextarea,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useParams } from 'react-router-dom'
import { cilPlus, cilTrash, cilSearch } from '@coreui/icons'
import { fetchMenuItems } from '../../redux/slices/menuSlice'
import { fetchCustomers, addCustomer } from '../../redux/slices/customerSlice'
import { useDispatch, useSelector } from 'react-redux'

const POSTableContent = () => {
  const dispatch = useDispatch()
  const { tableNumber } = useParams()
  const { customers, loading: customerLoading } = useSelector((state) => state.customers)
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [cart, setCart] = useState([])
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerName, setSelectedCustomerName] = useState('')

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentType, setPaymentType] = useState('')
  const [splitPercentages, setSplitPercentages] = useState({
    online: 0,
    cash: 0,
    due: 0,
  })

  const [searchProduct, setSearchProduct] = useState('')

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchMenuItems({ restaurantId }))
      dispatch(fetchCustomers({ restaurantId }))
    }
  }, [dispatch, restaurantId])

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  })

  const filteredCustomers = customers?.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredMenuItems = menuItems?.menus?.filter((product) =>
    product.itemName?.toLowerCase().includes(searchProduct.toLowerCase()),
  )

  const handleCustomerSelect = (customer) => {
    setSelectedCustomerName(customer.name)
    setShowCustomerModal(false)
  }

  const handleSearchProduct = (e) => {
    setSearchProduct(e.target.value)
  }

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  // Clear Cart
  const clearCart = () => {
    setCart([])
  }

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value })
  }

  // Handle adding customer
  const handleAddCustomer = () => {
    const customerData = { ...formValues, restaurantId }

    dispatch(addCustomer(customerData))
      .unwrap()
      .then((newCustomer) => {
        // Set the newly added customer's name
        setSelectedCustomerName(newCustomer.name)
        setShowCustomerModal(false)
      })
      .catch((error) => {
        console.error('Failed to add customer:', error)
      })
  }

  const handleTaxSubmit = () => {
    setTax(Number(inputValue))
    setShowTaxModal(false)
    setInputValue('')
  }

  const handleDiscountSubmit = () => {
    setDiscount(Number(inputValue))
    setShowDiscountModal(false)
    setInputValue('')
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Function to calculate tax amount
  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * tax) / 100
  }

  // Function to calculate discount amount
  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * discount) / 100
  }

  // Function to calculate total payable
  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTaxAmount()
    const discountAmount = calculateDiscountAmount()
    return subtotal + taxAmount - discountAmount
  }

  const handlePaymentSubmit = async () => {
    const payload = {
      user_id: 1,
      items: cart.map((item) => ({
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      tax: tax,
      discount: discount,
      sub_total: calculateSubtotal(),
      total: calculateTotal(),
      type: paymentType,
      restaurantId: 'R1728231298',
    }

    if (paymentType === 'split') {
      payload.split_details = { ...splitPercentages }
    }

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert('Payment submitted successfully!')
        setShowPaymentModal(false)
      } else {
        alert('Failed to submit payment.')
      }
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const AddCustomerModal = () => {
    return (
      <CModal visible={showCustomerModal} onClose={() => setShowCustomerModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Customer Management</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="d-flex">
            {/* Left Section */}
            <div className="w-50 border-end pe-3">
              <h5 className="mb-3">Select Customer</h5>
              <div className="input-group mb-3">
                <CFormInput
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="input-group-text">
                  <CIcon icon={cilSearch} />
                </span>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredCustomers?.map((customer) => (
                  <div
                    key={customer.id}
                    className="d-flex justify-content-between align-items-center border p-2 mb-2"
                    onClick={() => handleCustomerSelect(customer)}
                    style={{ cursor: 'pointer' }} // Add cursor pointer
                  >
                    <span>{customer.name}</span>
                    <span className="badge bg-success">ID: {customer.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="w-50 ps-3">
              <h5 className="mb-3">Add New Customer</h5>
              <CForm>
                <CFormInput
                  className="mb-2"
                  type="text"
                  name="name"
                  placeholder="Name"
                  onChange={handleInputChange}
                />
                <CFormInput
                  className="mb-2"
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleInputChange}
                />
                <CFormInput
                  className="mb-2"
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleInputChange}
                />
                <CFormTextarea
                  className="mb-2"
                  name="address"
                  rows="3"
                  placeholder="Address"
                  onChange={handleInputChange}
                />
              </CForm>
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCustomerModal(false)}>
            Close
          </CButton>
          <CButton
            color="success"
            className="text-white font fw-semibold"
            onClick={handleAddCustomer}
          >
            {customerLoading ? 'Saving...' : 'Add Customer'}
          </CButton>
        </CModalFooter>
      </CModal>
    )
  }

  return (
    <CContainer fluid className="p-4">
      <CRow>
        {/* Left Side: Products */}
        <CCol md={8} sm={12} className="mb-4">
          <CCard className="shadow-sm">
            <CCardBody>
              <CInputGroup className="mb-3">
                <CFormInput
                  placeholder="Search"
                  className="me-2"
                  value={searchProduct}
                  onChange={handleSearchProduct}
                />
                <CFormSelect>
                  <option>Table Number {tableNumber}</option>
                </CFormSelect>
              </CInputGroup>

              <h4 className="fw-bold mb-3">Products</h4>
              {/* Products List */}
              {menuItemsLoading ? (
                <div className="text-center my-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading products...</p>
                </div>
              ) : (
                filteredMenuItems?.map((product, index) => (
                  <div key={product.id}>
                    <CRow className="mb-3">
                      <CCol xs={8}>
                        <h6 className="mb-1 fw-bold">{product.itemName}</h6>
                        <p className="text-muted mb-0">Price: ₹{product.price}</p>
                      </CCol>
                      <CCol xs={4} className="text-end">
                        <CButton
                          color="success"
                          className="text-white fw-semibold"
                          onClick={() => addToCart(product)}
                        >
                          Add
                        </CButton>
                      </CCol>
                    </CRow>
                    {index < filteredMenuItems.length - 1 && <hr />}
                  </div>
                ))
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Right Side: Cart */}
        <CCol md={4} sm={12}>
          {/* Customer Selection */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-bold">{selectedCustomerName || 'Select Customer'}</span>
            <CButton color="success" size="sm" onClick={() => setShowCustomerModal(true)}>
              <CIcon icon={cilPlus} />
            </CButton>
          </div>
          <CCard className="shadow-sm">
            <CCardHeader className="bg-secondary text-white fw-bold">Cart</CCardHeader>
            <CCardBody>
              {cart.length === 0 ? (
                <div>Total Items: 0</div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center mb-2"
                  >
                    <div>
                      <h6 className="mb-0 fw-bold">
                        {item.itemName} x {item.quantity}
                      </h6>
                    </div>
                    <div>₹{item.price * item.quantity}</div>
                    <CButton color="danger" size="sm" onClick={() => removeFromCart(item.id)}>
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                ))
              )}
              <hr />
              <div>
                <p className="fw-medium">
                  Tax ({tax}%):{' '}
                  <span className="float-end">₹{calculateTaxAmount().toFixed(2)}</span>
                </p>
                <p className="fw-medium">
                  Discount ({discount}%):{' '}
                  <span className="float-end">₹{calculateDiscountAmount().toFixed(2)}</span>
                </p>
              </div>
              <hr />
              <div className="d-flex justify-content-start gap-2 mb-3">
                <CButton
                  color="success"
                  className="text-white fw-semibold"
                  onClick={() => setShowTaxModal(true)}
                >
                  Tax
                </CButton>
                <CButton
                  color="success"
                  className="text-white fw-semibold"
                  onClick={() => setShowDiscountModal(true)}
                >
                  Discount
                </CButton>
              </div>
              <h5 className="fw-bold">
                Total Payable: <span className="float-end">₹{calculateTotal()}</span>
              </h5>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Bottom Container */}
      <CRow>
        <CCol>
          <CCardFooter className="bg-warning text-white rounded-2 d-flex justify-content-between p-3 mt-3 shadow-sm">
            <h4 className="mb-0">Total: ₹{calculateTotal()}</h4>
            <div>
              <CButton
                color="success"
                className="text-white fw-bold me-2"
                onClick={() => setShowPaymentModal(true)}
              >
                Pay Now
              </CButton>
              <CButton color="danger" onClick={clearCart} className="text-white fw-bold me-2">
                Cancel
              </CButton>
            </div>
          </CCardFooter>
        </CCol>
      </CRow>

      {/* Tax Modal */}
      <CModal visible={showTaxModal} onClose={() => setShowTaxModal(false)}>
        <CModalHeader>
          <CModalTitle>Enter Tax Percentage (%)</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="number"
            placeholder="e.g. 5"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleTaxSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Discount Modal */}
      <CModal visible={showDiscountModal} onClose={() => setShowDiscountModal(false)}>
        <CModalHeader>
          <CModalTitle>Enter Discount Percentage (%)</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="number"
            placeholder="e.g. 10"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleDiscountSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Payment Modal */}
      <CModal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <CModalHeader>
          <CModalTitle>Select Payment Type</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormSelect value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <option value="">Select Payment Type</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="credit_card">Card</option>
            <option value="split">Split</option>
          </CFormSelect>

          {paymentType === 'split' && (
            <div className="mt-3">
              <CFormInput
                type="number"
                placeholder="Online (%)"
                value={splitPercentages.online}
                onChange={(e) =>
                  setSplitPercentages((prev) => ({
                    ...prev,
                    online: parseInt(e.target.value) || 0,
                  }))
                }
                className="mb-2"
              />
              <CFormInput
                type="number"
                placeholder="Cash (%)"
                value={splitPercentages.cash}
                onChange={(e) =>
                  setSplitPercentages((prev) => ({
                    ...prev,
                    cash: parseInt(e.target.value) || 0,
                  }))
                }
                className="mb-2"
              />
              <CFormInput
                type="number"
                placeholder="Due (%)"
                value={splitPercentages.due}
                onChange={(e) =>
                  setSplitPercentages((prev) => ({
                    ...prev,
                    due: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handlePaymentSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {AddCustomerModal()}
    </CContainer>
  )
}

export default POSTableContent
