/**
 * Browser-based WalletClient wrapper
 * Handles BSV wallet connection in the browser
 * IMPORTANT: This must only run in the browser, not during SSR
 */

let walletClientInstance: any = null
let identityKey: string | null = null

export async function connectWallet(): Promise<{ identityKey: string }> {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    throw new Error('WalletClient can only be used in the browser')
  }

  try {
    // Dynamically import WalletClient only in browser
    const { WalletClient } = await import('@bsv/sdk')

    // Create wallet client in browser
    if (!walletClientInstance) {
      walletClientInstance = new WalletClient()
    }

    // Get identity key from wallet (this prompts the user's wallet)
    const result = await walletClientInstance.getPublicKey({ identityKey: true })
    identityKey = result.publicKey

    console.log('✓ Wallet connected:', identityKey.substring(0, 20) + '...')

    return { identityKey }
  } catch (error: any) {
    console.error('Failed to connect wallet:', error)
    throw new Error(`Failed to connect to wallet: ${error.message}`)
  }
}

export async function ensureWalletClient(): Promise<any> {
  // Ensure we're in the browser
  if (typeof window === 'undefined') {
    throw new Error('WalletClient can only be used in the browser')
  }

  // If wallet client already exists, return it
  if (walletClientInstance) {
    return walletClientInstance
  }

  // Create new wallet client instance
  const { WalletClient } = await import('@bsv/sdk')
  walletClientInstance = new WalletClient()

  return walletClientInstance
}

export function getWalletClient(): any {
  return walletClientInstance
}

export function getIdentityKey(): string | null {
  return identityKey
}

export function clearWallet(): void {
  walletClientInstance = null
  identityKey = null
}
