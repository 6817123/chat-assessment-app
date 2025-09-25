'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@/contexts/NewChatContext'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { ChatWindow } from './chat/ChatWindow'
import { cn } from '@/lib/utils'

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChat()
  const { direction, t } = useLanguage()
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Chat Window */}
      {isOpen && <ChatWindow />}

      {/* Floating Chat Button */}
      <div
        className={cn(
          'fixed bottom-6 z-50 transition-all duration-300',
          direction === 'rtl' ? 'left-6' : 'right-6'
        )}
      >
        <button
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            'group relative w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center',
            'focus:outline-none focus:ring-4 focus:ring-blue-500/20',
            isHovered && 'scale-110',
            isAnimating && 'animate-bounce'
          )}
          aria-label={t('a11y.chat.toggle')}
        >
          {/* Chat Icon */}
          <div className={cn(
            'transition-transform duration-300',
            isOpen ? 'rotate-180 scale-90' : 'rotate-0 scale-100'
          )}>
            {isOpen ? (
              // Close icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Chat icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )}
          </div>

          {/* Pulsing notification dot */}
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>

          {/* Tooltip */}
          <div className={cn(
            'absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap',
            direction === 'rtl' ? 'right-0' : 'left-0'
          )}>
            {t('chat.title')}
            <div className={cn(
              'absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
              direction === 'rtl' ? 'right-4' : 'left-4'
            )} />
          </div>
        </button>

        {/* Floating particles animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute w-2 h-2 bg-blue-400 rounded-full opacity-60',
                'animate-bounce'
              )}
              style={{
                left: `${20 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}