/**
 * Browser-based message retrieval client
 * Handles checking MessageBox inbox for incoming payments/messages
 */

import { ensureWalletClient } from './walletClient'

export interface ReceivedMessage {
  messageId: string
  sender: string
  messageBox: string
  body: any
  timestamp: Date
}

/**
 * Safely parses a message body into a payment token object.
 * PeerPayClient sends the body as JSON.stringify({ transaction, customInstructions, amount })
 */
function parsePaymentToken(body: string | Record<string, any>): Record<string, any> | null {
  try {
    const parsed = typeof body === 'string' ? JSON.parse(body) : body
    if (parsed && parsed.transaction && parsed.customInstructions) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export async function checkInbox(
  messageBox: string = 'payment_inbox'
): Promise<ReceivedMessage[]> {
  if (typeof window === 'undefined') {
    throw new Error('Message retrieval can only be done in the browser')
  }

  try {
    // Dynamically import PeerPayClient (extends MessageBoxClient)
    const { PeerPayClient } = await import('@bsv/message-box-client')

    // Get or create wallet client
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log(`Checking inbox: ${messageBox}`)

    // Create PeerPay client (has listIncomingPayments + acceptPayment built in)
    const peerPayClient = new PeerPayClient({
      walletClient,
      messageBoxHost,
      enableLogging: true
    })

    // Initialize the client
    await peerPayClient.init()

    // List messages from the specified message box
    console.log('Calling listMessages...')
    const messages = await peerPayClient.listMessages({ messageBox })

    console.log('Raw messages response:', messages)

    // Handle case where messages is undefined or not an array
    if (!messages || !Array.isArray(messages)) {
      console.log('No messages or unexpected format, returning empty array')
      return []
    }

    console.log(`Found ${messages.length} message(s) in inbox`)

    // Process and internalize each payment
    const processedMessages = []
    for (const msg of messages) {
      try {
        // Parse the message body as a PeerPay payment token
        // Token structure: { transaction, customInstructions: { derivationPrefix, derivationSuffix }, amount }
        const token = parsePaymentToken(msg.body)

        if (token && token.transaction) {
          console.log('Internalizing payment from:', msg.sender)

          // Internalize using the transaction embedded in the token
          // Output 0 is the payment (sender sets randomizeOutputs: false)
          const args = {
            tx: token.transaction,
            outputs: [{
              outputIndex: token.outputIndex ?? 0,
              protocol: 'wallet payment',
              paymentRemittance: {
                senderIdentityKey: msg.sender,
                derivationPrefix: token.customInstructions.derivationPrefix,
                derivationSuffix: token.customInstructions.derivationSuffix
              }
            }],
            description: `Payment from ${msg.sender.substring(0, 20)}...`,
            labels: ['received_payment']
          }

          await walletClient.internalizeAction(args)
          console.log('Transaction internalized successfully')
        }
      } catch (internError: any) {
        console.error('Failed to internalize transaction:', internError)
        // Continue processing other messages even if one fails
      }

      processedMessages.push({
        messageId: msg.messageId || 'unknown',
        sender: msg.sender || 'unknown',
        messageBox: messageBox,
        body: msg.body || msg,
        timestamp: msg.created_at ? new Date(msg.created_at) : new Date()
      })
    }

    return processedMessages
  } catch (error: any) {
    console.error('Failed to check inbox:', error)
    throw new Error(`Failed to check inbox: ${error.message}`)
  }
}

export async function acknowledgeMessage(
  messageId: string,
  _messageBox: string = 'payment_inbox'
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Message acknowledgment can only be done in the browser')
  }

  try {
    // Dynamically import PeerPayClient (extends MessageBoxClient)
    const { PeerPayClient } = await import('@bsv/message-box-client')

    // Get or create wallet client
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log(`Acknowledging message: ${messageId}`)

    // Create PeerPay client (same as in checkInbox for consistency)
    const peerPayClient = new PeerPayClient({
      walletClient,
      messageBoxHost,
      enableLogging: true
    })

    // Initialize the client
    await peerPayClient.init()

    // Acknowledge the message (removes it from server)
    // Note: messageIds expects an array of strings
    await peerPayClient.acknowledgeMessage({ messageIds: [messageId] })

    console.log('Message acknowledged successfully')
  } catch (error: any) {
    console.error('Failed to acknowledge message:', error)
    throw new Error(`Failed to acknowledge message: ${error.message}`)
  }
}
