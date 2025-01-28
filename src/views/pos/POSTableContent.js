import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CContainer, CRow, CCol, CButton, CCardFooter } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useParams } from 'react-router-dom'
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
import TaxModal from '../../components/TaxModal'
import DiscountModal from '../../components/DiscountModal'
import PaymentModal from '../../components/PaymentModal'
import DeleteModal from '../../components/DeleteModal'

const POSTableContent = () => {
  const dispatch = useDispatch()
  const invoiceRef = useRef(null)
  const kotRef = useRef(null)
  const { tableNumber } = useParams()
  const { customers, loading: customerLoading } = useSelector((state) => state.customers)
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems)
  const restaurantId = useSelector((state) => state.auth.restaurantId)

  const [showKOTModal, setShowKOTModal] = useState(false)
  const [kotImage, setKOTImage] = useState('')
  const [billContent, setBillContent] = useState('')

  const [elapsedTime, setElapsedTime] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [showTaxModal, setShowTaxModal] = useState(false)
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
    return subtotal + taxAmount - discountAmount
  }, [calculateSubtotal, tax, discount])

  // Handle adding customer
  const handleAddCustomer = () => {
    const customerData = { ...formValues, restaurantId }

    dispatch(addCustomer(customerData))
      .unwrap()
      .then((newCustomer) => {
        // Set the newly added customer's name
        setSelectedCustomerName(newCustomer.name)
        setShowCustomerModal(false)
      })
      .catch((error) => {
        console.error('Failed to add customer:', error)
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

    // Show the invoice section temporarily
    invoiceElement.style.display = 'block'

    html2canvas(invoiceElement, { scale: 2, useCORS: true }) // Optimize html2canvas
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        // Generate a Blob URL for the PDF
        const pdfBlob = pdf.output('bloburl')

        // Create a new window to display the PDF
        const previewWindow = window.open()
        if (previewWindow) {
          const htmlContent = `
                    <html>
                        <head>
                            <title>Invoice Preview</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                                iframe { width: 100%; height: 90vh; border: none; }
                                .actions {
                                    margin-top: 10px;
                                    text-align: center;
                                }
                                button {
                                    margin: 0 10px;
                                    padding: 10px 20px;
                                    font-size: 16px;
                                    cursor: pointer;
                                    background-color: #007bff;
                                    color: white;
                                    border: none;
                                    border-radius: 5px;
                                }
                                button:hover {
                                    background-color: #0056b3;
                                }
                            </style>
                        </head>
                        <body>
                            <iframe src="${pdfBlob}" width="100%" height="90%"></iframe>
                            <div class="actions">
                                <button onclick="window.print()">Print</button>
                                <button onclick="sendEmail()">Send via Email</button>
                            </div>
                            <script>
                                function sendEmail() {
                                    alert('Send via Email functionality to be implemented.');
                                }
                            </script>
                        </body>
                    </html>
                `

          // Write the HTML content to the new window
          previewWindow.document.open()
          previewWindow.document.write(htmlContent)
          previewWindow.document.close()
        }
      })
      .catch((error) => {
        console.error('Error generating invoice:', error)
      })
      .finally(() => {
        // Hide the invoice section after generating the PDF
        invoiceElement.style.display = 'none'
      })
  }

  const generateKOT = () => {
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
        console.error('Error generating KOT:', error)
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
          <title>KOT</title>
        </head>
        <body style="margin: 0; padding: 0;">
          <img src="${kotImage}" style="width: 100%;" />
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `)
      printWindow.document.close()
    }
  }

  return (
    <CContainer fluid className="p-4 shadow-shadow-lg bg-white">
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
            calculateDiscountAmount={calculateDiscountAmount}
            setShowTaxModal={setShowTaxModal}
            setShowDiscountModal={setShowDiscountModal}
            calculateTotal={calculateTotal}
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
          </CCardFooter>
        </CCol>
      </CRow>
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

<div style={{ position: "absolute", left: "-9999px" }}>
      <KOT ref={kotRef} tableNumber={tableNumber} cart={cart} />
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
    </CContainer>
  )
}

export default POSTableContent
