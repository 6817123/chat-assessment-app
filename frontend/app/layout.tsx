import './globals.css'
import { Inter, Cairo } from 'next/font/google'
import type { Metadata } from 'next'
import { Providers } from '@/contexts/Providers'
import { DynamicHtml } from '@/components/DynamicHtml'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Chat Assessment',
    default: 'Chat Assessment',
  },
  description: 'A modern AI chat application with multilingual support - تطبيق دردشة ذكي حديث بدعم متعدد اللغات',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}>
      <body className="font-cairo antialiased">
        <Providers>
          <DynamicHtml />
          {children}
        </Providers>
      </body>
    </html>
  )
}