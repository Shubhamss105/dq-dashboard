import React, { useState, useEffect, useCallback } from 'react';
import { CContainer, CRow, CCol, CCard, CCardHeader, CCardBody, CCardFooter, CButton } from '@coreui/react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMenuItems } from '../../redux/slices/menuSlice';
import { fetchCustomers } from '../../redux/slices/customerSlice';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import CustomerModal from './components/CustomerModal';
import TaxModal from './components/TaxModal';
import DiscountModal from './components/DiscountModal';
import PaymentModal from './components/PaymentModal';
import DeleteModal from './components/DeleteModal';
import Invoice from './components/Invoice';

const POSTableContent = () => {
  const dispatch = useDispatch();
  const { tableNumber } = useParams();
  const { customers, loading: customerLoading } = useSelector((state) => state.customers);
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems);
  const restaurantId = useSelector((state) => state.auth.restaurantId);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(`cart_${tableNumber}`);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [startTime, setStartTime] = useState(() => {
    const savedStartTime = localStorage.getItem(`start_time_${tableNumber}`);
    return savedStartTime ? new Date(savedStartTime) : null;
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchMenuItems({ restaurantId }));
      dispatch(fetchCustomers({ restaurantId }));
    }
  }, [dispatch, restaurantId]);

  useEffect(() => {
    localStorage.setItem(`cart_${tableNumber}`, JSON.stringify(cart));
  }, [cart]);

  const calculateSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  }, [cart]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * tax) / 100;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal + taxAmount - discountAmount;
  }, [calculateSubtotal, tax, discount]);

  const clearCart = () => {
    setCart([]);
    setStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem(`cart_${tableNumber}`);
    localStorage.removeItem(`start_time_${tableNumber}`);
  };

  return (
    <CContainer fluid className="p-4 shadow-shadow-lg bg-white">
      <CRow>
        <CCol md={8} sm={12} className="mb-4">
          <ProductList
            menuItems={menuItems}
            loading={menuItemsLoading}
            addToCart={(product) => {
              setCart((prevCart) => {
                const existingItem = prevCart.find((item) => item.id === product.id);
                if (existingItem) {
                  return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                  );
                } else {
                  return [...prevCart, { ...product, quantity: 1 }];
                }
              });
              if (!startTime) {
                const now = new Date();
                setStartTime(now);
                localStorage.setItem(`start_time_${tableNumber}`, now.toISOString());
              }
            }}
          />
        </CCol>
        <CCol md={4} sm={12}>
          <Cart
            cart={cart}
            elapsedTime={elapsedTime}
            startTime={startTime}
            tax={tax}
            discount={discount}
            selectedCustomerName={selectedCustomerName}
            calculateSubtotal={calculateSubtotal}
            calculateTotal={calculateTotal}
            setShowTaxModal={setShowTaxModal}
            setShowDiscountModal={setShowDiscountModal}
            setShowCustomerModal={setShowCustomerModal}
            setShowDeleteModal={setShowDeleteModal}
            setItemToDelete={setItemToDelete}
            clearCart={clearCart}
            setShowPaymentModal={setShowPaymentModal}
          />
        </CCol>
      </CRow>

      <Invoice
        tableNumber={tableNumber}
        selectedCustomerName={selectedCustomerName}
        cart={cart}
        calculateSubtotal={calculateSubtotal}
        calculateTotal={calculateTotal}
        tax={tax}
        discount={discount}
      />

      <CustomerModal
        show={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        customers={customers}
        selectedCustomerName={selectedCustomerName}
        setSelectedCustomerName={setSelectedCustomerName}
        customerLoading={customerLoading}
      />

      <TaxModal
        show={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        setTax={setTax}
      />

      <DiscountModal
        show={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        setDiscount={setDiscount}
      />

      <PaymentModal
        show={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        handlePaymentSubmit={() => {
          // Implement payment submission logic here
        }}
      />

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        confirmDelete={() => {
          if (itemToDelete) {
            setCart((prevCart) => prevCart.filter((item) => item.id !== itemToDelete.id));
            setShowDeleteModal(false);
            setItemToDelete(null);
          }
        }}
      />
    </CContainer>
  );
};

export default POSTableContent;