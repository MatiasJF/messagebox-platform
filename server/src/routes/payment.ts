/**
 * Payment initiation endpoint
 * POST /api/initiate-payment
 */

import { Router, Request, Response } from 'express'
import { PeerPayClient } from '@bsv/message-box-client'
import { WalletClient } from '@bsv/sdk'
import { CertificationStorage } from '../storage/CertificationStorage.js'
import { InitiatePaymentRequest, InitiatePaymentResponse } from '../types.js'

export function createPaymentRouter(
  storage: CertificationStorage,
  messageBoxHost: string
): Router {
  const router = Router()

  router.post('/initiate-payment', async (req: Request, res: Response) => {
    try {
      const { recipient, amount } = req.body as InitiatePaymentRequest

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

      // Create a wallet for the sender
      // In production, this would be the authenticated user's wallet
      const walletClient = new WalletClient()

      // Create PeerPay client
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
