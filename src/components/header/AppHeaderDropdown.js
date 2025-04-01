import React, { useEffect, useState } from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilLockLocked, cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { localLogout } from '../../redux/slices/authSlice'
import { fetchRestaurantDetails } from '../../redux/slices/authSlice'
import { fetchNotificationOrders } from '../../redux/slices/orderSlice'
import notificationSound from '../../assets/notification.mp3'
import { toast } from 'react-toastify'
import useSound from 'use-sound'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const dispatch = useDispatch()

  const { restaurantId, token, auth } = useSelector(
    (state) => ({
      restaurantId: state.auth.restaurantId,
      token: state.auth.token,
      auth: state.auth.auth,
    }),
    shallowEqual,
  )
  const [previousOrders, setPreviousOrders] = useState([])
  const { notificationOrders=[] } = useSelector((state) => state.orders)

  const [play] = useSound(notificationSound)

  useEffect(() => {
    if (!restaurantId) return 

    const POLLING_INTERVAL = 10000 

    const fetchOrders = async () => {
      dispatch(fetchNotificationOrders({ restaurantId }))
    }

    const interval = setInterval(fetchOrders, POLLING_INTERVAL)
    fetchOrders()

    return () => clearInterval(interval)
  }, [dispatch, restaurantId]) 

  // Detect new orders
useEffect(() => {
  if (!Array.isArray(notificationOrders) || !Array.isArray(previousOrders)) return;

  if (notificationOrders.length > previousOrders.length) {
    toast.success('New Order Received! 🎉')
    play()
  }

  // Update only if the orders changed
  if (JSON.stringify(notificationOrders) !== JSON.stringify(previousOrders)) {
    setPreviousOrders(notificationOrders)
  }
}, [notificationOrders, play])
  

  useEffect(() => {
    if (restaurantId && token) {
      dispatch(fetchRestaurantDetails({ restaurantId, token }))
    }
  }, [dispatch])

  const handleLogout = () => {
    dispatch(localLogout())
  }


  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={auth?.image ? String(auth.image) : avatar8} size="sm" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem style={{ cursor: 'pointer' }}>
          <Link to="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </Link>
        </CDropdownItem>

        <CDropdownItem style={{ cursor: 'pointer' }}>
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem style={{ cursor: 'pointer' }} onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default React.memo(AppHeaderDropdown)
