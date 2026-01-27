/**
 * Certification endpoint
 * POST /api/certify
 */

import { Router, Request, Response } from 'express'
import { MessageBoxClient } from '@bsv/message-box-client'
import { WalletClient } from '@bsv/sdk'
import { CertificationStorage } from '../storage/CertificationStorage.js'
import { CertifyRequest, CertifyResponse } from '../types.js'

export function createCertifyRouter(
  storage: CertificationStorage,
  messageBoxHost: string
): Router {
  const router = Router()

  router.post('/certify', async (req: Request, res: Response) => {
    try {
      const { alias } = req.body as CertifyRequest

      // Create a new wallet for the user
      // In production, you might want users to bring their own wallet
      const walletClient = new WalletClient()

      // Get the user's identity key
      const identityKey = await walletClient.getPublicKey({
        identityKey: true
      })

      console.log(`Certifying identity: ${identityKey}`)

      // Create MessageBox client
      const messageBoxClient = new MessageBoxClient({
        walletClient,
        host: messageBoxHost,
        enableLogging: true
      })

      // Initialize the client
      await messageBoxClient.init()

      // Anoint the host (certify this identity with the MessageBox network)
      const { txid } = await messageBoxClient.anointHost(messageBoxHost)

      console.log(`Identity certified with txid: ${txid}`)

      // Store the certification in the database
      await storage.storeCertification({
        identityKey,
        alias: alias || undefined,
        certificationDate: new Date(),
        certificationTxid: txid,
        host: messageBoxHost
      })

      const response: CertifyResponse = {
        success: true,
        identityKey,
        txid,
        alias,
        message: 'Identity successfully certified with the MessageBox network'
      }

      res.json(response)
    } catch (error: any) {
      console.error('Error certifying identity:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to certify identity'
      })
    }
  })

  return router
}
