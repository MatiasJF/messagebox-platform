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

    console.log('Payment token created, internalizing sender change outputs...')

    // Step 2: Internalize the sender's change outputs so wallet balance updates
    // We internalize all outputs except 0 (which belongs to the recipient)
    try {
      const { Transaction } = await import('@bsv/sdk')
      const tx = Transaction.fromBEEF(paymentToken.transaction)
      const changeOutputs = []

      for (let i = 1; i < tx.outputs.length; i++) {
        changeOutputs.push({
          outputIndex: i,
          protocol: 'wallet payment'
        })
      }

      if (changeOutputs.length > 0) {
        await walletClient.internalizeAction({
          tx: paymentToken.transaction,
          outputs: changeOutputs,
          description: 'Change from PeerPay payment',
          labels: ['peerpay_change']
        })
        console.log(`Internalized ${changeOutputs.length} change output(s)`)
      }
    } catch (changeErr: any) {
      console.warn('Could not internalize change outputs:', changeErr.message)
      // Non-fatal — payment was already broadcast
    }

    // Step 3: Send the payment token to the recipient via MessageBox
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
