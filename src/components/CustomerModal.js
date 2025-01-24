import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormInput, CFormTextarea, CForm } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSearch } from '@coreui/icons';

const CustomerModal = ({
  showCustomerModal,
  setShowCustomerModal,
  searchTerm,
  setSearchTerm,
  filteredCustomers,
  handleCustomerSelect,
  customerLoading,
  handleAddCustomer,
}) => {
  return (
    <CModal visible={showCustomerModal} onClose={() => setShowCustomerModal(false)} size="lg">
      <CModalHeader>
        <CModalTitle>Customer Management</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="d-flex">
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
                  style={{ cursor: 'pointer' }}
                >
                  <span>{customer.name}</span>
                  <span className="badge bg-success">ID: {customer.id}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-50 ps-3">
            <h5 className="mb-3">Add New Customer</h5>
            <CForm>
              <CFormInput className="mb-2" type="text" name="name" placeholder="Name" />
              <CFormInput className="mb-2" type="email" name="email" placeholder="Email" />
              <CFormInput className="mb-2" type="text" name="phone" placeholder="Phone Number" />
              <CFormTextarea className="mb-2" name="address" rows="3" placeholder="Address" />
            </CForm>
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setShowCustomerModal(false)}>
          Close
        </CButton>
        <CButton color="success" className="text-white font fw-semibold" onClick={handleAddCustomer}>
          {customerLoading ? 'Saving...' : 'Add Customer'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default CustomerModal;