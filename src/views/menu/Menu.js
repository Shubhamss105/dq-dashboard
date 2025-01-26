import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CButton, CSpinner } from '@coreui/react';
import CommonModal from '../../components/CommonModal';
import MenuItemForm from '../../components/MenuItemForm';
import MenuItemList from '../../components/MenuItemList';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { fetchInventories } from '../../redux/slices/stockSlice';
import { 
  addMenuItem, 
  deleteMenuItem, 
  fetchMenuItems, 
  updateMenuItem,
  updateMenuItemStatus 
} from '../../redux/slices/menuSlice';

const Menu = () => {
  const dispatch = useDispatch();
  const { 
    menuItems, 
    loading 
  } = useSelector((state) => state.menuItems);
  
  const { 
    fetchLoading: menuItemsLoading,
    addLoading,
    updateLoading,
    deleteLoading 
  } = loading || {};
  
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { inventories, loading: inventoryLoading } = useSelector((state) => state.inventories);
  const restaurantId = useSelector((state) => state.auth.restaurantId);
  const token = useSelector((state) => state.auth.token);

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  
  const initialFormState = {
    itemName: '',
    itemImage: null,
    price: '',
    categoryId: '',
    restaurantId,
    stockItems: [{ stockId: '', quantity: '' }],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories({ restaurantId, token }));
    dispatch(fetchInventories({ restaurantId }));
    dispatch(fetchMenuItems({ restaurantId }));
  }, [dispatch, restaurantId, token]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, itemImage: file }));
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  // Handle stock changes
  const handleStockChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stockItems: prev.stockItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add a new stock field
  const addStockField = () => {
    setFormData(prev => ({
      ...prev,
      stockItems: [...prev.stockItems, { stockId: '', quantity: '' }]
    }));
  };

  // Reset form and close modals
  const resetForm = () => {
    setFormData(initialFormState);
    setPreviewImage(null);
    setModalVisible(false);
    setEditModalVisible(false);
    setDeleteModalVisible(false);
    setSelectedMenu(null);
  };

  // Handle adding a new menu item
  const handleAddMenuItem = async () => {
    try {
      await dispatch(addMenuItem(formData)).unwrap();
      resetForm();
    } catch (error) {
      console.error('Add menu item failed:', error);
    }
  };

  // Handle editing a menu item
  const handleEditMenuItem = async () => {
    if (!selectedMenu) return;
    try {
      await dispatch(updateMenuItem({
        id: selectedMenu.id,
        formData
      })).unwrap();
      resetForm();
    } catch (error) {
      console.error('Update menu item failed:', error);
    }
  };

  // Handle deleting a menu item
  const handleDeleteMenuItem = async () => {
    if (!selectedMenu) return;
    try {
      await dispatch(deleteMenuItem({ 
        id: selectedMenu.id, 
        restaurantId 
      })).unwrap();
      resetForm();
    } catch (error) {
      console.error('Delete menu item failed:', error);
    }
  };

  // Handle edit modal open
  const handleEditClick = (menuItem) => {
    setSelectedMenu(menuItem);
    setFormData({
      itemName: menuItem.itemName,
      itemImage: null, // Reset image input
      price: menuItem.price,
      categoryId: menuItem.categoryId,
      restaurantId,
      stockItems: menuItem.stockItems || [{ stockId: '', quantity: '' }]
    });
    setEditModalVisible(true);
  };


  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await dispatch(updateMenuItemStatus({ id: itemId, status: newStatus })).unwrap();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ padding: '0 20px' }}>
      <div className="header-section">
        <h2>Menu</h2>
        <CButton 
          color="primary" 
          onClick={() => setModalVisible(true)}
          disabled={addLoading}
        >
          {addLoading ? <CSpinner size="sm" /> : 'Add Menu'}
        </CButton>
      </div>

      <MenuItemList
        menuItems={menuItems}
        loading={menuItemsLoading}
        onEditClick={handleEditClick}
        onStatusChange={handleStatusChange}
        onDeleteClick={(item) => {
          setSelectedMenu(item);
          setDeleteModalVisible(true);
        }}
      />

      {/* Add Menu Modal */}
      <CommonModal
        visible={modalVisible}
        onClose={resetForm}
        title="Add Menu Item"
        onConfirm={handleAddMenuItem}
        confirmButtonText={addLoading ? <CSpinner size="sm" /> : 'Add Menu Item'}
        confirmButtonColor="primary"
        isLoading={addLoading}
      >
        <MenuItemForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          handleStockChange={handleStockChange}
          addStockField={addStockField}
          categories={categories}
          inventories={inventories}
          previewImage={previewImage}
        />
      </CommonModal>

      {/* Edit Menu Modal */}
      <CommonModal
        visible={editModalVisible}
        onClose={resetForm}
        title="Edit Menu Item"
        onConfirm={handleEditMenuItem}
        confirmButtonText={updateLoading ? <CSpinner size="sm" /> : 'Save Changes'}
        confirmButtonColor="primary"
        isLoading={updateLoading}
      >
        <MenuItemForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleImageChange={handleImageChange}
          handleStockChange={handleStockChange}
          addStockField={addStockField}
          categories={categories}
          inventories={inventories}
          previewImage={previewImage}
        />
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <CommonModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Menu Item"
        onConfirm={handleDeleteMenuItem}
        confirmButtonText={deleteLoading ? <CSpinner size="sm" /> : 'Delete'}
        confirmButtonColor="danger"
        isLoading={deleteLoading}
      >
        Are you sure you want to delete this menu item?
      </CommonModal>
    </div>
  );
};

export default Menu;