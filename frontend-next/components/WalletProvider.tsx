'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { walletManager, WalletStatus } from '@/lib/walletManager'

interface WalletContextType {
  status: WalletStatus
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  checkStatus: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>({
    isConnected: false,
    sessionId: null,
    identityKey: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load session on mount
  useEffect(() => {
    walletManager.loadSession()
    const initialStatus = walletManager.getStatus()
    setStatus(initialStatus)

    // Verify session is still valid
    if (initialStatus.isConnected && initialStatus.sessionId) {
      walletManager.checkStatus().then((isValid) => {
        setStatus(walletManager.getStatus())
      })
    }
  }, [])

  const connect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await walletManager.connect()
      setStatus(walletManager.getStatus())
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await walletManager.disconnect()
      setStatus(walletManager.getStatus())
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async () => {
    const isValid = await walletManager.checkStatus()
    setStatus(walletManager.getStatus())
  }

  return (
    <WalletContext.Provider
      value={{ status, connect, disconnect, checkStatus, isLoading, error }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
