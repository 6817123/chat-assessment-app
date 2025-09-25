'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/NewChatContext'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Modal } from '../ui/Modal'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ThinkingIndicator } from './ThinkingIndicator'
import { ConversationHistory } from './ConversationHistory'
import { cn } from '@/lib/utils'

export function ChatWindow() {
  const { 
    conversations,
    activeConversationId, 
    isThinking, 
    closeChat, 
    selectConversation,
    startNewConversation,
    error,
    clearError
  } = useChat()
  
  const { direction, t } = useLanguage()
  const { resolvedTheme } = useTheme()
  const [showHistory, setShowHistory] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dragCounter = useRef(0)

  // Get active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const messages = activeConversation?.messages || []
  
  // Debug logging
  console.log('ChatWindow render - activeConversationId:', activeConversationId);
  console.log('ChatWindow render - activeConversation:', activeConversation);
  console.log('ChatWindow render - messages count:', messages.length);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isThinking])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  // Handle drag and drop events
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current++
      if (e.dataTransfer?.items) {
        const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file')
        if (hasFiles) {
          setIsDragOver(true)
        }
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current--
      if (dragCounter.current === 0) {
        setIsDragOver(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      dragCounter.current = 0
      
      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        // Create a custom event to pass files to MessageInput
        const fileDropEvent = new CustomEvent('filesDrop', {
          detail: { files: Array.from(files) }
        })
        document.dispatchEvent(fileDropEvent)
      }
    }

    // Add event listeners to document to catch all drag events
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [])

  const handleNewChat = () => {
    startNewConversation()
    setShowHistory(false)
  }

  return (
    <Modal
      isOpen={true}
      onClose={closeChat}
      className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl h-[90vh] sm:h-[85vh] lg:h-[80vh] mx-2 sm:mx-4 lg:mx-0 flex flex-col"
      closeOnOverlayClick={false}
    >
      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-blue-500 flex items-center justify-center">
          <div className="text-center">
            {/* File Icons */}
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center transform -rotate-12 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center transform rotate-12 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
            </div>
            
            {/* Main Text */}
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {direction === 'rtl' ? 'اسحب أي ملف هنا' : 'Drop any file here'}
            </div>
            <div className="text-lg text-blue-500 dark:text-blue-300">
              {direction === 'rtl' 
                ? 'لإضافته إلى المحادثة' 
                : 'to add it to the conversation'
              }
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          {/* Assistant Avatar */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">
              {t('chat.title')}
            </h3>
            <p className="text-xs sm:text-sm opacity-80 truncate">
              {isThinking ? t('chat.thinking') : t('status.connected')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Conversation History Button */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('conversations.title')}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
            </svg>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('chat.new')}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>

          {/* Close Button */}
          <button
            onClick={closeChat}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label={t('chat.close')}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0">
          {/* Conversation History Sidebar */}
          {showHistory && (
            <div className="w-48 sm:w-56 lg:w-64 border-r border-gray-200 dark:border-gray-700 hidden sm:block">
              <ConversationHistory 
                onConversationSelect={(id: string) => {
                  selectConversation(id)
                  setShowHistory(false)
                }}
              />
            </div>
          )}

          {/* Mobile History Overlay */}
          {showHistory && (
            <div className="sm:hidden absolute inset-0 z-50 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('conversations.title')}
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1">
                <ConversationHistory 
                  onConversationSelect={(id: string) => {
                    selectConversation(id)
                    setShowHistory(false)
                  }}
                />
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Error Banner */}
            {error && (
              <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex-1 mr-2">{error}</span>
                  <button
                    onClick={clearError}
                    className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded flex-shrink-0"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4">
              {/* Empty State */}
              {messages.length === 0 && !isThinking && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                    {t('chat.history.empty')}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-4">
                    {t('chat.history.start')}
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                />
              ))}

              {/* Thinking Indicator */}
              {isThinking && <ThinkingIndicator />}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 lg:p-4 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <MessageInput />
        </div>
      </div>
    </Modal>
  )
}