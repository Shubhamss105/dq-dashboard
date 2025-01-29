import React from 'react';

const Invoice = React.forwardRef(({
  tableNumber,
  selectedCustomerName,
  cart,
  calculateSubtotal,
  tax,
  calculateTaxAmount,
  discount,
  calculateDiscountAmount,
  calculateTotal,
}, ref) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div
      id="invoice-section"
      ref={ref} // Forward the ref to this div
      style={{
        display: 'none',
        width: '200px',
        padding: '10px',
        // border: '1px solid #000',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.2',
        margin: '0 auto',
      }}
    >
      <h2 style={{ textAlign: 'center', fontSize: '14px', margin: '0 0 10px 0' }}>BILL</h2>
      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <p style={{ margin: '2px 0' }}><strong>Date:</strong> {currentDate}</p>
      <p style={{ margin: '2px 0' }}><strong>Table:</strong> {tableNumber}</p>
      {selectedCustomerName ? (
        <p style={{ margin: '2px 0' }}><strong>Customer:</strong> {selectedCustomerName}</p>
      ) : (
        <p style={{ margin: '2px 0' }}><strong>Customer ID:</strong> CUST-{Math.floor(1000 + Math.random() * 9000)}</p>
      )}
      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <h4 style={{ fontSize: '12px', margin: '5px 0' }}>Order Details:</h4>
      <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
        {cart.map((item) => (
          <li key={item.id} style={{ margin: '2px 0' }}>
            {item.itemName} x {item.quantity} - ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>
      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <p style={{ margin: '2px 0' }}><strong>Subtotal:</strong> ₹{calculateSubtotal()}</p>
      <p style={{ margin: '2px 0' }}><strong>Tax ({tax}%):</strong> ₹{calculateTaxAmount().toFixed(2)}</p>
      <p style={{ margin: '2px 0' }}><strong>Discount ({discount}%):</strong> ₹{calculateDiscountAmount().toFixed(2)}</p>
      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <h3 style={{ fontSize: '14px', textAlign: 'center', margin: '5px 0' }}>Total: ₹{calculateTotal()}</h3>
    </div>
  );
});

export default Invoice;