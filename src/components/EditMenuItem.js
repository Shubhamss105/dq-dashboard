import React from 'react';
import { CFormInput, CFormSelect, CFormLabel, CButton } from '@coreui/react';

const EditMenuItem = ({
  formData,
  handleInputChange,
  handleImageChange,
  categories,
  previewImage,
  isEdit = false
}) => {
  return (
    <div className="p-3">
      <div className="mb-3">
        <CFormLabel>Item Name</CFormLabel>
        <CFormInput
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <CFormLabel>Category</CFormLabel>
        <CFormSelect
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
        >
          <option value="">Select Category</option>
          {categories?.map(category => (
            <option key={category.id} value={category.id}>
              {category.categoryName}
            </option>
          ))}
        </CFormSelect>
      </div>

      <div className="mb-3">
        <CFormLabel>Price</CFormLabel>
        <CFormInput
          type="number"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-3">
        <CFormLabel>Item Image</CFormLabel>
        <CFormInput
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {previewImage && (
          <div className="mt-2">
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          </div>
        )}
      </div>

      {isEdit && (
        <div className="text-muted small mt-3">
          Note: Leave image field empty to keep existing image
        </div>
      )}
    </div>
  );
};

export default EditMenuItem;