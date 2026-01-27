'use client'

import { useState } from 'react'
import { useWallet } from './WalletProvider'
import { Wallet, Power, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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
    <div className="flex flex-col items-center mb-8 max-w-4xl mx-auto">
      {!status.isConnected ? (
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg gradient-border px-6 py-4 flex items-center gap-4 w-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium text-purple-900">Wallet Not Connected</span>
          </div>
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 gradient-purple text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg gradient-border px-6 py-4 flex items-center gap-4 w-full">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-purple-900">Wallet Connected</p>
              <code className="text-xs text-purple-600 font-mono">
                {status.identityKey?.substring(0, 30)}...
              </code>
            </div>
          </div>
          <button
            onClick={disconnect}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Power className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      )}

      {(localError || error) && (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 w-full">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{localError || error}</span>
        </div>
      )}
    </div>
  )
}
