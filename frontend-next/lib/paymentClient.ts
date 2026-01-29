/**
 * Browser-based payment client
 * Handles PeerPay payments in the browser where wallet is available
 */

import { ensureWalletClient } from './walletClient'

export async function sendPayment(
  recipient: string,
  amount: number
): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  if (typeof window === 'undefined') {
    throw new Error('Payments can only be sent from the browser')
  }

  try {
    // Dynamically import PeerPayClient
    const { PeerPayClient } = await import('@bsv/message-box-client')

    // Get or create wallet client (will create if session exists but instance doesn't)
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log('Creating PeerPay client...')

    // Create PeerPay client
    const peerPayClient = new PeerPayClient({
      walletClient,
      messageBoxHost,
      enableLogging: true
    })

    console.log(`Sending payment: ${amount} satoshis to ${recipient}`)

    // Step 1: Create the payment token (builds + broadcasts transaction)
    // createPaymentToken uses randomizeOutputs: false, so:
    //   output 0 = payment to recipient
    //   output 1+ = change back to sender
    const paymentToken = await peerPayClient.createPaymentToken({
      recipient,
      amount
    })
    console.log('✓ Payment token created:', paymentToken.transaction)

    // Note: Change outputs are automatically tracked by the wallet when creating the transaction
    // We don't need to manually internalize them. Only the recipient needs to internalize their payment.

    // Step 2: Send the payment token to the recipient via MessageBox
    await peerPayClient.sendMessage({
      recipient,
      messageBox: 'payment_inbox',
      body: JSON.stringify(paymentToken)
    })

    console.log('Payment sent successfully!')

    return {
      success: true,
      messageId: 'Payment sent successfully'
    }
  } catch (error: any) {
    console.error('Failed to send payment:', error)
    throw new Error(`Failed to send payment: ${error.message}`)
  }
}
