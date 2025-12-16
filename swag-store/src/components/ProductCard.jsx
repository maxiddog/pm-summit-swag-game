import React, { useState } from 'react';
import './ProductCard.css';

function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeError, setShowSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowSizeError(true);
      return;
    }

    setShowSizeError(false);
    
    try {
      onAddToCart(product, selectedSize);
      // Reset selection after adding
      setSelectedSize('');
    } catch (error) {
      // BUG #2 will be caught here when size "S" is selected
      console.error('Error adding to cart:', error);
      alert(`Oops! An error occurred: ${error.message}\n\nTry using Datadog MCP to investigate this exception!`);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-img"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<span class="product-emoji">📦</span>';
          }}
        />
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">FREE</p>
        
        {!product.inStock && (
          <div className="out-of-stock-badge">
            Out of Stock
          </div>
        )}
      </div>

      {product.inStock && (
        <div className="product-actions">
          <div className="size-selector">
            <label>Select Size:</label>
            <div className="size-options">
              {product.sizes.map(size => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSize(size);
                    setShowSizeError(false);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            {showSizeError && (
              <p className="size-error">Please select a size</p>
            )}
          </div>

          <button 
            className="btn-add-to-cart"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          {/* Debug hint for size "S" bug */}
          {selectedSize === 'S' && (
            <div className="size-warning">
              <small>⚠️ Selecting size "S" may cause issues. This is an intentional bug!</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCard;
