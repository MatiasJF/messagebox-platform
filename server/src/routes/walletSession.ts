/**
 * Wallet session management endpoints
 * POST /api/wallet/connect - Connect wallet and create session
 * GET /api/wallet/status - Check wallet session status
 * POST /api/wallet/disconnect - Disconnect wallet and destroy session
 */

import { Router, Request, Response } from 'express'
import { WalletSessionManager } from '../wallet/WalletSessionManager.js'

export function createWalletSessionRouter(sessionManager: WalletSessionManager): Router {
  const router = Router()

  /**
   * Connect wallet and create session
   * POST /api/wallet/connect
   * Expects identityKey from frontend
   */
  router.post('/wallet/connect', async (req: Request, res: Response) => {
    try {
      const { identityKey } = req.body

      if (!identityKey) {
        return res.status(400).json({
          success: false,
          error: 'Identity key is required'
        })
      }

      const { sessionId } = await sessionManager.createSessionWithIdentity(identityKey)

      res.json({
        success: true,
        sessionId,
        identityKey,
        message: 'Wallet connected successfully'
      })
    } catch (error: any) {
      console.error('Error connecting wallet:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to connect wallet'
      })
    }
  })

  /**
   * Check wallet session status
   * GET /api/wallet/status
   */
  router.get('/wallet/status', (req: Request, res: Response) => {
    const sessionId = req.headers['x-session-id'] as string

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        connected: false,
        error: 'No session ID provided'
      })
    }

    const sessionInfo = sessionManager.getSessionInfo(sessionId)

    if (!sessionInfo) {
      return res.json({
        success: true,
        connected: false,
        message: 'No active session'
      })
    }

    res.json({
      success: true,
      connected: true,
      identityKey: sessionInfo.identityKey,
      connectedAt: sessionInfo.createdAt
    })
  })

  /**
   * Disconnect wallet and destroy session
   * POST /api/wallet/disconnect
   */
  router.post('/wallet/disconnect', (req: Request, res: Response) => {
    const sessionId = req.headers['x-session-id'] as string

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'No session ID provided'
      })
    }

    const deleted = sessionManager.deleteSession(sessionId)

    res.json({
      success: true,
      disconnected: deleted,
      message: deleted ? 'Wallet disconnected successfully' : 'Session not found'
    })
  })

  return router
}
