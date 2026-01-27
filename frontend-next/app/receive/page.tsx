'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { WalletStatus } from '@/components/WalletStatus'
import { useWallet } from '@/components/WalletProvider'
import { checkInbox, acknowledgeMessage, ReceivedMessage } from '@/lib/messageClient'
import { Inbox, RefreshCw, Check, Loader2, MailOpen, Clock, Info, ChevronDown, ChevronUp, User, Hash, FileText } from 'lucide-react'

export default function ReceivePage() {
  const { status } = useWallet()
  const [messages, setMessages] = useState<ReceivedMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [expandedPaymentData, setExpandedPaymentData] = useState<Set<string>>(new Set())

  const loadMessages = async () => {
    if (!status.isConnected) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const inboxMessages = await checkInbox('payment_inbox')
      setMessages(inboxMessages)
      setLastChecked(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcknowledge = async (messageId: string) => {
    try {
      await acknowledgeMessage(messageId, 'payment_inbox')
      setMessages(prev => prev.filter(msg => msg.messageId !== messageId))
      setExpandedMessages(prev => {
        const next = new Set(prev)
        next.delete(messageId)
        return next
      })
      setExpandedPaymentData(prev => {
        const next = new Set(prev)
        next.delete(messageId)
        return next
      })
    } catch (err: any) {
      setError(err.message || 'Failed to acknowledge message')
    }
  }

  const toggleExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const togglePaymentData = (messageId: string) => {
    setExpandedPaymentData(prev => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  // Auto-refresh every 45 seconds
  useEffect(() => {
    if (!status.isConnected) {
      return
    }

    loadMessages()
    const interval = setInterval(() => {
      loadMessages()
    }, 45000)

    return () => clearInterval(interval)
  }, [status.isConnected])

  return (
    <div className="p-6">
      <Navigation />
      <WalletStatus />

      <main className="space-y-6 max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border overflow-hidden">
          <div className="gradient-purple p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Receive Payments</h2>
                  <p className="text-purple-100 text-sm">Your incoming payments from MessageBox</p>
                </div>
              </div>
              <button
                onClick={loadMessages}
                disabled={!status.isConnected || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Checking...' : 'Refresh'}
              </button>
            </div>
          </div>

          {lastChecked && status.isConnected && (
            <div className="px-6 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2 text-sm text-purple-700">
              <Clock className="w-4 h-4" />
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Wallet Not Connected */}
        {!status.isConnected && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border p-12 text-center">
            <Inbox className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">Connect Your Wallet</h3>
            <p className="text-purple-600">
              Please connect your wallet to check for incoming payments
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error</h3>
            <p className="text-red-900">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && messages.length === 0 && status.isConnected && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-purple-900 font-medium">Checking your inbox...</p>
          </div>
        )}

        {/* No Messages */}
        {!isLoading && status.isConnected && messages.length === 0 && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border p-12 text-center">
            <MailOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">No Messages</h3>
            <p className="text-purple-600">
              Payments sent to your identity will appear here
            </p>
          </div>
        )}

        {/* Messages List */}
        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => {
              const isExpanded = expandedMessages.has(message.messageId)
              const isPaymentDataExpanded = expandedPaymentData.has(message.messageId)
              return (
                <div
                  key={message.messageId}
                  className="bg-white/95 backdrop-blur rounded-2xl shadow-xl overflow-hidden gradient-border"
                >
                  {/* Header */}
                  <div className="gradient-purple p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                          <Inbox className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-white">Payment Received</h3>
                          <p className="text-purple-100 text-sm flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                          New
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Summary */}
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600 font-medium">Sender</p>
                          <code className="text-sm text-purple-900 font-mono">
                            {message.sender.substring(0, 20)}...
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(message.messageId)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all text-sm font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Details
                          </>
                        )}
                      </button>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-600" />
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Sender Identity
                            </p>
                          </div>
                          <code className="text-xs text-gray-900 break-all font-mono block bg-white p-3 rounded">
                            {message.sender}
                          </code>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Hash className="w-4 h-4 text-gray-600" />
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              Message ID
                            </p>
                          </div>
                          <code className="text-xs text-gray-900 break-all font-mono block bg-white p-3 rounded">
                            {message.messageId}
                          </code>
                        </div>

                        {message.body && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div
                              onClick={() => togglePaymentData(message.messageId)}
                              className="flex items-center justify-between cursor-pointer mb-2"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  Payment Data
                                </p>
                              </div>
                              {isPaymentDataExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            {isPaymentDataExpanded && (
                              <pre className="text-xs text-gray-900 bg-white p-3 rounded overflow-x-auto font-mono animate-in fade-in slide-in-from-top-1 duration-200">
                                {JSON.stringify(message.body, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleAcknowledge(message.messageId)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 gradient-purple text-white font-semibold rounded-xl hover:shadow-xl transition-all"
                    >
                      <Check className="w-5 h-5" />
                      Acknowledge & Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg gradient-border p-8">
          <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            How Receiving Works
          </h3>
          <div className="space-y-4 text-purple-800">
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Auto-Refresh</p>
                <p className="text-sm">This page automatically checks your MessageBox inbox every 45 seconds.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Encrypted</p>
                <p className="text-sm">All messages are end-to-end encrypted and only you can decrypt them with your wallet.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Acknowledge</p>
                <p className="text-sm">Once you acknowledge a message, it's removed from the MessageBox server permanently.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-purple-900">Privacy</p>
                <p className="text-sm">Messages are stored temporarily on the MessageBox server until acknowledged - ensuring ephemeral, private communication.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
