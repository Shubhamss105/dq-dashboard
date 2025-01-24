import React from 'react';
import { CContainer, CInputGroup, CFormInput, CFormSelect, CRow, CCol, CButton, CSpinner } from '@coreui/react';

const ProductList = ({ searchProduct, handleSearchProduct, tableNumber, menuItemsLoading, filteredMenuItems, addToCart }) => {
  return (
    <CContainer>
      {/* Search and Table Selection */}
      <CInputGroup className="mb-3">
        <CFormInput
          placeholder="Search"
          className="me-2 fs-6 fs-md-5"
          value={searchProduct}
          onChange={handleSearchProduct}
        />
        <CFormSelect className="fs-6 fs-md-5">
          <option>Table Number {tableNumber}</option>
        </CFormSelect>
      </CInputGroup>

      {/* Products Heading */}
      <h4 className="fw-bold mb-3 fs-5 fs-md-4">Products</h4>

      {/* Loading Spinner */}
      {menuItemsLoading ? (
        <div className="text-center my-5">
          <CSpinner color="primary" />
          <p className="mt-2 fs-6">Loading products...</p>
        </div>
      ) : (
        /* Product List */
        filteredMenuItems?.map((product, index) => (
          <div key={product.id}>
            <CRow className="mb-3">
              <CCol xs={8}>
                {/* Product Name */}
                <h6 className="mb-1 fw-bold fs-6 fs-md-5">{product.itemName}</h6>
                {/* Product Price */}
                <p className="text-muted mb-0 fs-7 fs-md-6">Price: ₹{product.price}</p>
              </CCol>
              <CCol xs={4} className="text-end">
                {/* Add to Cart Button */}
                <CButton
                  color="success"
                  className="text-white fw-semibold fs-6 fs-md-5"
                  onClick={() => addToCart(product)}
                >
                  Add
                </CButton>
              </CCol>
            </CRow>
            {/* Divider between products */}
            {index < filteredMenuItems.length - 1 && <hr />}
          </div>
        ))
      )}
    </CContainer>
  );
};

export default ProductList;