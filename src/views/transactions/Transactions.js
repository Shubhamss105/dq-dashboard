import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import {
  fetchTransactionsByRestaurant,
  fetchTransactionDetails,
} from '../../redux/slices/transactionSlice';
import { CSpinner, CModal, CModalBody, CModalHeader, CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilFile } from '@coreui/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CustomToolbar from '../../utils/CustomToolbar';
import { useMediaQuery } from '@mui/material';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state) => state.transactions);
  const restaurantId = useSelector((state) => state.auth.restaurantId);
  const theme = useSelector((state) => state.theme.theme); 

  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceContent, setInvoiceContent] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchTransactionsByRestaurant({ restaurantId }));
    }
  }, [dispatch, restaurantId]);

  const generateInvoicePDF = (transactionDetails) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invoice', 14, 20);
    doc.setFontSize(12);

    // Add transaction details
    doc.text(`Transaction ID: ${transactionDetails.id}`, 14, 30);
    doc.text(`User Name: ${transactionDetails.userName}`, 14, 40);
    doc.text(`Date: ${transactionDetails.created_at}`, 14, 50);
    doc.text(`Payment Type: ${transactionDetails.payment_type}`, 14, 60);

    // Add items table
    const items = transactionDetails?.items?.map((item, index) => [
      index + 1,
      item.itemName,
      item.price,
      item.quantity,
      item.price * item.quantity,
    ]);

    doc.autoTable({
      startY: 70,
      head: [['#', 'Item Name', 'Price', 'Quantity', 'Total']],
      body: items,
    });

    // Add total section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: ${transactionDetails.sub_total}`, 14, finalY);
    doc.text(`Tax: ${transactionDetails.tax}`, 14, finalY + 10);
    doc.text(`Discount: ${transactionDetails.discount}`, 14, finalY + 20);
    doc.text(`Total: ${transactionDetails.total}`, 14, finalY + 30);

    return doc;
  };

  const handleGenerateInvoice = (transactionId) => {
    dispatch(fetchTransactionDetails({ transactionId })).then((action) => {
      if (action.payload && Array.isArray(action.payload)) {
        const transactionDetails = action.payload[0];
        if (!transactionDetails) {
          alert('Transaction details not found');
          return;
        }

        // Generate the PDF
        const doc = generateInvoicePDF(transactionDetails);
        setPdfDoc(doc);
        setInvoiceContent(transactionDetails);
        setModalVisible(true);
      } else {
        alert('Failed to generate invoice. Please try again.');
      }
    });
  };

  const handleDownload = () => {
    if (pdfDoc) {
      pdfDoc.save(`Invoice_${invoiceContent.id}.pdf`);
    }
  };

  const handlePrint = () => {
    if (pdfDoc) {
      const printWindow = window.open('', '_blank');
      const pdfString = pdfDoc.output('datauristring');
      printWindow.document.write(
        `<iframe width='100%' height='100%' src='${pdfString}'></iframe>`
      );
      printWindow.document.close();
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 100 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'user_id',
      headerName: 'User ID',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'total',
      headerName: 'Total',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'tax',
      headerName: 'Tax',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'discount',
      headerName: 'Discount',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 200 : undefined,
      headerClassName: 'header-style',
      valueGetter: (params) => new Date(params.row.created_at).toLocaleString() || 'N/A',
    },
    {
      field: 'payment_type',
      headerName: 'Payment Type',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
    },
    {
      field: 'invoice',
      headerName: 'Invoice',
      flex: isMobile ? undefined : 1,
      minWidth: isMobile ? 150 : undefined,
      headerClassName: 'header-style',
      renderCell: (params) => (
        <CIcon
          icon={cilFile}
          style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'blue' }}
          onClick={() => handleGenerateInvoice(params.row.id)}
        />
      ),
    },
  ];

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <h2 className="mb-4">Transactions</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <DataGrid
            autoHeight
            rows={transactions
              ?.slice()
              ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              ?.map((transaction) => ({
                id: transaction.id,
                ...transaction,
              }))}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            slots={{
              toolbar: CustomToolbar,
            }}
            sx={{
              backgroundColor: theme === 'dark' ? '#2A2A2A' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              '& .MuiDataGrid-cell': {
                color: theme === 'dark' ? '#ffffff' : '#000000',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
                color: theme === 'dark' ? '#ffffff' : '#000000',
              },
            }}
          />
        </div>
      )}

      {/* Modal for Invoice Preview */}
      {invoiceContent && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <CModalHeader>Invoice Preview</CModalHeader>
          <CModalBody>
            <iframe
              src={pdfDoc?.output('datauristring')}
              style={{ width: '100%', height: '400px', border: 'none' }}
              title="Invoice Preview"
            ></iframe>
            <div className="mt-3 d-flex justify-content-between">
              <CButton color="primary" onClick={handleDownload}>
                Download
              </CButton>
              <CButton color="secondary" onClick={handlePrint}>
                Print
              </CButton>
            </div>
          </CModalBody>
        </CModal>
      )}
    </div>
  );
};

export default Transactions;
