// src/components/Otp.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp } from '../../../redux/slices/authSlice';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked } from '@coreui/icons';

const Otp = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get email passed from Login page
  const { email } = location.state || {};
  const { loading, error } = useSelector((state) => state.auth);

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Email is missing. Please login again.');
      navigate('/login');
      return;
    }
    dispatch(verifyOtp({ otp, email })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/dashboard'); // Navigate to Dashboard on success
      }
    });
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleOtpSubmit}>
                    <h1>Enter OTP</h1>
                    <p className="text-body-secondary">Please check your email for the OTP</p>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="text"
                        placeholder="OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" disabled={loading}>
                          {loading ? 'Verifying...' : 'Verify OTP'}
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Otp;
