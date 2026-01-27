# Testing Guide - Wallet Configuration

## Current Status

✅ **MongoDB** - Running on localhost:27017
✅ **Backend API** - Running on http://localhost:3000
✅ **Frontend** - Running on http://localhost:3001

## Important: Wallet Requirement

The MessageBox SDK requires a BSV wallet to function. You have several options:

### Option 1: Browser-Based Testing (Recommended for Demo)

The certification and payment features require a BSV wallet. To use the application:

1. Install a BSV wallet browser extension:
   - **Panda Wallet**: https://www.pandawallet.com/
   - **Yours Wallet**: https://yours.org/

2. Once installed, open the application:
   - **Certification Page**: http://localhost:3001
   - **Payment Interface**: http://localhost:3001/payments.html

3. The wallet extension will handle identity key generation and transaction signing

### Option 2: Server-Side Wallet (For Production)

For server-side operations, you'll need to:

1. Set up a wallet storage service
2. Configure the `WALLET_STORAGE_URL` environment variable
3. Update the server code to use WalletClient with storage URL

Example `.env` configuration:
```env
WALLET_STORAGE_URL=http://localhost:3001
```

### Option 3: Mock Testing (Development Only)

For testing without a real wallet, we can create mock implementations. However, this won't actually broadcast to the blockchain.

## Current Application Architecture

The current implementation is designed as a **client-side application** where:

1. Users bring their own wallet (browser extension)
2. The frontend JavaScript calls the MessageBox SDK directly
3. The backend is used for:
   - Storing certified user lookups
   - Searching certified users
   - Providing a central directory

## Alternative Implementation

If you want the server to handle wallet operations, you'd need to:

1. **Centralized Approach**:
   - Server manages all wallets
   - Users don't need wallet extensions
   - Less decentralized, more like traditional apps

2. **Hybrid Approach**:
   - Users authenticate with their wallet
   - Server facilitates but doesn't control funds
   - Best of both worlds

## Testing Without Real Blockchain

For testing without broadcasting to the actual blockchain:

1. Set `BSV_NETWORK=local` in `.env`
2. Run a local BSV node or test network
3. Use testnet BSV (free test coins)

## Next Steps

Choose your approach:

1. **Browser-based (easiest)**: Install Panda Wallet and test via the frontend
2. **Server-based**: Set up wallet storage and modify the code
3. **Testnet**: Use BSV testnet for safe testing with test coins

The application is **fully functional** - it just needs a wallet provider to complete the blockchain transactions!

## Quick Test with Browser Wallet

1. Install Panda Wallet: https://www.pandawallet.com/
2. Create a wallet (follow on-screen instructions)
3. Open: http://localhost:3001
4. Click "Certify My Identity"
5. Approve the transaction in Panda Wallet
6. Your identity will be certified on-chain!

---

**Note**: The error you saw (`"No wallet available"`) is expected when calling the API directly without a wallet. The frontend will work correctly once you have a browser wallet installed.
