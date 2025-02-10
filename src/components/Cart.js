import React from 'react'
import { CCard, CCardHeader, CCardBody, CButton } from '@coreui/react'
import { cilPlus, cilTrash, cilMinus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const Cart = ({
  selectedCustomerName,
  setShowCustomerModal,
  startTime,
  elapsedTime,
  cart,
  handleDeleteClick,
  tax,
  calculateTaxAmount,
  discount,
  calculateDiscountAmount,
  setShowTaxModal,
  setShowDiscountModal,
  setShowRoundOffModal,
  calculateTotal,
  handleQuantityChange, // Add this prop to handle quantity changes
}) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Customer Selection Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="fw-bold fs-5 fs-md-6">{selectedCustomerName || 'Select Customer'}</span>
        <CButton color="success" size="sm" onClick={() => setShowCustomerModal(true)}>
          <CIcon icon={cilPlus} />
        </CButton>
      </div>

      {/* Cart Section */}
      <CCard className="shadow-sm">
        <CCardHeader className="bg-secondary text-white fw-semibold text-center fs-5 fs-md-6">
          {startTime ? (
            <span className="text-warning">Time: {formatTime(elapsedTime)}</span>
          ) : (
            'Cart'
          )}
        </CCardHeader>
        <CCardBody>
          <div style={{ maxHeight: '30vh', overflowY: 'auto' }} className="custom-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center fs-6">Total Items: 0</div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between align-items-center mb-3 p-2 border-bottom"
                >
                  <div>
                    <h6 className="mb-0 fw-bold fs-6 fs-md-5">
                      {item.itemName} x {item.quantity}
                    </h6>
                    <small className="text-muted fs-7 fs-md-6">₹{item.price} per item</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <CButton
                      color="light"
                      size="sm"
                      style={{
                        padding: '0.1rem 0.2rem',
                        fontSize: '0.75rem',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        border: 'none',
                      }}
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <CIcon icon={cilMinus} />
                    </CButton>

                    <span className="fw-bold me-2 fs-6 fs-md-5">₹{item.price * item.quantity}</span>
                    <CButton
                      color="light"
                      size="sm"
                      style={{
                        padding: '0.1rem 0.2rem',
                        fontSize: '0.75rem',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        border: 'none',
                      }}
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <CIcon icon={cilPlus} />
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      style={{ padding: '0.15rem 0.25rem', fontSize: '0.875rem' }}
                      onClick={() => handleDeleteClick(item)}
                    >
                      <CIcon icon={cilTrash} />
                    </CButton>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr />
          <div>
            <p className="fw-medium fs-6 fs-md-5">
              Tax ({tax}%): <span className="float-end">₹{calculateTaxAmount().toFixed(2)}</span>
            </p>
            <p className="fw-medium fs-6 fs-md-5">
              Discount ({discount}%):{' '}
              <span className="float-end">₹{calculateDiscountAmount().toFixed(2)}</span>
            </p>
          </div>
          <hr />
          <div className="d-flex justify-content-start gap-2 mb-3">
            <CButton
              color="success"
              className="text-white fw-semibold fs-6 fs-md-5"
              onClick={() => setShowTaxModal(true)}
            >
              Tax
            </CButton>
            <CButton
              color="success"
              className="text-white fw-semibold fs-6 fs-md-5"
              onClick={() => setShowDiscountModal(true)}
            >
              Discount
            </CButton>
            <CButton
              color="success"
              className="text-white fw-semibold fs-6 fs-md-5"
              onClick={() => setShowRoundOffModal(true)}
            >
              Round Off
            </CButton>
          </div>
          <h5 className="fw-bold fs-5 fs-md-4">
            Total Payable: <span className="float-end">₹{calculateTotal()}</span>
          </h5>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Cart
