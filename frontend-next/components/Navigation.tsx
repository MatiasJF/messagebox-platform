import Link from 'next/link'

export function Navigation() {
  return (
    <header className="mb-10 text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-5">
        MessageBox Certifier Platform
      </h1>
      <nav className="flex gap-2 justify-center flex-wrap">
        <Link
          href="/"
          className="px-5 py-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors font-medium"
        >
          Certify Identity
        </Link>
        <Link
          href="/payments"
          className="px-5 py-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors font-medium"
        >
          Send Payment
        </Link>
      </nav>
    </header>
  )
}
