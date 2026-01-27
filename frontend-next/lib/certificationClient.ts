/**
 * Browser-based certification
 * Handles identity certification in the browser where wallet is available
 */

import { ensureWalletClient } from './walletClient'

export async function certifyIdentity(alias?: string): Promise<{
  identityKey: string
  txid: string
  alias?: string
}> {
  if (typeof window === 'undefined') {
    throw new Error('Certification can only be done in the browser')
  }

  try {
    // Dynamically import MessageBoxClient
    const { MessageBoxClient } = await import('@bsv/message-box-client')

    // Get or create wallet client (will create if session exists but instance doesn't)
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log('Creating MessageBox client...')

    // Create MessageBox client
    const messageBoxClient = new MessageBoxClient({
      walletClient,
      host: messageBoxHost,
      enableLogging: true
    })

    console.log('Initializing MessageBox client...')

    // Initialize the client
    await messageBoxClient.init()

    console.log('Anointing host...')

    // Anoint the host (certify this identity with the MessageBox network)
    const { txid } = await messageBoxClient.anointHost(messageBoxHost)

    console.log('Certification complete! Txid:', txid)

    // Get identity key
    const { publicKey: identityKey } = await walletClient.getPublicKey({ identityKey: true })

    return {
      identityKey,
      txid,
      alias
    }
  } catch (error: any) {
    console.error('Failed to certify identity:', error)
    throw new Error(`Failed to certify identity: ${error.message}`)
  }
}
