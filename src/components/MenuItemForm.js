import React from 'react';
import { CForm, CFormInput, CFormSelect, CRow, CCol, CButton, CFormLabel } from '@coreui/react';
import PropTypes from 'prop-types';

const MenuItemForm = ({
  formData,
  handleInputChange,
  handleImageChange,
  handleStockChange,
  addStockField,
  categories,
  inventories,
  previewImage,
  existingImage
}) => {
  return (
    <CForm className="gap-3 d-flex flex-column">
      {/* Item Name */}
      <div>
        <CFormLabel>Item Name</CFormLabel>
        <CFormInput
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          placeholder="Enter item name"
          required
        />
      </div>

      {/* Category Selection */}
      <div>
        <CFormLabel>Category</CFormLabel>
        <CFormSelect
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          required
        >
          <option value="">Select a category</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.categoryName}
            </option>
          ))}
        </CFormSelect>
      </div>

      {/* Item Image */}
      <div>
        <CFormLabel>Item Image</CFormLabel>
        <CFormInput
          type="file"
          onChange={handleImageChange}
          accept="image/*"
        />
        {(previewImage || existingImage) && (
          <img
            src={previewImage || existingImage}
            alt="Preview"
            className="img-thumbnail mt-2"
            style={{ height: '100px', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Price */}
      <div>
        <CFormLabel>Price</CFormLabel>
        <CFormInput
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter price"
          min="0"
          step="0.01"
          required
        />
      </div>

      {/* Stock Items */}
      <div className="mt-3">
        <CFormLabel>Required Inventory Items</CFormLabel>
        {formData.stockItems.map((stockItem, index) => (
          <CRow key={index} className="align-items-center mb-2 g-2">
            <CCol xs={6}>
              <CFormSelect
                value={stockItem.stockId}
                onChange={(e) => handleStockChange(index, 'stockId', e.target.value)}
                required
              >
                <option value="">Select Inventory</option>
                {inventories?.map((inventory) => (
                  <option key={inventory.id} value={inventory.id}>
                    {inventory.itemName} ({inventory.unit})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={4}>
              <CFormInput
                type="number"
                value={stockItem.quantity}
                onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                placeholder="Quantity"
                min="0"
                step="0.1"
                required
              />
            </CCol>
            <CCol xs={2} className="d-flex">
              {index === formData.stockItems.length - 1 && (
                <CButton 
                  color="success" 
                  onClick={addStockField}
                  disabled={!stockItem.stockId || !stockItem.quantity}
                >
                  Add
                </CButton>
              )}
            </CCol>
          </CRow>
        ))}
      </div>
    </CForm>
  );
};

MenuItemForm.propTypes = {
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleImageChange: PropTypes.func.isRequired,
  handleStockChange: PropTypes.func.isRequired,
  addStockField: PropTypes.func.isRequired,
  categories: PropTypes.array,
  inventories: PropTypes.array,
  previewImage: PropTypes.string,
  existingImage: PropTypes.string
};

export default MenuItemForm;