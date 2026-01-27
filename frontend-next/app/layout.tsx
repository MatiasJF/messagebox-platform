import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/WalletProvider'

export const metadata: Metadata = {
  title: 'MessageBox Certifier Platform',
  description: 'Certify your identity and send BSV payments on the MessageBox network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-slate-900">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  )
}
