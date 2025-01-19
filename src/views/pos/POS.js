import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQrCodes } from '../../redux/slices/qrSlice';
import { CContainer, CCol, CRow, CSpinner } from '@coreui/react';

const POS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { qrList, loading, error } = useSelector((state) => state.qr);
  const restaurantId = useSelector((state) => state.auth.restaurantId);
  
  // State to track the cart for each table
  const [cart, setCart] = useState({});

  // Fetch QR codes only once on component mount
  useEffect(() => {
    // Make sure the API call is only made once
    if (qrList.length === 0) {
      dispatch(fetchQrCodes(restaurantId));
    }

    // Initialize the cart state from localStorage
    const storedCarts = {};
    qrList.forEach((qr) => {
      const savedCart = localStorage.getItem(`cart_${qr.tableNumber}`);
      if (savedCart) {
        storedCarts[qr.tableNumber] = JSON.parse(savedCart);
      }
    });
    setCart(storedCarts);
  }, [dispatch, restaurantId, qrList.length]); // Only rerun effect if qrList length changes (first render)


  const handleQrClick = (qr) => {
    navigate(`/pos/tableNumber/${qr.tableNumber}`);
  };

  const isItemInCart = (qr) => {
    return cart[qr.tableNumber] && cart[qr.tableNumber].length > 0;
  };

  return (
    <CContainer className="py-2">
      <h3 className="text-center mb-4">Select Table To Generate Bill</h3>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        <CRow className="justify-content-start">
          {qrList.map((qr) => (
            <CCol key={qr.id} xs="auto" className="mx-4">
              <CContainer
                className={`d-flex flex-column align-items-center justify-content-center shadow-lg border rounded ${
                  isItemInCart(qr) ? 'bg-danger' : 'bg-white'
                }`}
                style={{
                  width: '10rem',
                  height: '10rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                }}
                onClick={() => handleQrClick(qr)}
              >
                <div className="fw-bold">Table {qr.tableNumber}</div>
              </CContainer>
            </CCol>
          ))}
          <CCol xs="auto" className="mx-4">
            <CContainer
              className="d-flex flex-column align-items-center justify-content-center bg-white shadow-lg border rounded"
              style={{
                width: '10rem',
                height: '10rem',
                marginBottom: '1rem',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/pos/tableNumber/0')}
            >
              <div className="fw-bold">Takeaway</div>
            </CContainer>
          </CCol>
        </CRow>
      )}
    </CContainer>
  );
};

export default POS;
