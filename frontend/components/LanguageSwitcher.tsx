'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'button' | 'dropdown' | 'inline'
  size?: 'sm' | 'md' | 'lg'
}

export function LanguageSwitcher({ 
  className,
  variant = 'button',
  size = 'md'
}: LanguageSwitcherProps) {
  const { language, toggleLanguage, setLanguage, t, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLanguage(newLang)
    setIsOpen(false)
  }

  // Button variant - simple toggle
  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'text-gray-700 dark:text-gray-200',
          direction === 'rtl' && 'space-x-reverse',
          size === 'sm' && 'px-2 py-1 text-sm',
          size === 'lg' && 'px-4 py-3 text-lg',
          className
        )}
        title={t('language.toggle')}
      >
        <span className="text-lg">
          {language === 'en' ? '🇺🇸' : '🇸🇦'}
        </span>
        <span className="font-medium">
          {language === 'en' ? 'EN' : 'عر'}
        </span>
      </button>
    )
  }

  // Inline variant - text only
  if (variant === 'inline') {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
          'underline transition-colors',
          size === 'sm' && 'text-sm',
          size === 'lg' && 'text-lg',
          className
        )}
      >
        {t('language.toggle')}
      </button>
    )
  }

  // Dropdown variant
  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600',
          'hover:bg-gray-50 dark:hover:bg-gray-700',
          'text-gray-700 dark:text-gray-200',
          direction === 'rtl' && 'space-x-reverse',
          size === 'sm' && 'px-2 py-1 text-sm',
          size === 'lg' && 'px-4 py-3 text-lg'
        )}
      >
        <span className="text-lg">
          {language === 'en' ? '🇺🇸' : '🇸🇦'}
        </span>
        <span className="font-medium">
          {language === 'en' ? 'English' : 'العربية'}
        </span>
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600',
            'rounded-lg shadow-lg z-50 min-w-full',
            direction === 'rtl' ? 'left-0' : 'right-0'
          )}
        >
          <button
            onClick={() => handleLanguageChange('en')}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700',
              'text-gray-700 dark:text-gray-200 transition-colors',
              direction === 'rtl' && 'space-x-reverse text-right',
              language === 'en' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            )}
          >
            <span className="text-lg">🇺🇸</span>
            <div>
              <div className="font-medium">English</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Left to Right</div>
            </div>
          </button>

          <button
            onClick={() => handleLanguageChange('ar')}
            className={cn(
              'w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700',
              'text-gray-700 dark:text-gray-200 transition-colors',
              direction === 'rtl' && 'space-x-reverse text-right',
              language === 'ar' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
            )}
          >
            <span className="text-lg">🇸🇦</span>
            <div>
              <div className="font-medium">العربية</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">من اليمين إلى اليسار</div>
            </div>
          </button>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
