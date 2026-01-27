# MessageBox Certifier Frontend (Next.js)

Modern Next.js frontend with React, TypeScript, and Tailwind CSS for the MessageBox Certifier Platform.

## Features

- ✅ **Persistent Wallet Connection** - Survives page reloads and navigation using localStorage
- ✅ **React Context** - Wallet state management with React Context API
- ✅ **Tailwind CSS** - Modern, responsive UI with utility-first CSS
- ✅ **TypeScript** - Full type safety across the application
- ✅ **Session Management** - Reuses wallet connection for 30 minutes without repeated approvals
- ✅ **Real-time Status** - Visual connection indicator with auto-reconnection

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The frontend will be available at **http://localhost:3001**

## Pages

### Certification Page (`/`)
- Certify your identity on the BSV blockchain
- Optional display name for discoverability
- View certification results with transaction ID

### Payments Page (`/payments`)
- Browse certified users
- Search by display name
- Send BSV payments to certified identities
- Real-time payment status

## Architecture

### Wallet Management
- **`lib/walletManager.ts`** - Singleton wallet manager with session persistence
- **`components/WalletProvider.tsx`** - React Context provider for wallet state
- **`components/WalletStatus.tsx`** - Visual connection status component

### State Management
- Uses React Context API for global wallet state
- localStorage for session persistence
- Automatic session validation on app load

### API Integration
- Connects to backend at `http://localhost:3000`
- Includes session ID in all authenticated requests via `X-Session-Id` header
- Graceful handling of expired sessions

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Running Server + Frontend Together

From the root `messagebox-platform` directory:

### Terminal 1 (Server):
```bash
npm run dev:server
```

### Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

Or install dependencies for both at once:
```bash
npm run install:all
```

## Tech Stack

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **BSV SDK** - Bitcoin SV blockchain integration (via backend)

## Folder Structure

```
frontend-next/
├── app/
│   ├── layout.tsx        # Root layout with WalletProvider
│   ├── page.tsx          # Certification page
│   ├── payments/
│   │   └── page.tsx      # Payments page
│   └── globals.css       # Global styles + Tailwind
├── components/
│   ├── WalletProvider.tsx   # Wallet context provider
│   ├── WalletStatus.tsx     # Connection status UI
│   └── Navigation.tsx       # Header navigation
└── lib/
    └── walletManager.ts     # Wallet session management
```

## How Wallet Persistence Works

1. **First Connection**: User clicks "Connect Wallet", wallet app prompts for approval
2. **Session Created**: Backend creates session, frontend saves session ID to localStorage
3. **Page Reload**: Frontend loads session ID from localStorage, validates with backend
4. **API Requests**: All requests include session ID header to reuse wallet connection
5. **Expiration**: After 30 minutes of inactivity, session expires and user must reconnect

This means users can:
- ✅ Refresh the page without losing connection
- ✅ Navigate between pages while staying connected
- ✅ Send multiple payments without repeated wallet approvals
- ✅ Close and reopen browser within 30 minutes and still be connected
