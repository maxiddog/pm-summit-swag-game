import React, { useState, useEffect } from 'react';
import './TutorialOverlay.css';

const TUTORIAL_STEPS = {
  products: {
    title: '🎯 Welcome to the Debugging Challenge!',
    content: `
      <h3>Your Mission</h3>
      <p>This swag store has <strong>3 intentional bugs</strong> that you need to fix using the Datadog MCP server before you can complete your order.</p>
      
      <h3>The Bugs</h3>
      <ul>
        <li>🐛 <strong>Bug #1:</strong> Checkout button doesn't work</li>
        <li>🐛 <strong>Bug #2:</strong> Selecting size "S" causes a crash</li>
        <li>🐛 <strong>Bug #3:</strong> Email validation is broken</li>
      </ul>

      <h3>How to Debug</h3>
      <p>Use your AI assistant (Cursor or Claude Code) with the Datadog MCP server to:</p>
      <ol>
        <li>Query Datadog logs for errors</li>
        <li>Identify the root cause</li>
        <li>Fix the code</li>
        <li>Redeploy and test</li>
      </ol>

      <div class="tip-box">
        <strong>💡 Tip:</strong> Start by adding items to your cart and trying to checkout. 
        The first bug will reveal itself immediately!
      </div>
    `,
    nextButton: 'Start Shopping'
  },
  cart: {
    title: '🐛 Bug #1: The Checkout Button Mystery',
    content: `
      <h3>You've Found Bug #1!</h3>
      <p>Try clicking the "Proceed to Checkout" button... nothing happens!</p>
      
      <h3>Debug with MCP</h3>
      <p>Open your AI assistant and try these prompts:</p>
      
      <div class="code-prompt">
        <strong>1. Check for button click events:</strong>
        <code>"Use Datadog MCP to show recent user interactions in the cart view"</code>
      </div>

      <div class="code-prompt">
        <strong>2. Look for JavaScript errors:</strong>
        <code>"Check Datadog for any JavaScript errors or missing event handlers"</code>
      </div>

      <div class="code-prompt">
        <strong>3. Once you find it:</strong>
        <code>"I found a button with no onClick handler in Cart.jsx. Please fix it."</code>
      </div>

      <div class="tip-box">
        <strong>💡 Hint:</strong> The issue is in <code>src/components/Cart.jsx</code>. 
        Look for a commented-out line around the checkout button!
      </div>
    `,
    nextButton: 'Got It'
  }
};

function TutorialOverlay({ onClose, currentView }) {
  const [currentStep, setCurrentStep] = useState(currentView);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Update tutorial content when view changes
    if (TUTORIAL_STEPS[currentView] && currentView !== currentStep) {
      setCurrentStep(currentView);
      setIsMinimized(false);
    }
  }, [currentView]);

  const handleClose = () => {
    onClose();
  };

  const tutorial = TUTORIAL_STEPS[currentStep];
  
  if (!tutorial) return null;

  if (isMinimized) {
    return (
      <div className="tutorial-minimized" onClick={() => setIsMinimized(false)}>
        📚 Tutorial
      </div>
    );
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        <div className="tutorial-header">
          <h2>{tutorial.title}</h2>
          <div className="tutorial-controls">
            <button 
              className="tutorial-minimize"
              onClick={() => setIsMinimized(true)}
              title="Minimize"
            >
              –
            </button>
            <button 
              className="tutorial-close"
              onClick={handleClose}
              title="Close tutorial"
            >
              ×
            </button>
          </div>
        </div>
        
        <div 
          className="tutorial-body"
          dangerouslySetInnerHTML={{ __html: tutorial.content }}
        />

        <div className="tutorial-footer">
          <button 
            className="btn-tutorial-next"
            onClick={() => setIsMinimized(true)}
          >
            {tutorial.nextButton}
          </button>
          <button 
            className="btn-tutorial-skip"
            onClick={handleClose}
          >
            Skip Tutorial
          </button>
        </div>

        <div className="tutorial-progress">
          Step {currentStep === 'products' ? '1' : '2'} of 3
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;
