import Link from 'next/link'
import { Shield, Send, Inbox } from 'lucide-react'

export function Navigation() {
  return (
    <header className="mb-8 max-w-4xl mx-auto">
      <div className="gradient-purple text-white rounded-2xl shadow-xl p-8 mb-6">
        <h1 className="text-4xl font-bold text-center mb-2">
          MessageBox Platform
        </h1>
        <p className="text-purple-100 text-center text-sm">
          Secure identity certification and peer-to-peer payments on BSV
        </p>
      </div>

      <nav className="flex gap-3 justify-center flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur text-purple-600 hover:bg-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg gradient-border"
        >
          <Shield className="w-5 h-5" />
          Certify Identity
        </Link>
        <Link
          href="/payments"
          className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur text-purple-600 hover:bg-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg gradient-border"
        >
          <Send className="w-5 h-5" />
          Send Payment
        </Link>
        <Link
          href="/receive"
          className="flex items-center gap-2 px-6 py-3 bg-white/95 backdrop-blur text-purple-600 hover:bg-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg gradient-border"
        >
          <Inbox className="w-5 h-5" />
          Receive
        </Link>
      </nav>
    </header>
  )
}
