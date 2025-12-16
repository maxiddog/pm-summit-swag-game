import { useState, useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';
import './App.css';
import TutorialOverlay from './components/TutorialOverlay';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import CheckoutForm from './components/CheckoutForm';

// Initialize Datadog RUM
const instanceId = window.location.hostname.split('.')[0] || 'local';
datadogRum.init({
  applicationId: import.meta.env.VITE_DD_APP_ID || 'demo-app',
  clientToken: import.meta.env.VITE_DD_CLIENT_TOKEN || 'demo-token',
  site: 'datadoghq.com',
  service: `pm-summit-store-${instanceId}`,
  env: 'game',
  version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'allow'
});

// Sample products - PM Summit 2026 swag
const PRODUCTS = [
  {
    id: 'hoodie-001',
    name: 'PM Summit Purple Hoodie',
    description: 'Premium cotton blend hoodie - exclusive PM Summit 2026 edition',
    price: 0,
    image: '/images/hoodie.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'jacket-001',
    name: 'PM Summit Worker Jacket',
    description: 'Classic French workwear style - PM Summit 2026 exclusive',
    price: 0,
    image: '/images/jacket.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    inStock: true
  },
  {
    id: 'cap-001',
    name: 'PM Summit Dad Cap',
    description: 'Embroidered cotton cap - PM Summit 2026 collection',
    price: 0,
    image: '/images/cap.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'beanie-001',
    name: 'PM Summit Knit Beanie',
    description: 'Cozy ribbed beanie for cold conference rooms',
    price: 0,
    image: '/images/beanie.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'socks-001',
    name: 'PM Summit Cozy Socks',
    description: 'Ultra-soft fuzzy socks - PM Summit 2026 exclusive',
    price: 0,
    image: '/images/socks.jpg',
    sizes: ['S/M', 'L/XL'],
    inStock: true
  },
  {
    id: 'keychain-001',
    name: 'PM Summit Keychain',
    description: 'Premium metal keychain - PM Summit 2026 memento',
    price: 0,
    image: '/images/keychain.jpg',
    sizes: ['One Size'],
    inStock: false // Intentionally out of stock for demo
  }
];

function App() {
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('products'); // products, cart, checkout
  const [showTutorial, setShowTutorial] = useState(true);
  const [bugsFixed, setBugsFixed] = useState({
    checkoutButton: false,
    sizeSelection: false,
    inventory: false
  });

  useEffect(() => {
    // Log page view
    datadogRum.addAction('page_view', { view: 'products' });
  }, []);

  const addToCart = (product, size) => {
    // BUG #2: Exception when selecting size "S" (Small)
    // This bug causes an uncaught exception that will appear in Datadog
    if (size === 'S') {
      // Intentional bug: trying to access undefined property
      const undefinedVar = undefined;
      console.log(undefinedVar.property); // This will throw
    }

    const cartItem = {
      ...product,
      selectedSize: size,
      cartId: Date.now()
    };

    setCart([...cart, cartItem]);
    datadogRum.addAction('add_to_cart', {
      productId: product.id,
      productName: product.name,
      size: size
    });
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
    datadogRum.addAction('remove_from_cart', { cartId });
  };

  // BUG #1: Checkout button doesn't work
  // The onClick handler is missing/broken
  const goToCheckout = () => {
    // This function exists but is never called due to bug in Cart component
    setView('checkout');
    datadogRum.addAction('checkout_started', { itemCount: cart.length });
  };

  const goToCart = () => {
    setView('cart');
    datadogRum.addAction('view_cart', { itemCount: cart.length });
  };

  const continueShopping = () => {
    setView('products');
    datadogRum.addAction('continue_shopping', {});
  };

  const handleCheckoutComplete = async (shippingInfo) => {
    // Submit order to central admin endpoint
    // This endpoint is on the landing page server and collects all orders
    try {
      // Parse full name into first/last name
      const nameParts = shippingInfo.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const orderData = {
        instanceId,
        email: shippingInfo.email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          selectedSize: item.selectedSize,
          quantity: 1
        })),
        shippingAddress: {
          firstName,
          lastName,
          address: shippingInfo.street,
          apartment: '',
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zip,
          country: shippingInfo.country
        },
        bugsFixed: Object.keys(bugsFixed).filter(key => bugsFixed[key]),
        event: 'PM Summit 2026'
      };

      // Central order collection endpoint - hardcoded and non-manipulatable
      // All orders from all user instances are sent here
      const ORDERS_ENDPOINT = 'https://pm-summit-swag.vercel.app/api/orders';
      
      const response = await fetch(ORDERS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Instance-ID': instanceId
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        datadogRum.addAction('order_complete', { 
          orderId: result.orderId,
          orderTotal: cart.length,
          bugsFixed: bugsFixed 
        });
        
        // Show success message
        setView('success');
      } else {
        throw new Error(result.error || 'Order submission failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      datadogRum.addError(error);
      alert('There was an error submitting your order. Please try again.');
    }
  };

  return (
    <div className="app">
      {showTutorial && (
        <TutorialOverlay 
          onClose={() => setShowTutorial(false)}
          currentView={view}
        />
      )}

      <div className="top-banner">
        <span>PM Summit 2026 • Debug your way to free swag with Datadog MCP</span>
        <button className="banner-btn" onClick={() => setShowTutorial(true)}>
          View Tutorial
        </button>
      </div>

      <header className="header">
        <div className="header-content">
          <a href="/" className="logo">
            <span className="logo-text">PM Summit</span>
          </a>
          <div className="header-actions">
            <button 
              className="cart-button"
              onClick={goToCart}
            >
              Cart ({cart.length})
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'products' && (
          <div className="products-view">
            <div className="view-header">
              <h2>PM Summit <span className="highlight">2026</span></h2>
              <p className="subtitle">
                Debug the store, claim your swag. Use Datadog's MCP tools to find 
                and fix bugs, then complete your order for exclusive PM Summit merchandise.
              </p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={goToCart}>
                  Start Shopping
                </button>
                <button className="btn-secondary" onClick={() => setShowTutorial(true)}>
                  How It Works
                </button>
              </div>
            </div>
            
            <div className="products-grid">
              {PRODUCTS.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'cart' && (
          <Cart
            cart={cart}
            onRemove={removeFromCart}
            onCheckout={goToCheckout}
            onContinueShopping={continueShopping}
          />
        )}

        {view === 'checkout' && (
          <CheckoutForm
            cart={cart}
            onComplete={handleCheckoutComplete}
            onBack={() => setView('cart')}
          />
        )}

        {view === 'success' && (
          <div className="success-view">
            <div className="success-card">
              <div className="success-icon">✓</div>
              <h2>Order Submitted!</h2>
              <p>
                Congratulations! You've successfully debugged the PM Summit swag store and 
                placed your order. We'll ship your exclusive PM Summit 2026 items soon!
              </p>
              <p className="bugs-fixed">
                <strong>Bugs Fixed:</strong>
                <ul>
                  {Object.entries(bugsFixed).map(([bug, fixed]) => (
                    <li key={bug}>
                      {fixed ? '✓' : '✗'} {bug.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </li>
                  ))}
                </ul>
              </p>
              <button 
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Start New Challenge
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>PM Summit 2026 Debugging Challenge | Powered by Datadog MCP</p>
      </footer>
    </div>
  );
}

export default App;
