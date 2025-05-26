import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CContainer, CRow, CCol, CButton, CCardFooter } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { cilPlus, cilTrash, cilSearch } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMenuItems } from '../../redux/slices/menuSlice'
import { fetchCustomers, addCustomer } from '../../redux/slices/customerSlice'
import { createTransaction } from '../../redux/slices/transactionSlice'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import CustomerModal from '../../components/CustomerModal'
import ProductList from '../../components/ProductList'
import Cart from '../../components/Cart'
import Invoice from '../../components/Invoice'
import KOT from '../../components/KOT'
import KOTModal from '../../components/KOTModal'
import InvoiceModal from '../../components/InvoiceModal'
import TaxModal from '../../components/TaxModal'
import DiscountModal from '../../components/DiscountModal'
import PaymentModal from '../../components/PaymentModal'
import DeleteModal from '../../components/DeleteModal'
import RoundOffAmountModal from '../../components/RoundOffAmountModal'

const POSTableContent = () => {
  const dispatch = useDispatch()
  const invoiceRef = useRef(null)
  const kotRef = useRef(null)
  const { tableNumber } = useParams()
  const { customers, loading: customerLoading } = useSelector((state) => state.customers)
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems)
  const restaurantId = useSelector((state) => state.auth.restaurantId)
  const theme = useSelector((state) => state.theme.theme)

  const [showKOTModal, setShowKOTModal] = useState(false)
  const [kotImage, setKOTImage] = useState('')
  const [kotItems, setKotItems] = useState([])

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceImage, setInvoiceImage] = useState('')

  const [elapsedTime, setElapsedTime] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [roundOff, setRoundOff] = useState(0)
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [showRoundOffModal, setShowRoundOffModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomerName, setSelectedCustomerName] = useState('')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentType, setPaymentType] = useState('')
  const [splitPercentages, setSplitPercentages] = useState({ online: 0, cash: 0, due: 0 })
  const [searchProduct, setSearchProduct] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(`cart_${tableNumber}`)
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem(`start_time_${tableNumber}`)
    return savedStartTime ? new Date(savedStartTime) : null
  })
  const [mobilePrintOptions, setMobilePrintOptions] = useState({
    show: false,
    pdfUrl: null,
    message: '',
  })

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date()
        setElapsedTime(Math.floor((now - startTime) / 1000))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [startTime])

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchMenuItems({ restaurantId }))
      dispatch(fetchCustomers({ restaurantId }))
    }
  }, [dispatch, restaurantId])

  useEffect(() => {
    localStorage.setItem(`cart_${tableNumber}`, JSON.stringify(cart))
  }, [cart])

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromCart(itemToDelete.id)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  const filteredCustomers = customers?.filter((customer) =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredMenuItems = menuItems?.filter((product) =>
    product.itemName?.toLowerCase().includes(searchProduct.toLowerCase()),
  )

  const handleCustomerSelect = (customer) => {
    setSelectedCustomerName(customer.name)
    setShowCustomerModal(false)
  }

  const handleSearchProduct = (e) => {
    setSearchProduct(e.target.value)
  }

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      )
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    if (!startTime) {
      const now = new Date()
      setStartTime(now)
      localStorage.setItem(`start_time_${tableNumber}`, now.toISOString())
    }
  }

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId)
    setCart(updatedCart)

    if (updatedCart.length === 0) {
      setStartTime(null)
      setElapsedTime(0)
      localStorage.removeItem(`start_time_${tableNumber}`)
    }
  }

  const clearCart = () => {
    setCart([])
    setRoundOff('')
    setStartTime(null)
    setElapsedTime(0)
    localStorage.removeItem(`cart_${tableNumber}`)
    localStorage.removeItem(`start_time_${tableNumber}`)
  }

  const handleTaxSubmit = () => {
    setTax(Number(inputValue))
    setShowTaxModal(false)
    setInputValue('')
  }

  const handleDiscountSubmit = () => {
    setDiscount(Number(inputValue))
    setShowDiscountModal(false)
    setInputValue('')
  }
  const handleRoundOffSubmit = () => {
    setRoundOff(Number(inputValue))
    setShowRoundOffModal(false)
    setInputValue('')
  }

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0)
  }, [cart])

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * tax) / 100
  }

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal()
    return (subtotal * discount) / 100
  }

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal()
    const taxAmount = (subtotal * tax) / 100
    const discountAmount = (subtotal * discount) / 100
    return subtotal + taxAmount - discountAmount - roundOff
  }, [calculateSubtotal, tax, discount, roundOff])

  const handleQuantityChange = (productId, newQuantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item,
      ),
    )
  }

  // Handle adding customer
  const handleAddCustomer = (formValues) => {
    const customerData = { ...formValues, restaurantId }

    dispatch(addCustomer(customerData))
      .unwrap()
      .then((newCustomer) => {
        // Set the newly added customer's name
        setSelectedCustomerName(newCustomer.name)
        setShowCustomerModal(false)
      })
      .catch((error) => {
        toast.error('Failed to add customer: ' + error.message)
      })
  }

  const handlePaymentSubmit = async () => {
    const payload = {
      user_id: 1,
      items: cart?.map((item) => ({
        itemId: item.id,
        itemName: item.itemName,
        price: item.price,
        quantity: item.quantity,
      })),
      tax: tax,
      discount: discount,
      sub_total: calculateSubtotal(),
      total: calculateTotal(),
      type: paymentType,
      restaurantId: restaurantId,
      tableNumber: tableNumber,
    }

    if (paymentType === 'split') {
      payload.split_details = { ...splitPercentages }
    }

    dispatch(createTransaction(payload))
      .unwrap()
      .then(() => {
        setShowPaymentModal(false)
        clearCart()
      })
      .catch((error) => {
        console.error('Error submitting payment:', error)
      })
  }

  const generateInvoice = () => {
    const invoiceElement = invoiceRef.current

    if (!invoiceElement) return

    invoiceElement.style.display = 'block' // Show invoice section

    html2canvas(invoiceElement, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        setInvoiceImage(imgData) // Set the generated image
        setShowInvoiceModal(true) // Open modal to show invoice preview
      })
      .catch((error) => {
        toast.error(`Error generating invoice: ${error}`, { autoClose: 3000 })
      })
      .finally(() => {
        invoiceElement.style.display = 'none' // Hide the invoice section after capture
      })
  }

const handleInvoicePrint = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  if (isMobile) {
    if (/Android/i.test(navigator.userAgent)) {
      // Android-specific printing solution
      handleAndroidPrint();
    } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      handleMobileDownload('ios');
    } else {
      handleMobileDownload('other');
    }
  } else {
    // Desktop printing - existing implementation
    const printWindow = window.open();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice Print</title>
            <style>
              @page {
                size: 2in auto; /* Ensures 2-inch width */
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                text-align: center;
              }
              img {
                width: 2in;
              }
            </style>
          </head>
          <body>
            <img src="${invoiceImage}" />
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 100);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
};

const handleAndroidPrint = () => {
  // Create a new window with the invoice image
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice</title>
          <style>
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              margin: 0;
            }
            img {
              width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img src="${invoiceImage}" />
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked
    setMobilePrintOptions({
      show: true,
      pdfUrl: invoiceImage, // Use the image directly
      message: 'Please allow popups to print. Then tap the image and select "Print" from your browser menu.'
    });
  }
};

const handleMobileDownload = (platform) => {
  // Create a PDF from the invoice image using a library like jsPDF
  import('jspdf').then((jsPDF) => {
    const { jsPDF: JSPDF } = jsPDF;
    const doc = new JSPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [2, 8], // 2-inch width receipt
    });

    // Add the image to the PDF
    const img = new Image();
    img.src = invoiceImage;
    img.onload = () => {
      // Calculate height based on aspect ratio
      const ratio = img.height / img.width;
      const imgHeight = 2 * ratio; // 2-inch width with proper aspect ratio

      doc.addImage(invoiceImage, 'PNG', 0, 0, 2, imgHeight);

      if (platform === 'ios') {
        // For iOS, we can offer to open in another app
        const pdfOutput = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfOutput);

        // Show options dialog for iOS
        setMobilePrintOptions({
          show: true,
          pdfUrl,
          message:
            'iOS devices require you to download the PDF and print from Files or another app.',
        });
      } else if (platform === 'android') {
        // For Android, similar approach but with Android-specific guidance
        const pdfOutput = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfOutput);

        // Show options dialog for Android
        setMobilePrintOptions({
          show: true,
          pdfUrl,
          message: "Download the PDF and use your device's print service or a printing app.",
        });
      } else {
        // Generic mobile approach
        const pdfOutput = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfOutput);

        setMobilePrintOptions({
          show: true,
          pdfUrl,
          message: 'Download the invoice as PDF to print from another app.',
        });
      }
    };
  }).catch((error) => {
    toast.error(`Error preparing mobile print: ${error}`, { autoClose: 3000 });
  });
};


  const handleSendEmail = () => {
    alert('Send via Email functionality to be implemented.')
  }

  const generateKOT = () => {
    // Find new items that are not in the generated KOT
    const newItems = cart.filter((item) => !kotItems.some((kot) => kot.id === item.id))

    if (newItems.length === 0) {
      toast.info('No new items to generate KOT!', { autoClose: 3000 })
      return
    }

    setKotItems((prevKotItems) => [...prevKotItems, ...newItems]) // Update generated KOT items

    const kotElement = kotRef.current
    if (!kotElement) return

    kotElement.style.display = 'block'

    html2canvas(kotElement, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        setKOTImage(imgData)
        setShowKOTModal(true)
      })
      .catch((error) => {
        toast.error(`Error generating KOT: ${error}`, { autoClose: 3000 })
      })
      .finally(() => {
        kotElement.style.display = 'none'
      })
  }

  const handlePrint = () => {
    const printWindow = window.open()
    if (printWindow) {
      printWindow.document.write(`
     <html>
      <head>
        <title>KOT Print</title>
        <style>
          @page { 
            size: 2in auto; /* Ensures 2-inch width */
            margin: 0; 
          }
          body {
            margin: 0;
            padding: 0;
            text-align: center;
          }
          img {
            width: 2in;
          }
        </style>
      </head>
      <body>
        <img src="${kotImage}" style="width: 2in;" />
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
          };
        </script>
      </body>
    </html>
    `)
      printWindow.document.close()
    }
  }

  const MobilePrintOptionsModal = ({ isVisible, options, onClose }) => {
    if (!isVisible || !options) return null
  
    const isAndroid = /Android/i.test(navigator.userAgent)
  
    return (
      <div className="mobile-print-modal" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto'
        }}>
          <h3>Print Options</h3>
          <p>{options.message}</p>
          
          {isAndroid && (
            <div className="android-options" style={{marginBottom: '15px'}}>
              <p><strong>Android Printing Instructions:</strong></p>
              <ol style={{textAlign: 'left', paddingLeft: '20px'}}>
                <li>Download the PDF using the button below</li>
                <li>Open your Downloads folder</li>
                <li>Tap on the invoice.pdf file</li>
                <li>Select "Print" from the menu options</li>
                <li>Choose your printer</li>
              </ol>
            </div>
          )}
          
          <div className="button-group" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <a 
              href={options.pdfUrl} 
              download="invoice.pdf" 
              className="btn btn-primary"
              style={{
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              Download PDF
            </a>
            
            <button 
              onClick={() => {
                handleSendEmail()
                onClose()
              }} 
              className="btn btn-secondary"
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Send via Email
            </button>
          </div>
          
          <button 
            onClick={onClose} 
            className="btn btn-light mt-3"
            style={{
              padding: '10px 15px',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              border: '1px solid #ddd',
              borderRadius: '4px',
              marginTop: '15px',
              width: '100%'
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <CContainer
      fluid
      className={`p-4 shadow-lg ${theme == 'light' ? 'bg-white text-dark' : 'bg-dark text-white'}`}
    >
      <CRow>
        <CCol md={8} sm={12} className="mb-4">
          <ProductList
            searchProduct={searchProduct}
            handleSearchProduct={handleSearchProduct}
            tableNumber={tableNumber}
            menuItemsLoading={menuItemsLoading}
            filteredMenuItems={filteredMenuItems}
            addToCart={addToCart}
          />
        </CCol>
        <CCol md={4} sm={12}>
          <Cart
            selectedCustomerName={selectedCustomerName}
            setShowCustomerModal={setShowCustomerModal}
            startTime={startTime}
            elapsedTime={elapsedTime}
            cart={cart}
            handleDeleteClick={handleDeleteClick}
            tax={tax}
            calculateTaxAmount={calculateTaxAmount}
            discount={discount}
            roundOffer={roundOff}
            calculateDiscountAmount={calculateDiscountAmount}
            setShowTaxModal={setShowTaxModal}
            setShowRoundOffModal={setShowRoundOffModal}
            setShowDiscountModal={setShowDiscountModal}
            calculateTotal={calculateTotal}
            handleQuantityChange={handleQuantityChange}
          />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCardFooter className="bg-warning text-white rounded-2 p-3 mt-3 shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              {/* Total Amount */}
              <h4 className="mb-0 fs-5 fs-md-4 text-center text-md-start">
                Total: ₹{calculateTotal()}
              </h4>

              {/* Buttons */}
              <div className="d-flex flex-column flex-md-row gap-2">
                <CButton color="danger" onClick={clearCart} className="text-white fw-bold">
                  Cancel
                </CButton>
                <CButton color="primary" onClick={generateKOT} className="text-white fw-bold">
                  Generate KOT
                </CButton>
                <CButton color="secondary" onClick={generateInvoice} className="text-white fw-bold">
                  Generate Bill
                </CButton>
                <CButton
                  color="success"
                  className="text-white fw-bold"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Pay Now
                </CButton>
              </div>
            </div>

            <KOTModal isVisible={showKOTModal} onClose={() => setShowKOTModal(false)}>
              <div style={{ textAlign: 'center' }}>
                <h3>KOT Preview</h3>
                {kotImage && (
                  <img
                    src={kotImage}
                    alt="KOT Preview"
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                )}
                <button
                  onClick={handlePrint}
                  style={{
                    margin: '0 10px',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Print
                </button>
              </div>
            </KOTModal>

            {/* Invoice Modal */}
            <InvoiceModal isVisible={showInvoiceModal} onClose={() => setShowInvoiceModal(false)}>
              <div style={{ textAlign: 'center' }}>
                <h3>Invoice Preview</h3>
                {invoiceImage && (
                  <img
                    src={invoiceImage}
                    alt="Invoice Preview"
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                )}
                <div style={{ marginTop: '10px' }}>
                  <button onClick={handleInvoicePrint}>Print</button>
                  <button onClick={handleSendEmail}>Send via Email</button>
                </div>
              </div>
            </InvoiceModal>
          </CCardFooter>
        </CCol>
      </CRow>

      <div style={{ position: 'absolute', left: '-9999px' }}>
        <Invoice
          ref={invoiceRef}
          tableNumber={tableNumber}
          selectedCustomerName={selectedCustomerName}
          cart={cart}
          calculateSubtotal={calculateSubtotal}
          tax={tax}
          calculateTaxAmount={calculateTaxAmount}
          discount={discount}
          calculateDiscountAmount={calculateDiscountAmount}
          calculateTotal={calculateTotal}
        />
      </div>

      <div style={{ position: 'absolute', left: '-9999px' }}>
        <KOT
          ref={kotRef}
          tableNumber={tableNumber}
          cart={cart.filter((item) => !kotItems.includes(item))}
        />
      </div>
      <TaxModal
        showTaxModal={showTaxModal}
        setShowTaxModal={setShowTaxModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleTaxSubmit={handleTaxSubmit}
      />
      <DiscountModal
        showDiscountModal={showDiscountModal}
        setShowDiscountModal={setShowDiscountModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleDiscountSubmit={handleDiscountSubmit}
      />
      <RoundOffAmountModal
        showRoundOffModal={showRoundOffModal}
        setShowRoundOffModal={setShowRoundOffModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleRoundOffSubmit={handleRoundOffSubmit}
      />
      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
        splitPercentages={splitPercentages}
        setSplitPercentages={setSplitPercentages}
        handlePaymentSubmit={handlePaymentSubmit}
      />
      <DeleteModal
        showDeleteModal={showDeleteModal}
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
      />
      <CustomerModal
        showCustomerModal={showCustomerModal}
        setShowCustomerModal={setShowCustomerModal}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCustomers={filteredCustomers}
        handleCustomerSelect={handleCustomerSelect}
        customerLoading={customerLoading}
        handleAddCustomer={handleAddCustomer}
      />
      <MobilePrintOptionsModal
        isVisible={mobilePrintOptions.show}
        options={mobilePrintOptions}
        onClose={() => setMobilePrintOptions({ ...mobilePrintOptions, show: false })}
      />
    </CContainer>
  )
}

export default POSTableContent
