/**
 * Certification endpoint
 * POST /api/certify
 */

import { Router, Request, Response } from 'express'
import { MessageBoxClient } from '@bsv/message-box-client'
import { WalletClient } from '@bsv/sdk'
import { CertificationStorage } from '../storage/CertificationStorage.js'
import { WalletSessionManager } from '../wallet/WalletSessionManager.js'
import { CertifyRequest, CertifyResponse } from '../types.js'

export function createCertifyRouter(
  storage: CertificationStorage,
  messageBoxHost: string,
  sessionManager: WalletSessionManager
): Router {
  const router = Router()

  router.post('/certify', async (req: Request, res: Response) => {
    try {
      const { alias } = req.body as CertifyRequest
      const sessionId = req.headers['x-session-id'] as string

      // Get wallet client from session, or create new wallet if no session
      let walletClient: WalletClient
      let identityKey: string

      if (sessionId) {
        // Try to use existing session
        const existingWallet = await sessionManager.getWalletClient(sessionId)
        if (existingWallet) {
          walletClient = existingWallet
          const sessionInfo = sessionManager.getSessionInfo(sessionId)
          identityKey = sessionInfo!.identityKey
          console.log(`Using existing wallet session: ${sessionId}`)
        } else {
          // Session expired or invalid, create new wallet
          walletClient = new WalletClient()
          const pubKey = await walletClient.getPublicKey({ identityKey: true })
          identityKey = pubKey.publicKey
        }
      } else {
        // No session provided, create new wallet
        walletClient = new WalletClient()
        const pubKey = await walletClient.getPublicKey({ identityKey: true })
        identityKey = pubKey.publicKey
      }

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
