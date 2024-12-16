import React, { useState } from 'react';
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
  CFormTextarea
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilTrash, cilSearch } from '@coreui/icons';

const POSTableContent = () => {
  const [cart, setCart] = useState([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const products = [
    { id: 1, name: 'Shake', price: 50 },
    { id: 2, name: 'Biryani', price: 100 },
  ];

  const [customers] = useState([
    { id: 88, name: 'Shubham' },
    { id: 89, name: 'Amit' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTaxSubmit = () => {
    setTax(Number(inputValue));
    setShowTaxModal(false);
    setInputValue('');
  };

  const handleDiscountSubmit = () => {
    setDiscount(Number(inputValue));
    setShowDiscountModal(false);
    setInputValue('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  const AddCustomerModal=()=>{
    return(
        <CModal visible={showCustomerModal} onClose={() => setShowCustomerModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Customer Management</CModalTitle>
          {/* <CCloseButton onClick={onClose} /> */}
        </CModalHeader>
        <CModalBody>
          <div className="d-flex">
            {/* Left Section */}
            <div className="w-50 border-end pe-3">
              <h5 className="mb-3">Select Customer</h5>
              <div className="input-group mb-3">
                <CFormInput placeholder="Search customers..." />
                <span className="input-group-text">
                  <CIcon icon={cilSearch} />
                </span>
              </div>
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="d-flex justify-content-between align-items-center border p-2 mb-2"
                >
                  <span>{customer.name}</span>
                  <span className="badge bg-success">ID: {customer.id}</span>
                </div>
              ))}
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
          <CButton color="secondary" onClose={() => setShowCustomerModal(false)}>
            Close
          </CButton>
          <CButton color="success" onClick={() => setShowCustomerModal(false)}>
            Save changes
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
                <CFormInput placeholder="Search" />
                <CFormSelect>
                  <option>Table Number 1</option>
                  <option>Table Number 2</option>
                  <option>Table Number 3</option>
                </CFormSelect>
                <CButton color="success">
                  <CIcon icon={cilPlus} />
                </CButton>
              </CInputGroup>
              <h5 className="fw-bold mb-3">Products</h5>
              {/* Products List */}
              {products.map((product) => (
                <CRow key={product.id} className="mb-3">
                  <CCol xs={8}>
                    <h6 className="mb-1 fw-bold">{product.name}</h6>
                    <p className="text-muted mb-0">Price: ₹{product.price}</p>
                  </CCol>
                  <CCol xs={4} className="text-end">
                    <CButton
                      color="success"
                      onClick={() => addToCart(product)}
                    >
                      Add
                    </CButton>
                  </CCol>
                </CRow>
              ))}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Right Side: Cart */}
        <CCol md={4} sm={12}>
          {/* Customer Selection */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fw-bold">Select Customer</span>
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
                        {item.name} x {item.quantity}
                      </h6>
                    </div>
                    <div>₹{item.price * item.quantity}</div>
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                ))
              )}
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <CButton color="success" onClick={() => setShowTaxModal(true)}>
                  Tax
                </CButton>
                <CButton
                  color="success"
                  onClick={() => setShowDiscountModal(true)}
                >
                  Discount
                </CButton>
              </div>
              <div className="fw-bold">Subtotal: ₹{calculateSubtotal()}</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Bottom Container */}
      <CRow>
        <CCol>
          <CCardFooter className="bg-warning text-white d-flex justify-content-between p-3 mt-3 shadow-sm">
            <h4 className="mb-0">Total: ₹{calculateTotal()}</h4>
            <div>
              <CButton color="success" className="me-2">
                Pay Now
              </CButton>
              <CButton color="danger">
                <CIcon icon={cilTrash} /> Cancel
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
      <CModal
        visible={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
      >
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

        {AddCustomerModal()}
    </CContainer>
  );
};

export default POSTableContent;
