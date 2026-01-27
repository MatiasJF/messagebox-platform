/**
 * Wallet Session Manager
 * Manages persistent wallet connections across requests
 */

import { WalletClient } from '@bsv/sdk'
import crypto from 'crypto'

interface WalletSession {
  sessionId: string
  walletClient: WalletClient | null
  identityKey: string
  createdAt: Date
  lastAccessedAt: Date
}

export class WalletSessionManager {
  private sessions: Map<string, WalletSession> = new Map()
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

  constructor() {
    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000)
  }

  /**
   * Create a new wallet session with identity key from frontend
   */
  async createSessionWithIdentity(identityKey: string): Promise<{ sessionId: string }> {
    try {
      // Generate session ID
      const sessionId = crypto.randomBytes(32).toString('hex')

      // Store session (wallet client will be created when needed)
      const session: WalletSession = {
        sessionId,
        walletClient: null, // Will be created when needed for operations
        identityKey,
        createdAt: new Date(),
        lastAccessedAt: new Date()
      }

      this.sessions.set(sessionId, session)

      console.log(`✓ Wallet session created: ${sessionId} (Identity: ${identityKey.substring(0, 20)}...)`)

      return { sessionId }
    } catch (error: any) {
      console.error('Failed to create wallet session:', error)
      throw new Error(`Failed to create session: ${error.message}`)
    }
  }

  /**
   * Get or create wallet client for session
   */
  private async getOrCreateWalletClient(session: WalletSession): Promise<WalletClient> {
    if (!session.walletClient) {
      // Create new wallet client when needed
      session.walletClient = new WalletClient()
    }
    return session.walletClient
  }

  /**
   * Get wallet client from session (creates if needed)
   */
  async getWalletClient(sessionId: string): Promise<WalletClient | null> {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session has expired
    const now = new Date()
    const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime()

    if (timeSinceLastAccess > this.SESSION_TIMEOUT_MS) {
      console.log(`Session expired: ${sessionId}`)
      this.sessions.delete(sessionId)
      return null
    }

    // Update last accessed time
    session.lastAccessedAt = now

    // Get or create wallet client
    return await this.getOrCreateWalletClient(session)
  }

  /**
   * Get session info
   */
  getSessionInfo(sessionId: string): { identityKey: string; createdAt: Date } | null {
    const session = this.sessions.get(sessionId)

    if (!session) {
      return null
    }

    // Check if session has expired
    const now = new Date()
    const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime()

    if (timeSinceLastAccess > this.SESSION_TIMEOUT_MS) {
      this.sessions.delete(sessionId)
      return null
    }

    return {
      identityKey: session.identityKey,
      createdAt: session.createdAt
    }
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId)
    if (deleted) {
      console.log(`Session deleted: ${sessionId}`)
    }
    return deleted
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date()
    let cleanedCount = 0

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime()

      if (timeSinceLastAccess > this.SESSION_TIMEOUT_MS) {
        this.sessions.delete(sessionId)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired wallet sessions`)
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size
  }
}
