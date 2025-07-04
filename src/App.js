import React, { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { CSpinner, useColorModes } from '@coreui/react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { onMessage, isSupported } from 'firebase/messaging'
import { messaging } from './firebase'
import { toast } from 'react-toastify'

import './scss/style.scss'
import './scss/examples.scss'
import PrivateRoute from './components/PrivateRoute'
import './global.css'
import Reservation from './views/reservations/Reservation'
import Dues from './views/dues/Dues'
import Help from './views/help/Help'
import License from './views/license/License'
import Downloads from './views/downloads/Downloads'
import Delivery from './views/delivery/Delivery'
import { checkRestaurantPermission } from './redux/slices/restaurantProfileSlice'
import DeliveryTiming from './views/deliveryTiming/DeliveryTiming'
import notificationSound from './assets/notification.mp3'
import WooOrders from './views/delivery/WooOrders'
import CustomerReport from './views/reports/CustomerReport'
import TableReport from './views/reports/TableReport'
import Banner from './views/banners/Banner'
import { fetchOrders } from './redux/slices/orderSlice'
import PaymentTypeReport from './views/reports/PaymentTypeReport'
import DashboardStatisticsReport from './views/reports/DashboardStatisticsReport'
import TransactionCountReport from './views/reports/TransactionCountReport'
import TaxCollectedReport from './views/reports/TaxCollectedReport'
import TableUsageReport from './views/reports/TableUsageReport'
import DiscountUsageReport from './views/reports/DiscountUsageReport'
import AverageOrderValueReport from './views/reports/AverageOrderValueReport'
import TransactionsByPaymentTypeReport from './views/reports/TransactionsByPaymentTypeReport'
import TotalRevenueReport from './views/reports/TotalRevenueReport'
import MostOrderedDishesReport from './views/reports/MostOrderedDishesReport'
import YearlyChartReport from './views/reports/YearlyChartReport'
import WeeklyChartReport from './views/reports/WeeklyChartReport'

// Lazy Loading for pages
const SubCategory = React.lazy(() => import('./views/subCategory/SubCategory'))
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Otp = React.lazy(() => import('./views/pages/otp/Otp'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Orders = React.lazy(() => import('./views/orders/Orders'))
const Supplier = React.lazy(() => import('./views/inventory/supplier/Supplier'))
const QRCode = React.lazy(() => import('./views/qrCode/QRCode'))
const Category = React.lazy(() => import('./views/category/Category'))
const Stock = React.lazy(() => import('./views/inventory/stock/Stock'))
const Menu = React.lazy(() => import('./views/menu/Menu'))
const Customers = React.lazy(() => import('./views/customers/Customers'))
const Transactions = React.lazy(() => import('./views/transactions/Transactions'))
const POS = React.lazy(() => import('./views/pos/POS'))
const POSTableContent = React.lazy(() => import('./views/pos/POSTableContent'))
const Account = React.lazy(() => import('./views/account/Account'))
const DailyReport = React.lazy(() => import('./views/reports/DailyReport'))
const PaymentReport = React.lazy(() => import('./views/reports/PaymentReport'))
const Feedback = React.lazy(() => import('./views/feedbacks/Feedback'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))

const PermissionRestrictedRoute = ({ children, permission }) => {
  if (permission === 0) {
    return (
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', position: 'relative' }}>
        {children}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            color: 'white',
            fontSize: '24px',
          }}
        >
          Access restricted. Please contact support.
        </div>
      </div>
    )
  }

  return children
}

const App = () => {
  const dispatch = useDispatch()
  const { restaurantPermission } = useSelector((state) => ({
    restaurantPermission: state.restaurantProfile.restaurantPermission,
  }))
  const { restaurantId } = useSelector(
    (state) => ({
      restaurantId: state.auth.restaurantId,
    }),
    shallowEqual,
  )
  const audioRef = useRef(null)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { orders, loading } = useSelector((state) => state.orders)

  const audioPlayer = useMemo(() => {
    return <audio ref={audioRef} src={notificationSound} preload="auto" />
  }, [])

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.log('Play prevented:', e)
      })
      toast.success('New order received!')
    }
  }

  useEffect(() => {
    if (restaurantId) {
      dispatch(fetchOrders({ restaurantId }))
      const intervalId = setInterval(() => {
        dispatch(fetchOrders({ restaurantId }))
      }, 30000)

      return () => clearInterval(intervalId)
    }
  }, [dispatch, restaurantId])

  useEffect(() => {
    if (!loading && orders.length > 0) {
      if (isInitialLoad) {
        setPreviousOrderCount(orders.length)
        setIsInitialLoad(false)
      } else if (orders.length > previousOrderCount) {
        playNotificationSound()
        setPreviousOrderCount(orders.length)
      } else if (orders.length < previousOrderCount) {
        setPreviousOrderCount(orders.length)
      }
    }
  }, [orders, loading, previousOrderCount, isInitialLoad])

  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  useEffect(() => {
    if (restaurantId) {
      dispatch(checkRestaurantPermission({ restaurantId }))
    }
  }, [dispatch, restaurantId])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (!isColorModeSet()) {
      setColorMode('light')
    }
  }, [])

  const isPermissionLoaded = restaurantPermission !== undefined

  return (
    <>
      {audioPlayer}
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          {isPermissionLoaded && (
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/otp" element={<Otp />} />

              {/* Private Routes */}
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <DefaultLayout />
                  </PrivateRoute>
                }
              >
                {/* Nested Authenticated Routes */}
                {restaurantPermission?.permission === 0 ? (
                  // Only show orders route if permission is 0
                  <>
                    <Route index element={<Orders />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="*" element={<Navigate to="/orders" replace />} />
                  </>
                ) : (
                  // Show all routes if permission is 1
                  <>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="orders" element={<Orders />} />
                    <Route
                      path="delivery"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <WooOrders />
                        </PermissionRestrictedRoute>
                      }
                    />
                    {/* <Route path="delivery" element={
                      <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                        <Delivery />
                      </PermissionRestrictedRoute>
                    } /> */}
                    <Route
                      path="delivery-timing"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <DeliveryTiming />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="supplier"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Supplier />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="qr-code"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <QRCode />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="category"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Category />
                        </PermissionRestrictedRoute>
                      }
                    />

                    {/* adding subcategory route */}
                    <Route
                      path="subCategory"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <SubCategory />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="stock"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Stock />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="menu"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Menu />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="banners"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Banner />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="customers"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Customers />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="transactions"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Transactions />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="pos"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <POS />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="pos/tableNumber/:tableNumber"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <POSTableContent />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="account"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Account />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="daily-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <DailyReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="payment-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <PaymentReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="customer-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <CustomerReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="table-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TableReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="payment-type-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <PaymentTypeReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="dashboard-statistics-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <DashboardStatisticsReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="transactionByDate-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TransactionCountReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="tax-collection-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TaxCollectedReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="table-usage-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TableUsageReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="discount-usage-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <DiscountUsageReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="average-order-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <AverageOrderValueReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="payment-type-transaction-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TransactionsByPaymentTypeReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="total-revenue-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <TotalRevenueReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    {/* <Route
                      path="most-ordered-dishes-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <MostOrderedDishesReport/>
                        </PermissionRestrictedRoute>
                      }
                    /> */}
                    <Route
                      path="yearly-chart-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <YearlyChartReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="weekly-chart-report"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <WeeklyChartReport />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="feedback"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Feedback />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="reservations"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Reservation />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="dues"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Dues />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="help"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Help />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="license"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <License />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route
                      path="downloads"
                      element={
                        <PermissionRestrictedRoute permission={restaurantPermission?.permission}>
                          <Downloads />
                        </PermissionRestrictedRoute>
                      }
                    />
                    <Route path="*" element={<Page404 />} />
                  </>
                )}
              </Route>
            </Routes>
          )}
        </Suspense>
      </BrowserRouter>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export default App
