'use client'

import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/SettingsContext'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const router = useRouter()
  const { settings, updateSetting, updateFeatureSetting, resetToDefaults } = useSettings()
  const { t, direction, setLanguage, language } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    updateSetting('language', newLanguage)
    setLanguage(newLanguage) 
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    updateSetting('theme', newTheme)
    setTheme(newTheme)
  }

  const handleFontSizeChange = (fontSize: 'sm' | 'md' | 'lg') => {
    updateSetting('fontSize', fontSize)
  }

  const handleFontFamilyChange = (fontFamily: 'cairo' | 'system' | 'arial' | 'times') => {
    updateSetting('fontFamily', fontFamily)
  }

  const handleReset = () => {
    resetToDefaults()
    setShowResetConfirm(false)
  }

  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <div
      dir={direction}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className={cn(
          'mb-6 lg:mb-8',
          direction === 'rtl' ? 'text-right' : 'text-left'
        )}>
          <button
            onClick={handleGoBack}
            className={cn(
              'inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md',
              direction === 'rtl' && 'flex-row-reverse'
            )}
          >
            <svg
              className={cn(
                'w-4 h-4',
                direction === 'rtl' && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('nav.back')}
          </button>
        </div>

        {/* Header */}
        <div className={cn(
          'mb-8 lg:mb-12',
          direction === 'rtl' ? 'text-center lg:text-right' : 'text-center lg:text-left'
        )}>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            {t('settings.title')}
          </h1>
          <p className={cn(
            'text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl',
            direction === 'rtl' ? 'mx-auto lg:mr-0' : 'mx-auto lg:mx-0'
          )}>
            {t('settings.general')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <div className={cn(
                'flex items-center mb-4 gap-3',
                direction === 'rtl' && 'flex-row-reverse'
              )}>
                <div className="shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('settings.language')}
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => handleLanguageChange('en')}
                className={cn(
                  'w-full p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 hover:scale-105 transform',
                  direction === 'rtl' && 'flex-row-reverse',
                  language === 'en'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'
                )}
              >
                <div className="text-2xl sm:text-3xl">🇺🇸</div>
                <div className={cn(
                  'flex-1',
                  direction === 'rtl' ? 'text-right' : 'text-left'
                )}>
                  <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{t('language.english')}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.descriptions.language.ltr')}</div>
                </div>
                {language === 'en' && (
                  <div className={cn(direction === 'rtl' ? 'mr-auto' : 'ml-auto')}>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleLanguageChange('ar')}
                className={cn(
                  'w-full p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 hover:scale-105 transform',
                  direction === 'rtl' && 'flex-row-reverse',
                  language === 'ar'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'
                )}
              >
                <div className="text-2xl sm:text-3xl">🇸🇦</div>
                <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                  <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">{t('language.arabic')}</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.descriptions.language.rtl')}</div>
                </div>
                {language === 'ar' && (
                  <div className={cn(direction === 'rtl' ? 'mr-auto' : 'ml-auto')}>
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={cn(
              'flex items-center mb-4 sm:mb-6',
              direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
            )}>
              <div className="shrink-0 p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
                </svg>
              </div>
              <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('settings.theme')}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('settings.descriptions.theme')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(['light', 'dark', 'system'] as const).map((themeOption) => (
                <button
                  key={themeOption}
                  onClick={() => handleThemeChange(themeOption)}
                  className={cn(
                    'p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 hover:scale-105 transform',
                    theme === themeOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-md'
                  )}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className={cn(
                        'p-3 rounded-full',
                        themeOption === 'light' && 'bg-yellow-100',
                        themeOption === 'dark' && 'bg-indigo-100',
                        themeOption === 'system' && 'bg-gray-100'
                      )}>
                        <div className="text-2xl sm:text-3xl">
                          {themeOption === 'light' && '☀️'}
                          {themeOption === 'dark' && '🌙'}
                          {themeOption === 'system' && '💻'}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                      {t(`theme.${themeOption}`)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {themeOption === 'light' && t('settings.descriptions.lightTheme')}
                      {themeOption === 'dark' && t('settings.descriptions.darkTheme')}
                      {themeOption === 'system' && t('settings.descriptions.systemTheme')}
                    </div>
                    {theme === themeOption && (
                      <div className="mt-3 flex justify-center">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={cn(
              'flex items-center mb-4 sm:mb-6',
              direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
            )}>
              <div className="shrink-0 p-2 sm:p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('settings.fontSize')}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('settings.descriptions.fontSize')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={cn(
                    'p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 text-center hover:scale-105 transform',
                    settings.fontSize === size
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg ring-2 ring-green-200 dark:ring-green-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-400 hover:shadow-md'
                  )}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-100 rounded-full">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className={cn(
                    'font-semibold text-gray-900 dark:text-white mb-1',
                    size === 'sm' && 'text-sm',
                    size === 'md' && 'text-base',
                    size === 'lg' && 'text-lg'
                  )}>
                    {t(`fontSize.${size}`)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {size === 'sm' && t('settings.descriptions.smallFont')}
                    {size === 'md' && t('settings.descriptions.mediumFont')}
                    {size === 'lg' && t('settings.descriptions.largeFont')}
                  </div>
                  {settings.fontSize === size && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={cn(
              'flex items-center mb-4 sm:mb-6',
              direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
            )}>
              <div className="shrink-0 p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2H5a1 1 0 110-2h2zm1 3v11a2 2 0 002 2h4a2 2 0 002-2V7H8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11v6" />
                </svg>
              </div>
              <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('settings.fontFamily')}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('settings.descriptions.fontFamily')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {(['cairo', 'system', 'arial', 'times'] as const).map((font) => (
                <button
                  key={font}
                  onClick={() => handleFontFamilyChange(font)}
                  className={cn(
                    'p-4 sm:p-5 border-2 rounded-xl transition-all duration-200 text-center hover:scale-105 transform',
                    settings.fontFamily === font
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 hover:shadow-md'
                  )}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <span className="text-xl sm:text-2xl">
                        {font === 'cairo' && '🇦🇪'}
                        {font === 'system' && '💻'}
                        {font === 'arial' && '🔤'}
                        {font === 'times' && '📰'}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    'font-semibold text-gray-900 dark:text-white mb-1',
                    font === 'cairo' && 'font-cairo',
                    font === 'system' && 'font-system',
                    font === 'arial' && 'font-arial',
                    font === 'times' && 'font-times'
                  )}>
                    {t(`fontFamily.${font}`)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {font === 'cairo' && t('settings.descriptions.cairoFont')}
                    {font === 'system' && t('settings.descriptions.systemFont')}
                    {font === 'arial' && t('settings.descriptions.arialFont')}
                    {font === 'times' && t('settings.descriptions.timesFont')}
                  </div>
                  {settings.fontFamily === font && (
                    <div className="mt-3 flex justify-center">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={cn(
              'flex items-center mb-4 sm:mb-6',
              direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
            )}>
              <div className="shrink-0 p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('settings.features')}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('settings.descriptions.features')}</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Audio Recording */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-5">
                <div className={cn(
                  'flex items-start justify-between gap-4',
                  direction === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className={cn(
                    'flex items-start',
                    direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
                  )}>
                    <div className="shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className={cn(
                      'flex-1 min-w-0',
                      direction === 'rtl' ? 'text-right' : 'text-left'
                    )}>
                      <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                        {t('features.sounds')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('settings.descriptions.sounds')}
                      </div>
                    </div>
                  </div>
                <button
  onClick={() => updateFeatureSetting('enableAudio', !settings.features.enableAudio)}
  className={cn(
    'relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full p-1 transition-all duration-200 flex-shrink-0 hover:scale-105 overflow-hidden',
    settings.features.enableAudio ? 'bg-blue-500 shadow-lg justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
  )}
>
  <span className="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white transition-all shadow-lg" />
</button>

                </div>
              </div>

              {/* Text-to-Speech (TTS) */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-5">
                <div className={cn(
                  'flex items-start justify-between gap-4',
                  direction === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className={cn(
                    'flex items-start',
                    direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
                  )}>
                    <div className="shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </div>
                    <div className={cn(
                      'flex-1 min-w-0',
                      direction === 'rtl' ? 'text-right' : 'text-left'
                    )}>
                      <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                        {t('features.tts')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('settings.descriptions.tts')}
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                          {direction === 'rtl' ? 
                            '✨ كشف تلقائي للغة النص (عربي/إنجليزي)' : 
                            '✨ Automatic language detection (Arabic/English)'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateFeatureSetting('enableTTS', !settings.features.enableTTS)}
                    className={cn(
                      'relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full p-1 transition-all duration-200 flex-shrink-0 hover:scale-105 overflow-hidden',
                      settings.features.enableTTS ? 'bg-purple-500 shadow-lg justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    )}
                  >
                    <span className="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white transition-all shadow-lg" />
                  </button>
                </div>
              </div>

              {/* thinking */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-5">
                <div className={cn(
                  'flex items-start justify-between gap-4',
                  direction === 'rtl' && 'flex-row-reverse'
                )}>
                  <div className={cn(
                    'flex items-start',
                    direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
                  )}>
                    <div className="shrink-0 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-1">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 2h9a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" />
                      </svg>
                    </div>
                    <div className={cn(
                      'flex-1 min-w-0',
                      direction === 'rtl' ? 'text-right' : 'text-left'
                    )}>
                      <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg">
                        {t('features.thinking')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('settings.descriptions.thinking')}
                      </div>
                    </div>
                  </div>
                <button
                  onClick={() => updateFeatureSetting('showThinking', !settings.features.showThinking)}
                  className={cn(
                    'relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full p-1 transition-all duration-200 flex-shrink-0 hover:scale-105 overflow-hidden',
                    settings.features.showThinking ? 'bg-green-500 shadow-lg justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                  )}
                >
                  <span className="inline-block h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white transition-all shadow-lg" />
                </button>

                </div>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className={cn(
              'flex items-center mb-4 sm:mb-6',
              direction === 'rtl' ? 'gap-3 flex-row-reverse' : 'gap-3'
            )}>
              <div className="shrink-0 p-2 sm:p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('settings.reset')}</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('settings.descriptions.reset')}</p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 sm:p-5">
              <div className={cn(
                'flex items-start gap-4',
                direction === 'rtl' && 'flex-row-reverse'
              )}>
                <div className="shrink-0 p-2 bg-red-100 dark:bg-red-900/50 rounded-lg mt-1">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className={cn('flex-1', direction === 'rtl' ? 'text-right' : 'text-left')}>
                  <div className="font-semibold text-red-800 dark:text-red-300 text-base sm:text-lg mb-2">
                    {t('settings.resetWarning')}
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    {t('settings.descriptions.resetWarning')}
                  </p>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800"
                  >
                    <div className={cn(
                      'flex items-center justify-center gap-2',
                      direction === 'rtl' && 'flex-row-reverse'
                    )}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>{t('settings.resetAll')}</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isMounted && showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className={cn(
              'text-center',
              direction === 'rtl' ? 'text-right' : 'text-left'
            )}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('settings.resetConfirm')}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {t('settings.descriptions.resetWarning')}
              </p>
              
              <div className={cn(
                'flex gap-3',
                direction === 'rtl' ? 'flex-row-reverse' : ''
              )}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {t('settings.resetAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
