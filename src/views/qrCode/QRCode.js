import React, { useEffect, useState } from "react";
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
import { cilPlus } from "@coreui/icons";
import { useDispatch, useSelector } from "react-redux";
import { createQrCode, fetchQrCodes, deleteQrCode } from "../../redux/slices/qrSlice";

export default function QRCode() {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [tableNo, setTableNo] = useState("");

  const { qrList, loading } = useSelector((state) => state.qr);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const dispatch = useDispatch();

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchQrCodes(restaurantId));
    }
  }, [dispatch, restaurantId]);

  const handleSave = async () => {
    if (!tableNo) {
      alert("Please enter a valid table number.");
      return;
    }

    await dispatch(createQrCode({ restaurantId, tableNo }));
    setModalVisible(false);
    setTableNo("");
    // Refetch QR list to ensure UI updates
    dispatch(fetchQrCodes(restaurantId));
  };

  const handleDelete = async () => {
    if (selectedQr) {
      await dispatch(deleteQrCode(selectedQr.id));
      setActionModalVisible(false);
      // Refetch QR list to ensure UI updates
      dispatch(fetchQrCodes(restaurantId));
    }
  };

  const handleDownload = () => {
    if (selectedQr) {
      const link = document.createElement("a");
      link.href = selectedQr.qrCodeUrl;
      link.download = selectedQr.qrCodeUrl.split("/").pop();
      link.click();
      setActionModalVisible(false);
    }
  };

  const handleQrClick = (qr) => {
    setSelectedQr(qr);
    setActionModalVisible(true);
  };

  return (
    <div className="p-4">
      <h1 className="fs-4 fw-semibold text-center">Generate QR for Table</h1>

      <CRow className="mt-5">
        {/* Render QR containers */}
        {qrList?.map((qr) => (
          <CCol key={qr.id} xs="auto">
            <CContainer
              className="d-flex flex-column align-items-center justify-content-center bg-white border rounded"
              style={{
                width: "8rem",
                height: "8rem",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onClick={() => handleQrClick(qr)}
            >
              <div className="fw-bold">Table {qr.tableNumber}</div>
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
            <CIcon icon={cilPlus} size="xxl" className="text-black" />
          </CContainer>
        </CCol>
      </CRow>

      {/* Modal for Adding QR */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader className="d-flex justify-content-between align-items-center">
          <h2 className="fs-5 fw-bold">Generate QR</h2>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="number"
            placeholder="Table number"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
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

      {/* Modal for Actions (Delete/Download) */}
      <CModal visible={actionModalVisible} onClose={() => setActionModalVisible(false)}>
        <CModalHeader className="d-flex justify-content-between align-items-center">
          <h2 className="fs-5 fw-bold">QR Code Actions</h2>
        </CModalHeader>
        <CModalBody>
          <p className="text-center">Select an action for Table {selectedQr?.tableNumber}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={handleDelete}>
            Delete
          </CButton>
          <CButton color="primary" onClick={handleDownload}>
            Download
          </CButton>
         
        </CModalFooter>
      </CModal>
    </div>
  );
}
