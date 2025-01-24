import React, { useState } from 'react'
import { CForm, CFormInput, CFormSelect, CRow, CCol, CButton } from '@coreui/react'

const MenuItemForm = ({ formData, handleInputChange, handleImageChange, handleStockChange, addStockField, categories, inventories, previewImage }) => {
  return (
    <CForm>
      <CFormInput
        type="text"
        name="itemName"
        label="Item Name"
        value={formData.itemName}
        onChange={handleInputChange}
        placeholder="Enter item name"
      />
      <CFormSelect
        name="categoryId"
        label="Category Name"
        value={formData.categoryId}
        onChange={handleInputChange}
      >
        <option value="">Select a category</option>
        {categories?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.categoryName}
          </option>
        ))}
      </CFormSelect>
      <CFormInput
        type="file"
        label="Item Image"
        onChange={handleImageChange}
        accept="image/*"
      />
      {previewImage && (
        <img
          src={previewImage}
          alt="Preview"
          className="img-thumbnail mt-2"
          style={{ height: '100px' }}
        />
      )}
      <CFormInput
        type="number"
        name="price"
        label="Price"
        value={formData.price}
        onChange={handleInputChange}
        placeholder="Enter price"
      />
      {formData?.stockItems?.map((stock, index) => (
        <CRow key={index} className="align-items-center mb-2">
          <CCol xs={6}>
            <CFormSelect
              value={stock.stockId}
              onChange={(e) => handleStockChange(index, 'stockId', e.target.value)}
            >
              <option value="">Select Inventory</option>
              {inventories?.map((inventory) => (
                <option key={inventory.id} value={inventory.id}>
                  {inventory.itemName}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={4}>
            <CFormInput
              type="number"
              value={stock.quantity}
              onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
              placeholder="Quantity"
            />
          </CCol>
          <CCol xs={2}>
            {index === formData.stockItems.length - 1 && (
              <CButton color="success" onClick={addStockField}>
                Add
              </CButton>
            )}
          </CCol>
        </CRow>
      ))}
    </CForm>
  )
}

export default MenuItemForm