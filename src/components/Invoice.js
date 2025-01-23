import React from 'react';

const Invoice = ({
  tableNumber,
  selectedCustomerName,
  cart,
  calculateSubtotal,
  tax,
  calculateTaxAmount,
  discount,
  calculateDiscountAmount,
  calculateTotal,
}) => {
  return (
    <div id="invoice-section" style={{ display: 'none', padding: '20px', border: '1px solid #ddd' }}>
      <h2 className="text-center">Invoice</h2>
      <p>Table Number: {tableNumber}</p>
      {selectedCustomerName ? (
        <>
          <p>Customer Name: {selectedCustomerName}</p>
        </>
      ) : (
        <p>Customer ID: CUST-{Math.floor(1000 + Math.random() * 9000)}</p>
      )}
      <hr />
      <h4>Order Details:</h4>
      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.itemName} x {item.quantity} - ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>
      <hr />
      <p>Subtotal: ₹{calculateSubtotal()}</p>
      <p>
        Tax ({tax}%): ₹{calculateTaxAmount().toFixed(2)}
      </p>
      <p>
        Discount ({discount}%): ₹{calculateDiscountAmount().toFixed(2)}
      </p>
      <h3>Total: ₹{calculateTotal()}</h3>
    </div>
  );
};

export default Invoice;