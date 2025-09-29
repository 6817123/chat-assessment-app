'use client'

import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useTTSContext } from '@/contexts/TTSContext'
import { AttachmentPreview } from './AttachmentPreview'
import { formatTime, isToday, isYesterday } from '@/lib/utils'
import type { Message } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { direction, t } = useLanguage()
  const { settings } = useSettings()
  const { speak, cancel, isSpeaking } = useTTSContext()
  const isUser = message.sender === 'user'
  const isAssistant = message.sender === 'assistant'

  // TTS is now controlled manually only - no automatic playback

  const formatMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return formatTime(timestamp, direction === 'rtl' ? 'ar' : 'en')
    } else if (isYesterday(timestamp)) {
      return t('time.yesterday')
    } else {
      return timestamp.toLocaleDateString(direction === 'rtl' ? 'ar' : 'en', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  return (
    <div
      className={cn(
        'flex items-end space-x-3',
        direction === 'rtl' && 'space-x-reverse',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
        )}
        role="article"
        aria-label={isUser ? t('a11y.message.user') : t('a11y.message.assistant')}
      >
        {/* Text Content */}
        {message.text && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        )}

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn('space-y-2', message.text && 'mt-2')}>
            {message.attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                isUser={isUser}
              />
            ))}
          </div>
        )}

        {/* Timestamp and TTS Controls */}
        <div
          className={cn(
            'flex items-center justify-between mt-1 text-xs opacity-70',
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          )}
        >
          <div className="flex items-center">
            <time dateTime={message.timestamp.toISOString()}>
              {formatMessageTime(message.timestamp)}
            </time>
            
            {/* Delivery status for user messages */}
            {isUser && (
              <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
          </div>

          {/* TTS Controls for assistant messages */}
          {isAssistant && message.text && settings.features.enableTTS && (
            <div className="flex items-center gap-1">
              {!isSpeaking ? (
                /* Play Button */
                <button
                  onClick={() => {
                    speak(message.text).catch(error => {
                      // Silently handle TTS errors for manual clicks too
                    })
                  }}
                  className={cn(
                    'p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-blue-500'
                  )}
                  title={t('tts.speak')}
                >
                  <svg 
                    className="w-3 h-3" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                </button>
              ) : (
                /* Stop Button */
                <button
                  onClick={cancel}
                  className={cn(
                    'p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-500 animate-pulse'
                  )}
                  title={t('tts.stop')}
                >
                  <svg 
                    className="w-3 h-3" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      )}
    </div>
  )
}