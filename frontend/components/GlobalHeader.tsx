'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils'

export function GlobalHeader() {
  const router = useRouter()
  const { t, direction } = useLanguage()
  const { resolvedTheme, toggleTheme } = useTheme()

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  const handleHomeClick = () => {
    router.push('/')
  }

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className={cn(
          'flex justify-between items-center h-14 sm:h-16',
          direction === 'rtl' && 'flex-row-reverse'
        )}>
          {/* Logo/Brand */}
          <div className="flex items-center min-w-0">
            <button
              onClick={handleHomeClick}
              className={cn(
                'flex items-center hover:opacity-80 transition-opacity',
                direction === 'rtl' ? 'space-x-reverse space-x-2 sm:space-x-3' : 'space-x-2 sm:space-x-3'
              )}
            >
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t('app.subtitle')}
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('app.title')}
                </h1>
              </div>
            </button>
          </div>

          {/* Navigation Controls */}
          <div className={cn(
            'flex items-center gap-1 sm:gap-2 md:gap-4',
            direction === 'rtl' && 'flex-row-reverse'
          )}>
            {/* Language Switcher */}
            <LanguageSwitcher 
              variant="button" 
              size="sm"
              className="border-gray-300 dark:border-gray-600 text-xs sm:text-sm"
            />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('theme.toggle')}
            >
              {resolvedTheme === 'dark' ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={handleSettingsClick}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('settings.title')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}