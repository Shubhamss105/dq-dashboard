import React from 'react';
import PropTypes from 'prop-types';
import { CButton, CFormSwitch, CTooltip } from '@coreui/react';
import { DataGrid } from '@mui/x-data-grid';
import CustomToolbar from '../utils/CustomToolbar';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';

const MenuItemList = ({ 
  menuItems=[], 
  loading, 
  onEditClick, 
  onDeleteClick, 
  onStatusChange 
}) => {
  const columns = [
    {
      field: 'itemImage',
      headerName: 'Image',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <img 
          src={params.value} 
          alt={params.row.itemName} 
          style={{ 
            width: 80, 
            height: 80, 
            objectFit: 'cover', 
            borderRadius: 4 
          }}
        />
      ),
    },
    {
      field: 'itemName',
      headerName: 'Item Name',
      flex: 2,
      minWidth: 200,
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => `$${params.value}`
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <CTooltip content={params.value === 1 ? 'Active' : 'Inactive'}>
          <CFormSwitch
            color="primary"
            checked={params.value === 1}
            onChange={() => onStatusChange(params.row.id, params.value === 1 ? 0 : 1)}
          />
        </CTooltip>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="d-flex gap-2">
          <CTooltip content="Edit">
            <CButton
              color="info"
              variant="outline"
              size="sm"
              onClick={() => onEditClick(params.row)}
            >
              <CIcon icon={cilPencil} />
            </CButton>
          </CTooltip>
          <CTooltip content="Delete">
            <CButton
              color="danger"
              variant="outline"
              size="sm"
              onClick={() => onDeleteClick(params.row)}
            >
              <CIcon icon={cilTrash} />
            </CButton>  
          </CTooltip>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: '100%', backgroundColor: 'white' }}>
      <DataGrid
        rows={menuItems?.menus || []}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        loading={loading}
        disableSelectionOnClick
        autoPageSize
        components={{ Toolbar: CustomToolbar }}
        getRowId={(row) => row.id}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e9ecef',
          },
        }}
      />
    </div>
  );
};


export default MenuItemList;