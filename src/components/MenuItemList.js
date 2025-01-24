import React, { useState } from 'react'
import { CButton, CFormSwitch } from '@coreui/react'
import { useDispatch } from 'react-redux'
import { cilPencil, cilTrash } from '@coreui/icons'
import { DataGrid } from '@mui/x-data-grid'
import CustomToolbar from '../utils/CustomToolbar'
import CIcon from '@coreui/icons-react'
import { updateMenuItemStatus } from '../redux/slices/menuSlice'

const MenuItemList = ({ menuItems, menuItemsLoading, setSelectedMenu, setEditModalVisible, setDeleteModalVisible }) => {

    const dispatch = useDispatch()

    const columns = [
        {
            field: 'itemImage',
            headerName: 'Image',
            flex: 1,
            renderCell: (params) => (
                <img src={params.value} alt={params.row.itemName} style={{ maxWidth: '100px' }} />
            ),
        },
        {
            field: 'itemName',
            headerName: 'Item Name',
            flex: 1,
        },
        { field: 'price', headerName: 'Price', flex: 1 },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: (params) => {
                const handleToggle = async () => {
                    const newStatus = params.row.status === 1 ? 0 : 1
                    await dispatch(updateMenuItemStatus({ id: params.row.id, status: newStatus }))
                }

                return (
                    <CFormSwitch
                        className="mx-1"
                        color="primary"
                        shape="rounded-pill"
                        checked={params.row.status === 1}
                        onChange={handleToggle}
                    />
                )
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            renderCell: (params) => (
                <div>
                    <CButton
                        color="info"
                        size="sm"
                        onClick={() => {
                            setSelectedMenu(params.row)
                            setEditModalVisible(true)
                        }}
                    >
                        <CIcon icon={cilPencil} />
                    </CButton>
                    <CButton
                        color="danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                            setSelectedMenu(params.row)
                            setDeleteModalVisible(true)
                        }}
                    >
                        <CIcon icon={cilTrash} />
                    </CButton>
                </div>
            ),
        },
    ]

    return (
        <div style={{ height: 'auto', width: '100%', backgroundColor: 'white' }}>
            <DataGrid
                rows={menuItems?.menus || []}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5, 10, 20]}
                loading={menuItemsLoading}
                autoHeight
                slots={{ Toolbar: CustomToolbar }}
            />
        </div>
    )
}

export default MenuItemList