import React, { useState, useEffect } from 'react';
import { CContainer, CRow, CCol, CButton, CFormInput, CImage } from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getRestaurantProfile, updateRestaurantProfile } from '../../redux/slices/restaurantProfileSlice';

const Account = () => {
  const dispatch = useDispatch();
  const { restaurantProfile, loading } = useSelector((state) => state.restaurantProfile);

  const [editableField, setEditableField] = useState(null);
  const [updatedValue, setUpdatedValue] = useState('');

  useEffect(() => {
    // Fetch restaurant profile on component mount
    dispatch(getRestaurantProfile({ restaurantId: 'R1728231298' }));
  }, [dispatch]);

  const handleEdit = (field, value) => {
    setEditableField(field);
    setUpdatedValue(value);
  };

  const handleSave = () => {
    const updatePayload = { [editableField]: updatedValue };
    dispatch(updateRestaurantProfile({ restaurantId: restaurantProfile.restaurantId, updatePayload }))
      .unwrap()
      .then(() => {
        setEditableField(null);
        setUpdatedValue('');
      })
      .catch((error) => console.error('Failed to update profile:', error));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CContainer className="py-5">
      <h2 className="mb-4">My Account</h2>
      <CRow>
        {/* Profile Section */}
        <CCol md={6} className="mb-4">
          <h5 className="mb-3">Profile</h5>
          <CImage
            rounded
            src={restaurantProfile?.image || 'https://via.placeholder.com/100'}
            width={100}
            height={100}
            className="mb-3"
          />
          {renderField('First Name', 'firstName', restaurantProfile?.firstName)}
          {renderField('Last Name', 'lastName', restaurantProfile?.lastName)}
          {renderField('Restaurant Name', 'restName', restaurantProfile?.restName)}
          {renderField('Gender', 'gender', restaurantProfile?.gender)}
        </CCol>

        {/* Contact Details Section */}
        <CCol md={6} className="mb-4">
          <h5 className="mb-3">Contact Details</h5>
          {renderField('Email', 'email', restaurantProfile?.email)}
          {renderField('Phone Number', 'phoneNumber', restaurantProfile?.phoneNumber)}
          {renderField('Address', 'address', restaurantProfile?.address)}
          {renderField('Pin Code', 'pinCode', restaurantProfile?.pinCode)}
        </CCol>
      </CRow>
    </CContainer>
  );

  function renderField(label, field, value) {
    return (
      <div className="mb-3">
        <span className="fw-bold">{label}</span>
        <div className="d-flex align-items-center">
          {editableField === field ? (
            <>
              <CFormInput
                size="sm"
                value={updatedValue}
                onChange={(e) => setUpdatedValue(e.target.value)}
                className="me-2"
              />
              <CButton color="success" size="sm" onClick={handleSave}>
                Save
              </CButton>
            </>
          ) : (
            <>
              <span className="ms-2 text-muted">{value || '-'}</span>
              <CButton
                color="link"
                size="sm"
                className="ms-2"
                onClick={() => handleEdit(field, value)}
              >
                Edit
              </CButton>
            </>
          )}
        </div>
      </div>
    );
  }
};

export default Account;
