import React, { useState } from "react";
import {
  CButton,
  CModal,
  CModalBody,
  CModalHeader,
  CModalFooter,
  CFormInput,
  CContainer,
  CRow,
  CCol,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPlus, cilX } from "@coreui/icons";
import { useDispatch, useSelector } from "react-redux";
import { createQrCode } from "../../redux/slices/qrSlice";

export default function QRCode() {
  const [modalVisible, setModalVisible] = useState(false);
  const [tableNumber, setTableNumber] = useState("");

  const { qrList, loading } = useSelector((state) => state.qr);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const dispatch = useDispatch();

  const handleSave = () => {
    if (!tableNumber) {
      alert("Please enter a valid table number.");
      return;
    }

    dispatch(createQrCode({ restaurantId, tableNumber }));
    // setModalVisible(false);
    setTableNumber(""); 
  };

  return (
    <div className="p-4">
      <h1 className="fs-4 fw-bold">Generate QR for Table</h1>

      <CRow className="mt-5">
        {/* Render QR containers */}
        {qrList?.map((qr, index) => (
          <CCol key={index} xs="auto">
            <CContainer
              className="d-flex flex-column align-items-center justify-content-center bg-white border rounded"
              style={{
                width: "6rem",
                height: "6rem",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
            >
              <div className="fw-bold">{qr.tableNumber}</div>
              <img
                src={qr.qrCodeUrl}
                alt={`QR for Table ${qr.tableNumber}`}
                style={{ width: "80%", marginTop: "0.5rem" }}
              />
            </CContainer>
          </CCol>
        ))}

        {/* Add QR Code button */}
        <CCol xs="auto">
          <CContainer
            className="d-flex align-items-center justify-content-center bg-white text-white shadow-lg"
            style={{
              width: "8rem",
              height: "8rem",
              cursor: "pointer",
            }}
            onClick={() => setModalVisible(true)}
          >
            <CIcon icon={cilPlus} size="xxl" className="text-black font-extrabold"/>
          </CContainer>
        </CCol>
      </CRow>

      {/* Modal */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader className="d-flex justify-content-between align-items-center">
          <h2 className="fs-5 fw-bold">Generate QR for Table</h2>
         
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="number"
            placeholder="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="mb-3"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}
