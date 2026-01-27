'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'

export function WalletStatus() {
  const { status, connect, disconnect, isLoading, error } = useWallet()
  const [localError, setLocalError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLocalError(null)
    try {
      await connect()
    } catch (err: any) {
      setLocalError(err.message || 'Failed to connect wallet')
    }
  }

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {!status.isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-slate-700 flex-1 min-w-[150px]">
              Wallet Disconnected
            </span>
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
          {(localError || error) && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {localError || error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium text-slate-700 flex-1 min-w-[150px]">
            Connected: {status.identityKey?.substring(0, 12)}...
          </span>
          <button
            onClick={disconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
