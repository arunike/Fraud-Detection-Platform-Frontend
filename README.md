# ⚛️ Frontend - React + TypeScript Dashboard

A modern, responsive React application providing an intuitive interface for real-time fraud detection and analytics.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Features by Tab](#-features-by-tab)
- [Backend](#-backend)
- [License](#-license)
- [Author](#-author)


## 🌟 Overview

The **Frontend** is a React-based single-page application built with TypeScript that provides a powerful, user-friendly interface for fraud detection analysts and investigators. It features real-time analytics, interactive visualizations, and comprehensive detection workflows.

**Key Capabilities:**

- 🔐 **Secure Authentication**: JWT-based login with automatic token refresh and session management
- 📊 **Dual Dashboard**: Separate Detection and Analytics pages for focused workflows
- 🎨 **Interactive Charts**: Dynamic visualizations with Recharts (trends, distributions, activity)
- 🔄 **Real-time Updates**: Auto-refresh statistics and live detection feeds
- 🎯 **4 Detection Modules**: AML, Credit Risk, Insurance Fraud, Market Manipulation
- 📱 **Responsive Design**: Mobile-friendly interface with adaptive layouts
- 🌈 **Modern UI**: Gradient themes, smooth animations, intuitive navigation
- ⏰ **Timezone Intelligence**: Automatic local timezone conversion for all timestamps

## ✨ Features

- 🔐 JWT Authentication
- 💰 AML Detection Interface
- 📊 Credit Risk Assessment
- 🛡️ Insurance Fraud Detection
- 📈 Market Manipulation Monitoring
- 📱 Responsive Design
- 🎨 Modern UI with Gradient Themes

## 🛠 Tech Stack

### Core Framework

- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript 5** - Type-safe JavaScript for better developer experience
- **Vite 5** - Lightning-fast development server and build tool

### Routing & State

- **React Router v6** - Client-side routing and navigation
- **Custom Hooks** - Reusable state logic (useAuth, useModules)

### HTTP & API

- **Axios** - Promise-based HTTP client
- **JWT Authentication** - Token-based secure authentication
- **Auto-retry Logic** - Automatic token refresh on 401 errors

### UI & Visualization

- **Recharts** - Composable charting library for React
- **Lucide React** - Beautiful, consistent icon set
- **Custom CSS** - Gradient themes, animations, responsive layouts

### Development Tools

- **TypeScript ESLint** - Code linting and quality
- **Vite Plugin React** - Fast Refresh and JSX support
- **React DevTools** - Component debugging

### Build & Deployment

- **Vite Build** - Optimized production bundles
- **Code Splitting** - Lazy loading for better performance
- **Asset Optimization** - Minification and compression

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## API Integration

The frontend connects to the Django REST API at `http://localhost:8000/api/`.

All API calls require JWT authentication except for the login endpoint.

### Authentication Flow

1. User logs in at `/login`
2. JWT tokens stored in localStorage
3. Token automatically attached to subsequent API requests
4. Token refresh handled automatically

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Login.jsx            # Login page
│   │   └── tabs/
│   │       ├── AMLTab.jsx       # AML detection tab
│   │       ├── CreditTab.jsx    # Credit risk tab
│   │       ├── InsuranceTab.jsx # Insurance fraud tab
│   │       └── MarketTab.jsx    # Market manipulation tab
│   ├── api.js                   # API client & endpoints
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## 🎯 Features by Tab

### AML Detection
- Submit transaction details
- Real-time risk scoring
- Alert generation
- Transaction history

### Credit Risk
- Applicant information form
- Credit score calculation (300-850)
- Risk tier classification
- Decision recommendations

### Insurance Fraud
- Claim submission
- Fraud probability analysis
- Alert flagging
- Claims history

### Market Manipulation
- Trading activity monitoring
- Pattern detection
- Severity classification
- Market alerts

## 🔗 Backend

- **Backend**: [WorkOps Backend](https://github.com/arunike/Fraud-Detection-Platform-Backend)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.txt) file for details.

## 👤 Author

**Richie Zhou**

- GitHub: [@arunike](https://github.com/arunike)
