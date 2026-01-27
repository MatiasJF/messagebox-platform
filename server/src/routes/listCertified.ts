/**
 * List certified users endpoint
 * GET /api/certified-users
 */

import { Router, Request, Response } from 'express'
import { CertificationStorage } from '../storage/CertificationStorage.js'
import { ListCertifiedUsersResponse } from '../types.js'

export function createListCertifiedRouter(storage: CertificationStorage): Router {
  const router = Router()

  router.get('/certified-users', async (req: Request, res: Response) => {
    try {
      const users = await storage.listAllCertifiedUsers()

      const response: ListCertifiedUsersResponse = {
        success: true,
        users: users.map(user => ({
          identityKey: user.identityKey,
          alias: user.alias,
          certificationDate: user.certificationDate.toISOString(),
          host: user.host
        }))
      }

      res.json(response)
    } catch (error: any) {
      console.error('Error listing certified users:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to list certified users',
        users: []
      })
    }
  })

  router.get('/certified-users/search', async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query parameter "q" is required',
          users: []
        })
      }

      const users = await storage.searchByAlias(query)

      const response: ListCertifiedUsersResponse = {
        success: true,
        users: users.map(user => ({
          identityKey: user.identityKey,
          alias: user.alias,
          certificationDate: user.certificationDate.toISOString(),
          host: user.host
        }))
      }

      res.json(response)
    } catch (error: any) {
      console.error('Error searching certified users:', error)
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search certified users',
        users: []
      })
    }
  })

  return router
}
