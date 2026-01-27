'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { WalletStatus } from '@/components/WalletStatus'
import { walletManager } from '@/lib/walletManager'
import { Shield, CheckCircle2, Loader2, Info } from 'lucide-react'

export default function CertifyPage() {
  const [alias, setAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    identityKey: string
    alias: string
    txid: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const { certifyIdentity } = await import('@/lib/certificationClient')

      console.log('Certifying identity in browser...')
      const certification = await certifyIdentity(alias || undefined)

      console.log('Storing certification on backend...')
      await walletManager.apiRequest('/api/store-certification', {
        method: 'POST',
        body: JSON.stringify({
          identityKey: certification.identityKey,
          txid: certification.txid,
          alias: certification.alias,
          host: process.env.NEXT_PUBLIC_MESSAGEBOX_HOST || 'https://messagebox.babbage.systems'
        }),
      })

      setResult({
        identityKey: certification.identityKey,
        alias: certification.alias || 'Not provided',
        txid: certification.txid,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to certify identity')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Navigation />
      <WalletStatus />

      <main className="space-y-6 max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border overflow-hidden">
          <div className="gradient-purple p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Identity Certification</h2>
                <p className="text-purple-100 text-sm">Register your identity on the BSV blockchain</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {!result && !isLoading && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="alias" className="block mb-2 font-semibold text-purple-900">
                    Display Name <span className="text-purple-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="Enter a friendly name or alias"
                    maxLength={50}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <p className="mt-2 text-sm text-purple-600 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    This helps others identify you when sending payments
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-purple text-white font-semibold rounded-xl hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <Shield className="w-5 h-5" />
                  Certify My Identity
                </button>
              </form>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-purple-900 font-medium">Certifying your identity on the blockchain...</p>
                <p className="text-purple-600 text-sm mt-1">This may take a few moments</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-green-900">Certification Successful!</h3>
                    <p className="text-sm text-green-700">Your identity has been registered on the blockchain</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Your Identity Key
                    </p>
                    <code className="text-sm text-purple-900 break-all font-mono">
                      {result.identityKey}
                    </code>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Display Name
                    </p>
                    <p className="text-sm text-purple-900">{result.alias}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                      Transaction ID
                    </p>
                    <code className="text-sm text-purple-900 break-all font-mono">
                      {result.txid}
                    </code>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setResult(null)
                    setAlias('')
                  }}
                  className="w-full px-6 py-3 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
                >
                  Certify Another Identity
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
                <p className="text-red-900 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null)
                    setAlias('')
                  }}
                  className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border p-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            What is Identity Certification?
          </h3>
          <div className="space-y-4 text-purple-800">
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Blockchain Registration</p>
                <p className="text-sm">Your identity is registered on the BSV blockchain using a cryptographically signed transaction.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Discoverability</p>
                <p className="text-sm">Others can find your MessageBox server address by looking up your identity key on the overlay network.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Secure Communications</p>
                <p className="text-sm">All messages and payments are encrypted and authenticated using your identity key.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Decentralized</p>
                <p className="text-sm">No central authority controls your identity - it's secured by the Bitcoin SV blockchain.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
