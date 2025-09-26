'use client'

import React, { useEffect, useMemo, useRef, useState } from "react";
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
            isAnimating && 'animate-bounce-gentle'
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
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    selectedUser,
    setSelectedUser,
    users,
    messages,
    loadUsers,
    sendMessage,
    setCurrentUser,
    connect,
    isConnected,
    isLoading,
    error,
    startTyping,
    stopTyping,
    typingUsers,
  } = useChat()

  const { language, direction, t } = useLanguage()

  // Initialize chat
  useEffect(() => {
    setCurrentUser(currentUser)
    loadUsers()
    connect()
  }, [currentUser])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || !selectedUser || isLoading) return

    const messageCopy = messageText.trim()
    setMessageText('')
    setIsTyping(false)
    stopTyping()

    try {
      await sendMessage(messageCopy)
    } catch (error) {
      console.error('Failed to send message:', error)
      // Restore message text on error
      setMessageText(messageCopy)
    }
  }

  const handleTyping = (text: string) => {
    setMessageText(text)

    if (!isTyping && text.length > 0) {
      setIsTyping(true)
      startTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      stopTyping()
    }, 1000)

    // Stop typing if text is empty
    if (text.length === 0) {
      setIsTyping(false)
      stopTyping()
    }
  }

  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date)
    return messageDate.toLocaleTimeString(language === 'ar' ? 'ar' : 'en', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getAvailableUsers = () => {
    return users.filter(user => user._id !== currentUser._id)
  }

  return (
    <div className={`fixed bottom-6 ${direction === 'rtl' ? 'left-6' : 'right-6'} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`mb-4 w-80 h-96 bg-white rounded-lg shadow-2xl border overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-96'
          } ${direction === 'rtl' ? 'rtl' : 'ltr'}`}
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {selectedUser?.avatar ? (
                  <Image
                    src={selectedUser.avatar}
                    alt={selectedUser.displayName}
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                ) : selectedUser ? (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold truncate">
                  {selectedUser ? selectedUser.displayName : t('float.chat.title')}
                </h3>
                {selectedUser ? (
                  <p className="text-xs opacity-80">
                    {selectedUser.isOnline ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                        {t('chat.online')}
                      </span>
                    ) : (
                      t('common.offline')
                    )}
                  </p>
                ) : (
                  <p className="text-xs opacity-80">{t('float.chat.subtitle')}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={t('float.chat.minimize')}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={t('float.chat.close')}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* User Selection or Messages */}
              <div className="flex-1 overflow-hidden flex flex-col" style={{ height: 'calc(100% - 120px)' }}>
                {!selectedUser ? (
                  // User Selection
                  <div className="p-4 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-3">
                      {t('chat.select.user')}
                    </p>
                    
                    {/* Loading state for users */}
                    {isLoading && users.length === 0 && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <div className="text-gray-500 text-sm">
                          {t('common.loading')}...
                        </div>
                      </div>
                    )}

                    {/* No users found */}
                    {!isLoading && getAvailableUsers().length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-2">👥</div>
                        <p className="text-gray-500 text-sm">
                          No other users available
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Users will appear here when they join
                        </p>
                      </div>
                    )}

                    {/* Users list */}
                    <div className="space-y-2">
                      {getAvailableUsers().map((user) => (
                        <div
                          key={user._id}
                          onClick={() => handleUserSelect(user)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="relative flex-shrink-0">
                            {user.avatar ? (
                              <Image
                                src={user.avatar}
                                alt={user.displayName}
                                width={32}
                                height={32}
                                className="rounded-full"
                                unoptimized
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                  {user.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.isOnline ? t('common.online') : t('common.offline')}
                            </p>
                          </div>
                          <div className="text-gray-300 text-lg">
                            →
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Messages
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Loading spinner for initial load */}
                    {isLoading && messages.length === 0 && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <div className="text-gray-500 text-sm">
                          {t('common.loading')}
                        </div>
                      </div>
                    )}

                    {/* No messages state */}
                    {messages.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">💬</div>
                        <p className="text-gray-500 text-sm">
                          {t('chat.no.messages')}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Start a conversation with {selectedUser?.displayName}
                        </p>
                      </div>
                    )}

                    {/* Messages list */}
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.sender._id === currentUser._id
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-2xl break-words animate-slide-in ${
                            message.sender._id === currentUser._id
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${
                            message.sender._id === currentUser._id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.sender._id === currentUser._id && (
                              <CheckIcon className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              {selectedUser && (
                <div className="border-t bg-gray-50 p-3">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={messageText}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder={t('chat.type.message')}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!isConnected || isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || !isConnected || isLoading}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors relative"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <PaperAirplaneIcon className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                    >
                      <span>←</span>
                      <span>{t('chat.back.to.users')}</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">
                        {isConnected ? t('common.connected') : t('common.disconnected')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={handleToggleChat}
        className="w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  )
}