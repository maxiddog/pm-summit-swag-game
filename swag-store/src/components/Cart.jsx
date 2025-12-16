import React from 'react';
import './Cart.css';

function Cart({ cart, onRemove, onCheckout, onContinueShopping }) {
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some swag to get started!</p>
        <button className="btn-primary" onClick={onContinueShopping}>
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <div className="view-header">
        <h2>Your Cart</h2>
        <p className="subtitle">{cart.length} item(s) selected</p>
      </div>

      <div className="cart-items">
        {cart.map(item => (
          <div key={item.cartId} className="cart-item">
            <div className="cart-item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p className="cart-item-size">Size: {item.selectedSize}</p>
            </div>
            <button 
              className="btn-remove"
              onClick={() => onRemove(item.cartId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-actions">
        <button className="btn-secondary" onClick={onContinueShopping}>
          Continue Shopping
        </button>
        
        {/* BUG #1: Checkout button is broken! 
            The onClick handler is commented out/missing.
            This is the critical path bug users need to fix first.
            
            TO FIX: Uncomment the line below
        */}
        <button 
          className="btn-primary" 
          // onClick={onCheckout}  // <-- BUG: This line is commented out!
        >
          Proceed to Checkout →
        </button>
      </div>

      <div className="debug-hint">
        <strong>🐛 Bug Alert:</strong> The checkout button doesn't seem to work. 
        Use Datadog MCP to investigate why clicking does nothing!
        <br/><br/>
        <em>Hint: Check for missing event handlers in the browser logs.</em>
      </div>
    </div>
  );
}

export default Cart;
