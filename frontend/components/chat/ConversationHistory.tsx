'use client'

import { useChat } from '@/contexts/NewChatContext'
import { useLanguage } from '@/contexts/SimpleLanguageContext'
import { VirtualizedConversationHistory } from './VirtualizedConversationHistory'
import { formatDate, cn } from '@/lib/utils'
import type { Conversation } from '@/lib/types'

interface ConversationHistoryProps {
  onConversationSelect: (conversationId: string) => void
  className?: string
}

const VIRTUALIZATION_THRESHOLD = 50

export function ConversationHistory({ onConversationSelect, className }: ConversationHistoryProps) {
  const { conversations, activeConversationId, deleteConversation } = useChat()
  const { t, direction } = useLanguage()

  if (conversations.length > VIRTUALIZATION_THRESHOLD) {
    return (
      <VirtualizedConversationHistory
        onConversationSelect={onConversationSelect}
        className={className}
        height={400}
        itemHeight={80}
      />
    )
  }

  const handleConversationClick = (conversation: Conversation) => {
    onConversationSelect(conversation.id)
  }

  const handleDeleteConversation = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    
    if (confirm(t('chat.confirm.delete'))) {
      try {
        await deleteConversation(conversationId)
      } catch (error) {
        console.error('Failed to delete conversation:', error)
        alert(t('chat.error.delete') || 'Failed to delete conversation. Please try again.')
      }
    }
  }

  if (conversations.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
        <div className="text-4xl mb-3">💬</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
          {t('chat.no.conversations')}
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          {t('chat.start.conversation')}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('chat.conversations')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {conversations.length} {t('chat.conversations.count')}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeConversationId
            const lastMessage = conversation.messages[conversation.messages.length - 1]
            
            return (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                className={cn(
                  'group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors',
                  direction === 'rtl' && 'space-x-reverse',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {/* Conversation Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  <svg 
                    className={cn(
                      'w-5 h-5',
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    )} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-medium truncate',
                    isActive
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-gray-100'
                  )}>
                    {conversation.title}
                  </p>
                  
                  {lastMessage && (
                    <p className={cn(
                      'text-xs truncate mt-1',
                      isActive
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {lastMessage.sender === 'user' ? t('chat.you') : t('chat.assistant')}: {lastMessage.text}
                    </p>
                  )}
                  
                  <p className={cn(
                    'text-xs mt-1',
                    isActive
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {formatDate(conversation.updatedAt, direction === 'rtl' ? 'ar' : 'en')}
                  </p>
                </div>

                {/* Message Count */}
                <div className={cn(
                  'flex flex-col items-end space-y-1',
                  direction === 'rtl' && 'items-start'
                )}>
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}>
                    {conversation.messageCount !== undefined ? conversation.messageCount : conversation.messages.length}
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className={cn(
                      'opacity-0 group-hover:opacity-100 p-1 rounded-full transition-opacity',
                      'hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400'
                    )}
                    aria-label={t('chat.delete.conversation')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 