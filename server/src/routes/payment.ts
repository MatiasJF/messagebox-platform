/**
 * Payment initiation endpoint
 * POST /api/initiate-payment
 */

import { Router, Request, Response } from 'express'
import { PeerPayClient } from '@bsv/message-box-client'
import { WalletClient } from '@bsv/sdk'
import { CertificationStorage } from '../storage/CertificationStorage.js'
import { WalletSessionManager } from '../wallet/WalletSessionManager.js'
import { InitiatePaymentRequest, InitiatePaymentResponse } from '../types.js'

export function createPaymentRouter(
  storage: CertificationStorage,
  messageBoxHost: string,
  sessionManager: WalletSessionManager
): Router {
  const router = Router()

  router.post('/initiate-payment', async (req: Request, res: Response) => {
    try {
      const { recipient, amount } = req.body as InitiatePaymentRequest
      const sessionId = req.headers['x-session-id'] as string

      // Validate session
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          error: 'No wallet session. Please connect your wallet first.'
        })
      }

      // Get wallet client from session
      const walletClient = await sessionManager.getWalletClient(sessionId)
      if (!walletClient) {
        return res.status(401).json({
          success: false,
          error: 'Wallet session expired or invalid. Please reconnect your wallet.'
        })
      }

      // Validate input
      if (!recipient || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Recipient and amount are required'
        })
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Amount must be greater than 0'
        })
      }

      // Verify the recipient is certified
      const certifiedUser = await storage.getCertifiedUser(recipient)
      if (!certifiedUser) {
        return res.status(404).json({
          success: false,
          error: 'Recipient is not a certified user'
        })
      }

      console.log(`Initiating payment: ${amount} satoshis to ${recipient}`)

      // Create PeerPay client with existing wallet session
      const peerPayClient = new PeerPayClient({
        walletClient,
        messageBoxHost,
        enableLogging: true
      })

      // Send the payment
      // Note: This uses HTTP. For real-time, use sendLivePayment
      await peerPayClient.sendPayment({
        recipient,
        amount
      })

      const response: InitiatePaymentResponse = {
        success: true,
        messageId: 'Payment sent successfully'
      }

      res.json(response)
    } catch (error: any) {
      console.error('Error initiating payment:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to initiate payment'
      })
    }
  })

  return router
}
