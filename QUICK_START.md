# 🚀 Quick Start Guide

## What's In This Package

A complete, production-ready implementation of the Datadog MCP Swag Store debugging game.

## 📁 Directory Structure

```
datadog-swag-game/
├── IMPLEMENTATION_SUMMARY.md    ⭐ START HERE - Complete overview
├── README.md                     📖 Project documentation
├── docs/
│   ├── ARCHITECTURE.md           🏗️  Technical architecture
│   └── DEPLOYMENT_GUIDE.md       📋 Step-by-step deployment
├── landing-page/
│   ├── index.html                🏠 Main entry point
│   └── instance.html             🔑 Credentials page
├── swag-store/
│   ├── src/
│   │   ├── App.jsx               🐛 Bug #2 here
│   │   └── components/
│   │       ├── Cart.jsx          🐛 Bug #1 here (line 45)
│   │       ├── CheckoutForm.jsx  🐛 Bug #3 here (line 12)
│   │       ├── ProductCard.jsx
│   │       └── TutorialOverlay.jsx
│   └── package.json
├── deployment/
│   ├── server.js                 🔧 API server
│   ├── deploy-instance.sh        🚀 Deployment script
│   └── package.json
└── tutorial/
    └── USER_GUIDE.md             📚 Complete user tutorial
```

## ⚡ Quick Deploy (5 Minutes)

### 1. Install Dependencies
```bash
cd datadog-swag-game/landing-page
npm install

cd ../swag-store  
npm install

cd ../deployment
npm install
```

### 2. Set Environment Variables
```bash
cd deployment
cp .env.example .env
# Edit .env with your values
```

### 3. Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy landing page
cd landing-page
vercel --prod

# Deploy API server
cd ../deployment
vercel --prod
```

### 4. Test Locally First (Recommended)
```bash
# Terminal 1: API Server
cd deployment
npm start

# Terminal 2: Landing Page  
cd landing-page
python3 -m http.server 8000

# Terminal 3: Swag Store (for testing)
cd swag-store
npm run dev
```

Visit `http://localhost:8000` to test!

## 📖 Full Documentation

1. **IMPLEMENTATION_SUMMARY.md** - Read this first for complete overview
2. **docs/DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
3. **docs/ARCHITECTURE.md** - Technical specifications
4. **tutorial/USER_GUIDE.md** - User-facing tutorial
5. **README.md** - Project documentation

## 🐛 The Bugs

All three bugs are clearly marked with comments:

1. **Bug #1:** `swag-store/src/components/Cart.jsx` line 45
   - Commented out onClick handler
   
2. **Bug #2:** `swag-store/src/App.jsx` in addToCart function
   - Exception when size "S" selected
   
3. **Bug #3:** `swag-store/src/components/CheckoutForm.jsx` line 12
   - Broken email validation regex

## 💰 Cost

~$20-25/month for 200 users using Vercel

## 🎯 Key Features

✅ Isolated per-user instances  
✅ Three educational bugs  
✅ Interactive tutorial system  
✅ Datadog MCP integration  
✅ Order collection endpoint  
✅ Admin dashboard  
✅ Automatic cleanup  

## 🆘 Need Help?

- Check IMPLEMENTATION_SUMMARY.md for overview
- Read DEPLOYMENT_GUIDE.md for detailed steps
- Review ARCHITECTURE.md for technical details
- See USER_GUIDE.md for user experience

## 🎉 You're Ready!

Everything you need is in this package. Follow the IMPLEMENTATION_SUMMARY.md for a complete walkthrough.

Good luck with your launch! 🚀
