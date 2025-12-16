import React, { useState } from 'react';
import './CheckoutForm.css';

// BUG #3: Email validation regex is broken
// This regex will reject valid emails
const validateEmail = (email) => {
  // BROKEN: Missing the @ symbol in regex pattern!
  // This will cause valid emails to be rejected
  const regex = /^[^\s]+[^\s.]+\.[^\s@]+$/; // <-- BUG: Should be /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email);
};

function CheckoutForm({ cart, onComplete, onBack }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation (using buggy function)
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Other validations
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.street) newErrors.street = 'Street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to submit order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-view">
      <div className="view-header">
        <h2>Checkout</h2>
        <p className="subtitle">Complete your order</p>
      </div>

      <div className="checkout-container">
        <div className="checkout-form-section">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="you@example.com"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="John Doe"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Shipping Address</h3>
              
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className={errors.street ? 'error' : ''}
                  placeholder="123 Main St"
                />
                {errors.street && <span className="error-message">{errors.street}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? 'error' : ''}
                    placeholder="San Francisco"
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? 'error' : ''}
                    placeholder="CA"
                    maxLength="2"
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="zip">ZIP Code *</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className={errors.zip ? 'error' : ''}
                    placeholder="94105"
                    maxLength="10"
                  />
                  {errors.zip && <span className="error-message">{errors.zip}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="USA"
                  disabled
                />
              </div>
            </div>

            <div className="debug-hint">
              <strong>🐛 Bug Alert:</strong> Email validation seems broken. 
              Even valid emails are being rejected!
              <br/><br/>
              <em>Hint: Check the validateEmail function for regex issues.</em>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={onBack}
                disabled={isSubmitting}
              >
                ← Back to Cart
              </button>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Order'}
              </button>
            </div>
          </form>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.cartId} className="summary-item">
                <div className="summary-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="summary-item-details">
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-size">Size: {item.selectedSize}</span>
                </div>
                <span className="summary-item-price">FREE</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span className="total-amount">FREE</span>
          </div>
          <p className="shipping-note">
            🚚 Free shipping worldwide!
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;
