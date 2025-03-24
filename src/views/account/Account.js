'use client'

import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormLabel,
  CImage,
  CSpinner,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getRestaurantProfile,
  updateRestaurantProfile,
  uploadRestaurantImage,
} from '../../redux/slices/restaurantProfileSlice'

export default function Account() {
  const dispatch = useDispatch()
  const [profileData, setProfileData] = useState({})
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const { restaurantProfile, loading } = useSelector((state) => state.restaurantProfile)
  const restaurantId = useSelector((state) => state.auth.restaurantId)
  const id = restaurantProfile?.id

  useEffect(() => {
    dispatch(getRestaurantProfile({ restaurantId })).then(({ payload }) => {
      setProfileData(payload)
    })
  }, [dispatch, restaurantId])

  const handleEdit = (field) => {
    setEditingField(field)
    setEditValue(profileData[field] || '')
  }

  const handleUpdate = async (field) => {
    setIsUpdating(true)
    try {
      await dispatch(
        updateRestaurantProfile({ id, profileData: { field, value: editValue, restaurantId } }),
      )
      setProfileData((prev) => ({ ...prev, [field]: editValue }))
      setEditingField(null)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      await dispatch(uploadRestaurantImage({ id, imageFile: file }))
      await dispatch(getRestaurantProfile({ restaurantId }))
    }
  }

  const renderField = (field, label) => (
    <div className="mb-4">
      <CFormLabel htmlFor={field} className="fw-bold">
        {label}
      </CFormLabel>
      {editingField === field ? (
        <div className="d-flex align-items-center mt-1">
          <CFormInput
            id={field}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="me-2"
          />
          <CButton
            color="success"
            size="sm"
            onClick={() => handleUpdate(field)}
            disabled={isUpdating}
          >
            {isUpdating ? <CSpinner size="sm" /> : 'Update'}
          </CButton>
        </div>
      ) : (
        <div className="d-flex align-items-center mt-1">
          <span className="me-auto">{profileData[field] || '-'}</span>
          <CButton color="primary" size="sm" className="ms-2" onClick={() => handleEdit(field)}>
            Edit
          </CButton>
        </div>
      )}
    </div>
  )

  return (
    <CCard className="w-75 mx-auto my-5 shadow-lg">
      <CCardHeader className="text-center bg-primary text-white">
        <CCardTitle>Profile Information</CCardTitle>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">
            <CSpinner color="primary" />
          </div>
        ) : (
          <CRow>
            {/* Left Section */}
            <CCol md={6} className="bg-white shadow-sm p-4 rounded">
              <div className="text-center mb-4 p-3 border rounded shadow-sm bg-light">
                <CImage
                  rounded
                  src={profileData?.image || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="border"
                />
                <div className="mt-3">
                  <CButton
                    color="primary"
                    size="sm"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    Change Photo
                  </CButton>
                  <CFormInput
                    type="file"
                    id="fileInput"
                    className="d-none"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>
              </div>

              {renderField('firstName', 'First Name')}
              {renderField('lastName', 'Last Name')}
              {renderField('gender', 'Gender')}
              {renderField('restName', 'Restaurant Name')}
              {renderField('phoneNumber', 'Phone Number')}
            </CCol>

            {/* Right Section */}
            <CCol md={6} className="bg-white shadow-sm p-4 rounded">
              {renderField('address', 'Address')}
              {renderField('pinCode', 'Pin Code')}
              {renderField('restaurantId', 'Restaurant ID')}
              {renderField('identity', 'Identity Type')}
              {renderField('identityNumber', 'Identity Number')}
              {renderField('email', 'Email')}
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}
