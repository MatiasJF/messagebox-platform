'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { WalletStatus } from '@/components/WalletStatus'
import { useWallet } from '@/components/WalletProvider'

interface CertifiedUser {
  identityKey: string
  alias: string
  certificationDate: string
}

export default function PaymentsPage() {
  const { status } = useWallet()
  const [users, setUsers] = useState<CertifiedUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<CertifiedUser | null>(null)
  const [amount, setAmount] = useState('')
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)
  const [paymentResult, setPaymentResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async (query?: string) => {
    setIsLoadingUsers(true)
    setError(null)

    try {
      const url = query
        ? `/api/certified-users/search?q=${encodeURIComponent(query)}`
        : '/api/certified-users'

      const response = await fetch(`http://localhost:3000${url}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Failed to load users')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadUsers(searchQuery.trim())
    } else {
      loadUsers()
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!status.isConnected) {
      setError('Please connect your wallet first')
      return
    }

    if (!selectedUser) {
      setError('Please select a recipient first')
      return
    }

    setIsPaymentLoading(true)
    setError(null)
    setPaymentResult(null)

    try {
      // Import and use browser-based payment client
      const { sendPayment } = await import('@/lib/paymentClient')

      console.log('Sending payment in browser...')
      const result = await sendPayment(selectedUser.identityKey, parseInt(amount))

      if (result.success) {
        setPaymentResult(`Successfully sent ${amount} satoshis to ${selectedUser.alias}`)
      } else {
        setError(result.error || 'Payment failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send payment')
    } finally {
      setIsPaymentLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-5">
      <Navigation />
      <WalletStatus />

      <main>
        <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-2xl font-bold mb-4">Send Payment</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Send Bitcoin payments to certified users on the MessageBox network.
            Search for a user below or browse all certified identities.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6 flex-wrap">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by display name..."
              className="flex-1 min-w-[200px] px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={() => loadUsers()}
              className="px-4 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
            >
              Show All
            </button>
          </div>

          {/* Loading Users */}
          {isLoadingUsers && (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading certified users...</p>
            </div>
          )}

          {/* Users List */}
          {!isLoadingUsers && users.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {users.map((user) => (
                <div
                  key={user.identityKey}
                  className="bg-white border-2 border-slate-200 rounded-lg p-5 hover:border-blue-600 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{user.alias || 'Anonymous User'}</h3>
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      Certified
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div>
                      <strong>Identity:</strong>{' '}
                      <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                        {user.identityKey.substring(0, 20)}...
                      </code>
                    </div>
                    <div>
                      <strong>Certified:</strong>{' '}
                      {new Date(user.certificationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button className="mt-3 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Select for Payment
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isLoadingUsers && users.length === 0 && (
            <p className="text-center text-slate-500 italic py-10">
              No certified users found
            </p>
          )}
        </div>

        {/* Payment Form */}
        {selectedUser && (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold mb-4">Payment Details</h2>

            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-5 mb-6">
              <h3 className="font-bold text-blue-600 mb-3">Sending to:</h3>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded">
                  <strong>Display Name:</strong> <span>{selectedUser.alias}</span>
                </div>
                <div className="bg-white p-3 rounded">
                  <strong>Identity Key:</strong>{' '}
                  <code className="text-sm break-all bg-slate-100 px-2 py-1 rounded">
                    {selectedUser.identityKey}
                  </code>
                </div>
              </div>
            </div>

            {!paymentResult && !isPaymentLoading && (
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block mb-2 font-medium text-slate-900">
                    Amount (satoshis)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in satoshis"
                    min="1"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-600 focus:outline-none transition-colors"
                  />
                  <small className="block mt-1 text-sm text-slate-500">
                    1 satoshi = 0.00000001 BSV
                  </small>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!status.isConnected}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    Send Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {isPaymentLoading && (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Sending payment...</p>
              </div>
            )}

            {paymentResult && (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-600 mb-2">
                  Payment Sent Successfully!
                </h3>
                <p className="text-slate-900 mb-4">{paymentResult}</p>
                <button
                  onClick={() => {
                    setPaymentResult(null)
                    setSelectedUser(null)
                    setAmount('')
                  }}
                  className="px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Send Another Payment
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-slate-900 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-2 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
