'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { WalletStatus } from '@/components/WalletStatus'
import { walletManager } from '@/lib/walletManager'

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
      // Import certification client
      const { certifyIdentity } = await import('@/lib/certificationClient')

      // Step 1: Certify in browser (where wallet is)
      console.log('Certifying identity in browser...')
      const certification = await certifyIdentity(alias || undefined)

      // Step 2: Store result on backend
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
    <div className="max-w-5xl mx-auto p-5">
      <Navigation />
      <WalletStatus />

      <main>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-2xl font-bold mb-4">Identity Certification</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Certify your identity with the MessageBox network. This will register your identity
            on the BSV blockchain and make you discoverable for receiving messages and payments.
          </p>

          {!result && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="alias" className="block mb-2 font-medium text-slate-900">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Enter a friendly name or alias"
                  maxLength={50}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                />
                <small className="block mt-1 text-sm text-slate-500">
                  This helps others identify you when sending payments
                </small>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Certifying...' : 'Certify My Identity'}
              </button>
            </form>
          )}

          {isLoading && (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Certifying your identity on the blockchain...</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-600 mb-4">Certification Successful!</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <strong className="block text-xs uppercase tracking-wider text-slate-600 mb-1">
                    Your Identity Key:
                  </strong>
                  <code className="text-sm break-all bg-slate-100 px-2 py-1 rounded">
                    {result.identityKey}
                  </code>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <strong className="block text-xs uppercase tracking-wider text-slate-600 mb-1">
                    Display Name:
                  </strong>
                  <span>{result.alias}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <strong className="block text-xs uppercase tracking-wider text-slate-600 mb-1">
                    Transaction ID:
                  </strong>
                  <code className="text-sm break-all bg-slate-100 px-2 py-1 rounded">
                    {result.txid}
                  </code>
                </div>
              </div>
              <p className="mt-4 text-slate-600">
                Your identity has been certified and broadcast to the MessageBox network.
                You can now receive payments and messages.
              </p>
              <button
                onClick={() => {
                  setResult(null)
                  setAlias('')
                }}
                className="mt-4 px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Certify Another Identity
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
              <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
              <p className="text-slate-900 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setAlias('')
                }}
                className="px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-4">What is Identity Certification?</h3>
          <ul className="space-y-3">
            <li className="pb-3 border-b border-purple-400/30">
              <strong className="text-yellow-400">Blockchain Registration:</strong> Your identity is registered on the BSV blockchain
              using a cryptographically signed transaction.
            </li>
            <li className="pb-3 border-b border-purple-400/30">
              <strong className="text-yellow-400">Discoverability:</strong> Others can find your MessageBox server address by looking
              up your identity key on the overlay network.
            </li>
            <li className="pb-3 border-b border-purple-400/30">
              <strong className="text-yellow-400">Secure Communications:</strong> All messages and payments are encrypted and authenticated
              using your identity key.
            </li>
            <li>
              <strong className="text-yellow-400">Decentralized:</strong> No central authority controls your identity - it's secured
              by the Bitcoin SV blockchain.
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
