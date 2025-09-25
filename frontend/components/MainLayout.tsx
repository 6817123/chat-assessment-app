'use client'

import { GlobalHeader } from '@/components/GlobalHeader'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GlobalHeader />
      <main className="relative">
        {children}
      </main>
    </div>
  )
}