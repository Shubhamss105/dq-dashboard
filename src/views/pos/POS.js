import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchQrCodes } from '../../redux/slices/qrSlice';
import { CContainer, CCol, CRow, CSpinner } from '@coreui/react';

const POS = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { qrList, loading, error } = useSelector((state) => state.qr);
    const restaurantId = useSelector((state) => state.auth.restaurantId)

  useEffect(() => {
    dispatch(fetchQrCodes(restaurantId));
  }, [dispatch]);

  const handleQrClick = (qr) => {
    navigate(`/pos/tableNumber/${qr.tableNumber}`);
  };

  return (
    <CContainer className="py-5">
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
                className="d-flex flex-column align-items-center justify-content-center bg-white shadow-lg border rounded"
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
