/**
 * Store certification endpoint (from frontend)
 * POST /api/store-certification
 */

import { Router, Request, Response } from 'express'
import { CertificationStorage } from '../storage/CertificationStorage.js'

export function createStoreCertificationRouter(storage: CertificationStorage): Router {
  const router = Router()

  router.post('/store-certification', async (req: Request, res: Response) => {
    try {
      const { identityKey, alias, txid } = req.body

      if (!identityKey || !txid) {
        return res.status(400).json({
          success: false,
          error: 'identityKey and txid are required'
        })
      }

      const host = process.env.MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'

      await storage.storeCertification({
        identityKey,
        alias: alias || undefined,
        certificationDate: new Date(),
        certificationTxid: txid,
        host
      })

      res.json({
        success: true,
        message: 'Certification stored successfully'
      })
    } catch (error: any) {
      console.error('Error storing certification:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to store certification'
      })
    }
  })

  return router
}
