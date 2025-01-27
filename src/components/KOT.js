import React from 'react';

const Invoice = React.forwardRef(({
  tableNumber,
  cart,
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
        border: '1px solid #000',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.2',
        margin: '0 auto',
      }}
    >
      <h2 style={{ textAlign: 'center', fontSize: '14px', margin: '0 0 10px 0' }}>Order Details</h2>
      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <p style={{ margin: '2px 0' }}><strong>Table:</strong> {tableNumber}</p>

      <hr style={{ borderTop: '1px solid #000', margin: '5px 0' }} />
      <h4 style={{ fontSize: '12px', margin: '5px 0' }}>Order Details:</h4>
      <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
        {cart.map((item) => (
          <li key={item.id} style={{ margin: '2px 0' }}>
            {item.itemName} x {item.quantity} - ₹{item.price * item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Invoice;