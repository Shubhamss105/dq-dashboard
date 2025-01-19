import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CContainer,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import DQLogo from '../assets/brand/logo-dark.png'
import { toggleUnfoldable, setSidebarShow } from '../redux/slices/sidebarSlice'

// Sidebar navigation configuration
import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebar.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebar.sidebarShow)

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch(setSidebarShow(visible))} // Update state on visibility change
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CContainer className="d-flex align-items-center justify-content-center">
            <img
              src={DQLogo}
              alt="Brand Logo"
              className="sidebar-brand-full"
              style={{ height: '40px', marginRight: '8px' }}
            />
            <h3 className="text-white m-0">DQ</h3>
          </CContainer>
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch(setSidebarShow(false))} // Close sidebar on small screens
        />
      </CSidebarHeader>
      <AppSidebarNav items={navigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => {
            dispatch(toggleUnfoldable()) // Toggle the unfoldable state
            // dispatch(setSidebarShow(false)) 
          }}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
