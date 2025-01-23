import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CButton, CSpinner } from '@coreui/react';
import CommonModal from '../../components/CommonModal';
import MenuItemForm from '../../components/MenuItemForm';
import MenuItemList from '../../components/MenuItemList';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { fetchInventories } from '../../redux/slices/stockSlice';
import { addMenuItem, deleteMenuItem, fetchMenuItems, updateMenuItemStatus } from '../../redux/slices/menuSlice';

const Menu = () => {
  const dispatch = useDispatch();
  const { menuItems, loading: menuItemsLoading } = useSelector((state) => state.menuItems);
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { inventories, loading: inventoryLoading } = useSelector((state) => state.inventories);
  const restaurantId = useSelector((state) => state.auth.restaurantId);
  const token = useSelector((state) => state.auth.token);

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    categoryId: '',
    itemImage: null,
    price: '',
    stock: [{ inventoryId: '', quantity: '' }],
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories({ restaurantId, token }));
    dispatch(fetchInventories({ restaurantId }));
    dispatch(fetchMenuItems({ restaurantId }));
  }, [dispatch, restaurantId, token]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      itemImage: file,
    }));
    setPreviewImage(URL.createObjectURL(file));
  };

  // Handle stock changes
  const handleStockChange = (index, field, value) => {
    const updatedStock = [...formData.stock];
    updatedStock[index][field] = value;
    setFormData((prevState) => ({
      ...prevState,
      stock: updatedStock,
    }));
  };

  // Add a new stock field
  const addStockField = () => {
    setFormData((prevState) => ({
      ...prevState,
      stock: [...prevState.stock, { inventoryId: '', quantity: '' }],
    }));
  };

  // Reset form and close modals
  const handleCancel = () => {
    setFormData({
      itemName: '',
      categoryId: '',
      itemImage: null,
      price: '',
      stock: [{ inventoryId: '', quantity: '' }],
    });
    setPreviewImage(null);
    setModalVisible(false);
    setEditModalVisible(false);
  };

  // Handle adding a new menu item
  const handleAddMenuItem = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSubmit = { ...formData, restaurantId };
      await dispatch(addMenuItem(formDataToSubmit)).unwrap();
      handleCancel();
    } catch (error) {
      console.error('Failed to add menu item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a menu item
  const handleEditMenuItem = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSubmit = { ...formData, restaurantId, stock: JSON.stringify(formData.stock) };
      await dispatch(updateMenuItemStatus({ id: selectedMenu.id, formData: formDataToSubmit })).unwrap();
      setEditModalVisible(false);
      handleCancel();
    } catch (error) {
      console.error('Failed to update menu item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a menu item
  const handledeleteMenuItem = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(deleteMenuItem({ id: selectedMenu.id, restaurantId })).unwrap();
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h2>Menu</h2>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Menu
        </CButton>
      </div>
      <MenuItemList
        menuItems={menuItems}
        menuItemsLoading={menuItemsLoading}
        setSelectedMenu={setSelectedMenu}
        setEditModalVisible={setEditModalVisible}
        setDeleteModalVisible={setDeleteModalVisible}
      />
      <CommonModal
        visible={modalVisible}
        onClose={handleCancel}
        title="Add Menu Item"
        onConfirm={handleAddMenuItem}
        confirmButtonText={isSubmitting ? <CSpinner size="sm" /> : 'Add Menu Item'}
        confirmButtonColor="primary"
        isLoading={isSubmitting}
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
      <CommonModal
        visible={editModalVisible}
        onClose={handleCancel}
        title="Edit Menu Item"
        onConfirm={handleEditMenuItem}
        confirmButtonText={isSubmitting ? <CSpinner size="sm" /> : 'Save Changes'}
        confirmButtonColor="primary"
        isLoading={isSubmitting}
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
      <CommonModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Menu Item"
        onConfirm={handledeleteMenuItem}
        confirmButtonText={isSubmitting ? <CSpinner size="sm" /> : 'Delete'}
        confirmButtonColor="danger"
        isLoading={isSubmitting}
      >
        Are you sure you want to delete this menu item?
      </CommonModal>
    </div>
  );
};

export default Menu;