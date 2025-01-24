import React, { useState, useEffect,useCallback } from 'react'
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
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useParams } from 'react-router-dom'
import { cilPlus, cilTrash, cilSearch } from '@coreui/icons'
import { fetchMenuItems } from '../../redux/slices/menuSlice'
import { fetchCustomers, addCustomer } from '../../redux/slices/customerSlice'
import { createTransaction } from '../../redux/slices/transactionSlice'
import { useDispatch, useSelector } from 'react-redux'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const POSTableContent = () => {
  const dispatch = useDispatch()
  const { tableNumber } = useParams()
  const { customers, loading: customerLoading } = useSelector((state) => state.customers)
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [elapsedTime, setElapsedTime] = useState(0)

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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const [cart, setCart] = useState(() => {
    // Retrieve cart from localStorage if available
    const savedCart = localStorage.getItem(`cart_${tableNumber}`)
    return savedCart ? JSON.parse(savedCart) : []
  })

  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem(`start_time_${tableNumber}`)
    return savedStartTime ? new Date(savedStartTime) : null
  })

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date()
        setElapsedTime(Math.floor((now - startTime) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime])

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchMenuItems({ restaurantId }))
      dispatch(fetchCustomers({ restaurantId }))
    }
  }, [dispatch, restaurantId])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`cart_${tableNumber}`, JSON.stringify(cart))
  }, [cart])

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  })

    // Generate random customer ID
const randomCustomerId = () => `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

  // Function to handle delete button click
  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  // Function to confirm deletion
  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

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
    if (!startTime) {
      const now = new Date()
      setStartTime(now)
      localStorage.setItem(`start_time_${tableNumber}`, now.toISOString())
    }
  }

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId)
    setCart(updatedCart)

    if (updatedCart.length === 0) {
      // Clear the timer if the cart becomes empty
      setStartTime(null)
      setElapsedTime(0)
      localStorage.removeItem(`start_time_${tableNumber}`)
    }
  }

  // Clear Cart
  const clearCart = () => {
    setCart([])
    setStartTime(null)
    setElapsedTime(0)
    localStorage.removeItem(`cart_${tableNumber}`)
    localStorage.removeItem(`start_time_${tableNumber}`)
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

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  }, [cart]);

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
  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal + taxAmount - discountAmount;
  }, [calculateSubtotal, tax, discount]);

  const handlePaymentSubmit = async () => {
    const payload = {
      user_id: 1,
      items: cart?.map((item) => ({
        itemId: item.id,
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity,
      })),
      tax: tax,
      discount: discount,
      sub_total: calculateSubtotal(),
      total: calculateTotal(),
      type: paymentType,
      restaurantId: restaurantId,
      tableNumber: tableNumber,
    }

    if (paymentType === 'split') {
      payload.split_details = { ...splitPercentages }
    }

    dispatch(createTransaction(payload))
      .unwrap()
      .then(() => {
        setShowPaymentModal(false)
        clearCart()
      })
      .catch((error) => {
        console.error('Error submitting payment:', error)
      })
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const generateInvoice = () => {
    const invoiceElement = document.getElementById('invoice-section') // Reference to the invoice section

    // Ensure the invoice section is visible temporarily if hidden
    invoiceElement.style.display = 'block'

    // Capture the invoice as an image
    html2canvas(invoiceElement, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')

        // Calculate dimensions for the PDF
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width

        // Add the captured image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Display the PDF in a new tab
        const pdfBlob = pdf.output('bloburl')
        window.open(pdfBlob, '_blank') // Open PDF in a new tab

        // Optional: Save the PDF automatically
        pdf.save(`Invoice_${new Date().toISOString()}.pdf`)
      })
      .finally(() => {
        // Hide the invoice section again if needed
        invoiceElement.style.display = 'none'
      })
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
    <CContainer fluid className="p-4 shadow-shadow-lg bg-white">
      <CRow>
        {/* Left Side: Products */}
        <CCol md={8} sm={12} className="mb-4">
          <CContainer>
            <CContainer>
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
            </CContainer>
          </CContainer>
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
            <CCardHeader className="bg-secondary text-white fw-bold">
              {startTime ? (
                <span className="text-warning">Time: {formatTime(elapsedTime)}</span>
              ) : (
                'Cart'
              )}
            </CCardHeader>
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
                    <CButton color="danger" size="sm" onClick={() => handleDeleteClick(item)}>
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
            <CButton color="danger" onClick={clearCart} className="text-white fw-bold me-2">
                Cancel
              </CButton>
              <CButton
                color="secondary"
                onClick={generateInvoice}
                className="text-white fw-bold me-2"
              >
                Generate Bill
              </CButton>
              <CButton
                color="success"
                className="text-white fw-bold me-2"
                onClick={() => setShowPaymentModal(true)}
              >
                Pay Now
              </CButton>
            </div>
          </CCardFooter>
        </CCol>
      </CRow>

      <div
        id="invoice-section"
        style={{ display: 'none', padding: '20px', border: '1px solid #ddd' }}
      >
        <h2 className="text-center">Invoice</h2>
        <p>Table Number: {tableNumber}</p>
        {selectedCustomerName ? (
        <>
          <p>Customer Name: {selectedCustomerName}</p>
        </>
      ) : (
        <p>Customer ID: {randomCustomerId()}</p>
      )}
        <hr />
        <h4>Order Details:</h4>
        <ul>
          {cart.map((item) => (
            <li key={item.id}>
              {item.itemName} x {item.quantity} - ₹{item.price * item.quantity}
            </li>
          ))}
        </ul>
        <hr />
        <p>Subtotal: ₹{calculateSubtotal()}</p>
        <p>
          Tax ({tax}%): ₹{calculateTaxAmount().toFixed(2)}
        </p>
        <p>
          Discount ({discount}%): ₹{calculateDiscountAmount().toFixed(2)}
        </p>
        <h3>Total: ₹{calculateTotal()}</h3>
      </div>

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

          {/* {paymentType === 'split' && (
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
          )} */}
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handlePaymentSubmit}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal visible={showDeleteModal} onClose={cancelDelete}>
        <CModalHeader>
          <CModalTitle>Confirm Deletion</CModalTitle>
        </CModalHeader>
        <CModalBody>Are you sure you want to delete this item from the cart?</CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={cancelDelete}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>

      {AddCustomerModal()}
    </CContainer>
  )
}

export default POSTableContent
