import React, {useEffect} from 'react';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import { cilLockLocked, cilSettings, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector,shallowEqual } from 'react-redux'
import { localLogout } from '../../redux/slices/authSlice'; 
import { fetchRestaurantDetails } from '../../redux/slices/authSlice';

import avatar8 from './../../assets/images/avatars/8.jpg';

const AppHeaderDropdown = () => {
  const dispatch = useDispatch();

    const { restaurantId, token, auth } = useSelector(
      (state) => ({
        restaurantId: state.auth.restaurantId,
        token: state.auth.token,
        auth: state.auth.auth,
      }),
      shallowEqual
    );


      useEffect(() => {
        if (restaurantId && token) {
          dispatch(fetchRestaurantDetails({ restaurantId, token }));
        }
      }, [dispatch]);

  const handleLogout = () => {
    dispatch(localLogout()); 
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={auth?.image ? String(auth.image) : avatar8} size="md" />
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
  );
};

export default React.memo(AppHeaderDropdown);
