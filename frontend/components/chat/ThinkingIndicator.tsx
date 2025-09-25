'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import { cn } from '@/lib/utils'

interface ThinkingIndicatorProps {
  className?: string
}

export function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
  const { t } = useLanguage()
  const { settings } = useSettings()

  // Don't render if thinking indicator is disabled in settings
  if (!settings.features.showThinking) {
    return null
  }

  return (
    <div className={cn('flex items-end space-x-3', className)}>
      {/* Assistant Avatar */}
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>

      {/* Thinking Animation */}
      <div className="max-w-xs px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div 
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.1s' }}
          />
          <div 
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s' }}
          />
        </div>
        
        <div className="flex items-center justify-end mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('chat.thinking')}
          </span>
        </div>
      </div>
    </div>
  )
}