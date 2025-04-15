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
  const auth = useSelector((state) => state.auth.auth);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    const options = {
      year: 'numeric',
      month: 'short', // Mar
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
  
    return date.toLocaleString('en-US', options);
  };
  

  const generateInvoicePDF = (transactionDetails) => {
    const doc = new jsPDF();
    let yPos = 15;
    
    // Set font styles
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    
    // Restaurant Details (centered)
    doc.text(auth?.restName || 'Restaurant Name', 105, yPos, { align: 'center' });
    yPos += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(auth?.address || 'Restaurant Address', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Pin Code: ${auth?.pinCode || 'XXXXXX'}`, 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text(`Phone: ${auth?.phoneNumber || 'N/A'}`, 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Divider line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Invoice title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INVOICE', 105, yPos, { align: 'center' });
    yPos += 8;
    
    // Invoice details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // const invoiceDate = formatDate(transactionDetails.created_at);
    // doc.text(`Date: ${invoiceDate}`, 20, yPos);
    doc.text(`Invoice #: ${transactionDetails.id}`, 160, yPos);
    yPos += 5;
    
    doc.text(`Customer: ${transactionDetails.userName || 'Walk-in Customer'}`, 20, yPos);
    doc.text(`Table: ${transactionDetails.tableNumber || 'N/A'}`, 160, yPos);
    yPos += 5;
    
    doc.text(`Payment Type: ${transactionDetails.payment_type}`, 20, yPos);
    yPos += 10;
    
    // Divider line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Order details header
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details:', 20, yPos);
    yPos += 7;
    
    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('#', 20, yPos);
    doc.text('Item', 40, yPos);
    doc.text('Price', 120, yPos);
    doc.text('Qty', 150, yPos);
    doc.text('Total', 180, yPos, { align: 'right' });
    yPos += 5;
    
    // Divider line
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Order items
    doc.setFont('helvetica', 'normal');
    transactionDetails.items?.forEach((item, index) => {
      doc.text(`${index + 1}`, 20, yPos);
      doc.text(item.itemName, 40, yPos);
      doc.text(`₹${item.price.toFixed(2)}`, 120, yPos);
      doc.text(`${item.quantity}`, 150, yPos);
      doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 180, yPos, { align: 'right' });
      yPos += 7;
    });
    
    yPos += 5;
    // Divider line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Totals
    doc.text('Subtotal:', 140, yPos);
    doc.text(`₹${transactionDetails?.sub_total.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 7;
    
    doc.text(`Tax (${transactionDetails.tax_rate || 0}%):`, 140, yPos);
    doc.text(`₹${transactionDetails?.tax.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 7;
    
    doc.text(`Discount (${transactionDetails?.discount_rate || 0}%):`, 140, yPos);
    doc.text(`₹${transactionDetails?.discount.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 10;
    
    // Divider line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;
    
    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount:', 140, yPos);
    doc.text(`₹${transactionDetails.total.toFixed(2)}`, 180, yPos, { align: 'right' });
    yPos += 15;
    
    // Thank you message
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('--- Thank you for your visit ---', 105, yPos, { align: 'center' });

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
