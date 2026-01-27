'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { WalletStatus } from '@/components/WalletStatus'
import { useWallet } from '@/components/WalletProvider'
import { Send, Search, User, CheckCircle2, Loader2, X, Info } from 'lucide-react'

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
    <div className="p-6">
      <Navigation />
      <WalletStatus />

      <main className="space-y-6 max-w-4xl mx-auto">
        {/* Search Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border overflow-hidden">
          <div className="gradient-purple p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 bg-white/20 rounded-lg">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Send Payment</h2>
                <p className="text-purple-100 text-sm">Send Bitcoin to certified users on MessageBox</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by display name..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 gradient-purple text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                Search
              </button>
              <button
                onClick={() => loadUsers()}
                className="px-6 py-3 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
              >
                Show All
              </button>
            </div>

            {isLoadingUsers && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-purple-900 font-medium">Loading certified users...</p>
              </div>
            )}

            {!isLoadingUsers && users.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.identityKey}
                    onClick={() => setSelectedUser(user)}
                    className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <User className="w-5 h-5 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900">{user.alias || 'Anonymous'}</h3>
                        <p className="text-xs text-purple-600">
                          Certified {new Date(user.certificationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <code className="text-xs text-purple-700 break-all bg-purple-100 px-2 py-1 rounded block">
                      {user.identityKey.substring(0, 20)}...
                    </code>
                  </div>
                ))}
              </div>
            )}

            {!isLoadingUsers && users.length === 0 && (
              <div className="text-center py-12 text-purple-600">
                <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No certified users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Form */}
        {selectedUser && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border overflow-hidden">
            <div className="gradient-purple-light p-6">
              <div className="flex items-center justify-between text-white">
                <h3 className="text-xl font-bold">Payment Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-5 mb-6">
                <p className="text-sm text-purple-600 font-semibold mb-3">Sending to:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-purple-900">{selectedUser.alias}</span>
                  </div>
                  <code className="text-xs text-purple-700 break-all block bg-purple-100 px-3 py-2 rounded">
                    {selectedUser.identityKey}
                  </code>
                </div>
              </div>

              {!paymentResult && !isPaymentLoading && (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                    <label htmlFor="amount" className="block mb-2 font-semibold text-purple-900">
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
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    />
                    <p className="mt-2 text-sm text-purple-600 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      1 satoshi = 0.00000001 BSV
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!status.isConnected}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-purple text-white font-semibold rounded-xl hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                    Send Payment
                  </button>
                </form>
              )}

              {isPaymentLoading && (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                  <p className="text-purple-900 font-medium">Sending payment...</p>
                </div>
              )}

              {paymentResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-900">Payment Sent!</h4>
                      <p className="text-sm text-green-700">{paymentResult}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentResult(null)
                      setSelectedUser(null)
                      setAmount('')
                    }}
                    className="w-full px-6 py-3 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
                  >
                    Send Another Payment
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-red-700 mb-2">Payment Failed</h4>
                  <p className="text-red-900 mb-4">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
