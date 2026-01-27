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

async function fetchBeef(txid: string, chain: 'main' | 'test' = 'main'): Promise<any> {
  const baseUrl = `https://api.whatsonchain.com/v1/bsv/${chain}`

  console.log(`Fetching BEEF for transaction ${txid}...`)

  // Fetch BEEF from WhatsOnChain's BEEF endpoint
  const beefResponse = await fetch(`${baseUrl}/tx/${txid}/beef`)

  if (!beefResponse.ok) {
    throw new Error(`Failed to fetch BEEF for transaction ${txid}: ${beefResponse.statusText}`)
  }

  const beefHex = await beefResponse.text()

  if (!beefHex || beefHex.includes('error')) {
    throw new Error(`Failed to fetch BEEF for transaction ${txid}`)
  }

  // Dynamically import Transaction and Utils
  const { Transaction, Utils } = await import('@bsv/sdk')

  // Parse BEEF from hex
  const beef = Transaction.fromBEEF(Utils.toArray(beefHex, 'hex'))

  return beef
}

export async function checkInbox(
  messageBox: string = 'payment_inbox'
): Promise<ReceivedMessage[]> {
  if (typeof window === 'undefined') {
    throw new Error('Message retrieval can only be done in the browser')
  }

  try {
    // Dynamically import MessageBoxClient
    const { MessageBoxClient } = await import('@bsv/message-box-client')

    // Get or create wallet client
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log(`Checking inbox: ${messageBox}`)

    // Create MessageBox client
    const messageBoxClient = new MessageBoxClient({
      walletClient,
      host: messageBoxHost,
      enableLogging: true
    })

    // Initialize the client
    await messageBoxClient.init()

    // List messages from the specified message box
    console.log('Calling listMessages...')
    const messages = await messageBoxClient.listMessages({ messageBox })

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
        // If this is a payment message with transaction ID, internalize it
        if (msg.body && msg.body.txid) {
          console.log('Internalizing payment transaction:', msg.body.txid)

          // Fetch BEEF from WhatsOnChain
          const tx = await fetchBeef(msg.body.txid, 'main')

          // Internalize the transaction with proper payment remittance
          const args = {
            tx: tx.toAtomicBEEF(),
            outputs: [{
              outputIndex: 0,
              protocol: 'wallet payment',
              paymentRemittance: {
                senderIdentityKey: msg.sender,
                derivationPrefix: '',
                derivationSuffix: ''
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
        messageId: msg.messageId || msg.id || 'unknown',
        sender: msg.sender || 'unknown',
        messageBox: msg.messageBox || messageBox,
        body: msg.body || msg,
        timestamp: new Date(msg.timestamp || Date.now())
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
  messageBox: string = 'payment_inbox'
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Message acknowledgment can only be done in the browser')
  }

  try {
    // Dynamically import MessageBoxClient
    const { MessageBoxClient } = await import('@bsv/message-box-client')

    // Get or create wallet client
    const walletClient = await ensureWalletClient()

    // Get MessageBox host from env or default
    const messageBoxHost = process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

    console.log(`Acknowledging message: ${messageId}`)

    // Create MessageBox client
    const messageBoxClient = new MessageBoxClient({
      walletClient,
      host: messageBoxHost,
      enableLogging: true
    })

    // Initialize the client
    await messageBoxClient.init()

    // Acknowledge the message (removes it from server)
    // Note: messageIds expects an array of strings
    await messageBoxClient.acknowledgeMessage({ messageIds: [messageId] })

    console.log('Message acknowledged successfully')
  } catch (error: any) {
    console.error('Failed to acknowledge message:', error)
    throw new Error(`Failed to acknowledge message: ${error.message}`)
  }
}
