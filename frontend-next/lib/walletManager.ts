/**
 * Wallet Manager for MessageBox Certifier Platform
 * Handles wallet connection and session management
 */

import { connectWallet, clearWallet } from './walletClient'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface WalletStatus {
  isConnected: boolean
  sessionId: string | null
  identityKey: string | null
}

class WalletManager {
  private sessionId: string | null = null
  private identityKey: string | null = null
  private isConnected: boolean = false

  /**
   * Load session from localStorage
   */
  loadSession(): void {
    if (typeof window === 'undefined') return

    const storedSessionId = localStorage.getItem('wallet_session_id')
    const storedIdentityKey = localStorage.getItem('wallet_identity_key')

    if (storedSessionId && storedIdentityKey) {
      this.sessionId = storedSessionId
      this.identityKey = storedIdentityKey
      this.isConnected = true
      console.log('✓ Loaded wallet session from storage')
    }
  }

  /**
   * Save session to localStorage
   */
  private saveSession(): void {
    if (typeof window === 'undefined') return

    if (this.sessionId && this.identityKey) {
      localStorage.setItem('wallet_session_id', this.sessionId)
      localStorage.setItem('wallet_identity_key', this.identityKey)
      console.log('✓ Saved wallet session to storage')
    }
  }

  /**
   * Clear session from localStorage
   */
  private clearSession(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem('wallet_session_id')
    localStorage.removeItem('wallet_identity_key')
    this.sessionId = null
    this.identityKey = null
    this.isConnected = false
    clearWallet()
    console.log('✓ Cleared wallet session from storage')
  }

  /**
   * Connect wallet (browser-based connection)
   */
  async connect(): Promise<{ success: boolean; identityKey: string }> {
    try {
      // Step 1: Connect to wallet in browser (prompts user's wallet)
      console.log('Connecting to wallet...')
      const { identityKey } = await connectWallet()

      // Step 2: Register session with backend
      console.log('Registering session with backend...')
      const response = await fetch(`${API_BASE_URL}/api/wallet/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identityKey }),
      })

      const data = await response.json()

      if (data.success) {
        this.sessionId = data.sessionId
        this.identityKey = identityKey
        this.isConnected = true
        this.saveSession()

        console.log('✓ Wallet connected and session registered')
        return { success: true, identityKey }
      } else {
        throw new Error(data.error || 'Failed to register session')
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      this.clearSession()
      throw error
    }
  }

  /**
   * Check wallet connection status (verifies session is still valid)
   */
  async checkStatus(): Promise<boolean> {
    if (!this.sessionId) {
      this.isConnected = false
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wallet/status`, {
        method: 'GET',
        headers: {
          'X-Session-Id': this.sessionId,
        },
      })

      const data = await response.json()

      if (data.success && data.connected) {
        this.isConnected = true
        this.identityKey = data.identityKey
        return true
      } else {
        this.clearSession()
        return false
      }
    } catch (error) {
      console.error('Failed to check wallet status:', error)
      this.clearSession()
      return false
    }
  }

  /**
   * Disconnect wallet (destroys session)
   */
  async disconnect(): Promise<{ success: boolean }> {
    if (!this.sessionId) {
      this.clearSession()
      return { success: true }
    }

    try {
      await fetch(`${API_BASE_URL}/api/wallet/disconnect`, {
        method: 'POST',
        headers: {
          'X-Session-Id': this.sessionId,
        },
      })

      this.clearSession()
      console.log('✓ Wallet disconnected')
      return { success: true }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      this.clearSession()
      return { success: false }
    }
  }

  /**
   * Make an authenticated API request with session ID
   */
  async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    // Add session ID if connected
    if (this.sessionId) {
      (headers as Record<string, string>)['X-Session-Id'] = this.sessionId
    }

    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    // Handle expired session
    if (response.status === 401 && data.error && data.error.includes('session')) {
      console.warn('Session expired, clearing local session')
      this.clearSession()
      throw new Error('Wallet session expired. Please reconnect.')
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }

  /**
   * Get connection status
   */
  getStatus(): WalletStatus {
    return {
      isConnected: this.isConnected,
      sessionId: this.sessionId,
      identityKey: this.identityKey,
    }
  }
}

export const walletManager = new WalletManager()
